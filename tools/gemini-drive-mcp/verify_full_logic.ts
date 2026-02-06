
import { google } from "googleapis";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

// ES module environment fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_KEY = process.env.GOOGLE_AI_API_KEY;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const MODEL_NAME = "gemini-3-flash-preview";

// Fix missing type definition in the library
declare module "@google/generative-ai" {
    interface ModelParams {
        systemInstruction?: string | any;
    }
}

// Paths relative to this script
const TOKEN_PATH = path.resolve(__dirname, "../../.oauth-token.json");
const CREDENTIALS_PATH = path.resolve(__dirname, "../../oauth-credentials.json");

console.log("🔍 Starting FULL verification (Gemini 3 - ALL FILES)...");
console.log(`📂 Folder ID: ${FOLDER_ID}`);
console.log(`🤖 Model: ${MODEL_NAME}`);

async function verifyFull() {
    if (!API_KEY) throw new Error("API Key missing");
    if (!FOLDER_ID) throw new Error("Folder ID missing");

    // 1. Setup Drive Client
    console.log("\n📡 Connecting to Google Drive...");
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
    const { client_id, client_secret } = credentials.installed || credentials.web;

    const auth = new google.auth.OAuth2(client_id, client_secret);
    auth.setCredentials({ refresh_token: token.refresh_token });
    const drive = google.drive({ version: "v3", auth });

    // 2. Fetch Files & Content
    console.log("📥 Fetching Domain files from Drive...");
    const res = await drive.files.list({
        q: `'${FOLDER_ID}' in parents and mimeType = 'text/markdown' and trashed = false`,
        fields: "files(id, name, size)",
    });

    const files = res.data.files || [];
    if (files.length === 0) throw new Error("No files found in Drive.");

    let contextData = "";
    console.log(`   Found ${files.length} files. Downloading content...`);

    for (const file of files) {
        if (!file.id || !file.name) continue;

        // NO FILTER: Loading ALL files for Ultra Plan
        process.stdout.write(`   - Retrieving ${file.name}... `);

        try {
            const contentRes = await drive.files.get({
                fileId: file.id,
                alt: "media",
            });

            const content = typeof contentRes.data === 'string' ? contentRes.data : JSON.stringify(contentRes.data);
            contextData += `=== FILE: ${file.name} ===\n${content}\n\n`;
            console.log("OK");
        } catch (e: any) {
            console.log(`Failed (${e.message})`);
        }
    }

    // 3. Prepare Gemini Request
    console.log("\n🧠 Preparing Gemini 3 Context...");
    const tokenEst = Math.round(contextData.length / 4);
    console.log(`   Total Checkt Size: ${Math.round(contextData.length / 1024)} KB (approx ${tokenEst} chars/tokens)`);



    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: "You are an expert coding assistant. Answer based on the provided codebase context."
    });

    // 4. Test Query
    const query = "このプロジェクトの全体像と、特に重要と思われるアーキテクチャ上の特徴を教えてください。";
    console.log(`\n❓ Sending Query: "${query}"`);

    const fullPrompt = `${contextData}\n\nUser Query: ${query}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;

    console.log("\n🤖 Gemini Answer:\n");
    console.log("--------------------------------------------------");
    console.log(response.text());
    console.log("--------------------------------------------------");

    console.log("\n🎉 Full Verification Successful!");
}

verifyFull().catch(e => {
    console.error("\n❌ Verification Failed:", e);
});
