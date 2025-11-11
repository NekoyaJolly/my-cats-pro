#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createWriteStream, writeFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");
const pnpmCommand = "pnpm";
const useShell = process.platform === "win32";
const processes = [];
let cleaningUp = false;

const promiseTimeout = (ms) => new Promise((resolveFn) => setTimeout(resolveFn, ms));

async function runCommand(command, args, { cwd, ignoreFailure = false } = {}) {
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: useShell,
    });

    child.on("error", (error) => {
      if (ignoreFailure) {
        resolvePromise();
        return;
      }
      rejectPromise(error);
    });

    child.on("close", (code) => {
      if (code === 0 || ignoreFailure) {
        resolvePromise();
        return;
      }
      rejectPromise(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

function safeRemove(path) {
  try {
    rmSync(path);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

function spawnBackground(label, command, args) {
  const stdoutPath = resolve(projectRoot, `${label}.out`);
  const stderrPath = resolve(projectRoot, `${label}.log`);
  const pidPath = resolve(projectRoot, `${label}.pid`);

  safeRemove(stdoutPath);
  safeRemove(stderrPath);
  safeRemove(pidPath);

  const child = spawn(command, args, {
    cwd: projectRoot,
    stdio: ["ignore", "pipe", "pipe"],
    shell: useShell,
  });

  const stdoutStream = createWriteStream(stdoutPath, { flags: "w" });
  const stderrStream = createWriteStream(stderrPath, { flags: "w" });

  child.stdout.on("data", (chunk) => {
    stdoutStream.write(chunk);
    process.stdout.write(`[${label}] ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    stderrStream.write(chunk);
    process.stderr.write(`[${label}] ${chunk}`);
  });

  child.on("close", (code) => {
    stdoutStream.end();
    stderrStream.end();
    safeRemove(pidPath);
    if (!cleaningUp) {
      console.error(`\n${label} exited with code ${code ?? "unknown"}`);
      cleanup("SIGTERM").finally(() => {
        process.exit(typeof code === "number" ? code : 1);
      });
    }
  });

  writeFileSync(pidPath, String(child.pid));

  processes.push({ label, child, stdoutStream, stderrStream, pidPath });

  console.log(`   ${label} PID: ${child.pid}`);
  console.log(`   Logs: ${stdoutPath} / ${stderrPath}`);

  return child;
}

async function waitForHttp(url, retries, delayMs) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Intentionally ignore fetch errors during polling.
    }
    await promiseTimeout(delayMs);
  }
  return false;
}

async function cleanup(signal = "SIGINT") {
  if (cleaningUp) {
    return;
  }
  cleaningUp = true;

  for (const proc of processes) {
    if (!proc.child.killed) {
      try {
        proc.child.kill(signal);
      } catch (error) {
        // If the process is already gone we can ignore the error.
      }
    }
    proc.stdoutStream.end();
    proc.stderrStream.end();
    safeRemove(proc.pidPath);
  }
}

async function main() {
  console.log("\nStarting MyCats Development Environment (Stable Mode)");
  console.log("====================================================\n");

  console.log("Cleaning up ports...");
  await runCommand(pnpmCommand, ["run", "predev"], { cwd: projectRoot, ignoreFailure: true });
  console.log("");

  console.log("Starting backend server...");
  spawnBackground("backend", pnpmCommand, ["run", "backend:dev"]);
  console.log("");

  console.log("Waiting for backend to start...");
  const backendReady = await waitForHttp("http://localhost:3004/health", 30, 1000);
  if (!backendReady) {
    console.error("Backend failed to start within 30 seconds\n   Check backend.log for errors");
    await cleanup("SIGTERM");
    process.exit(1);
  }
  console.log("Backend is ready!\n");

  console.log("Starting frontend server...");
  spawnBackground("frontend", pnpmCommand, ["run", "frontend:dev:wait"]);
  console.log("");

  console.log("Waiting for frontend to start...");
  const frontendReady = await waitForHttp("http://localhost:3000", 30, 1000);
  if (frontendReady) {
    console.log("Frontend is ready!\n");
  } else {
    console.log("Frontend might still be starting (this can be normal)\n   Check frontend.log if issues persist\n");
  }

  console.log("Development servers are running!\n");
  console.log("Available endpoints:");
  console.log("   Backend:  http://localhost:3004");
  console.log("   Frontend: http://localhost:3000");
  console.log("   API Docs: http://localhost:3004/api/docs");
  console.log("   Health:   http://localhost:3004/health\n");
  console.log("Process IDs saved to:");
  console.log("   backend.pid");
  console.log("   frontend.pid\n");
  console.log("To stop servers:");
  console.log("   npm run dev:stop");
  console.log("   or terminate the PIDs listed in backend.pid and frontend.pid\n");
  console.log("To view logs:");
  console.log("   backend.out    (backend stdout)");
  console.log("   backend.log    (backend stderr)");
  console.log("   frontend.out   (frontend stdout)");
  console.log("   frontend.log   (frontend stderr)\n");
}

process.on("SIGINT", async () => {
  await cleanup("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await cleanup("SIGTERM");
  process.exit(0);
});

main().catch(async (error) => {
  console.error("Unexpected error during startup:", error);
  await cleanup("SIGTERM");
  process.exit(1);
});
