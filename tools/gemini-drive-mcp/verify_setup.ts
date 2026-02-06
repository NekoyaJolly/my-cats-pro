
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

// Paths relative to this script (tools/gemini-drive-mcp/verify_setup.ts)
const TOKEN_PATH = path.resolve(__dirname, "../../.oauth-token.json");
const CREDENTIALS_PATH = path.resolve(__dirname, "../../oauth-credentials.json");

console.log("🔍 Starting manual verification (API Key)...");
console.log(`📂 Folder ID: ${FOLDER_ID}`);
console.log(`🔑 API Key set: ${!!API_KEY}`);

async function verify() {
    if (!API_KEY) throw new Error("API Key missing");
    if (!FOLDER_ID) throw new Error("Folder ID missing");

    // 1. Drive Connection
    console.log("\n📡 Connecting to Google Drive...");
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
    const { client_id, client_secret } = credentials.installed || credentials.web;

    const auth = new google.auth.OAuth2(client_id, client_secret);
    auth.setCredentials({ refresh_token: token.refresh_token });
    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.list({
        q: `'${FOLDER_ID}' in parents and mimeType = 'text/markdown' and trashed = false`,
        fields: "files(id, name, size)",
    });

    const files = res.data.files || [];
    console.log(`✅ Found ${files.length} markdown files in Drive:`);
    files.forEach(f => console.log(`   - ${f.name} (${f.size} bytes)`));

    // 2. Gemini Connection
    console.log("\n🧠 Testing Gemini API Connection (gemini-3-flash-preview)...");

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const result = await model.generateContent("Hello, are you ready to analyze code?");
    console.log("✅ Gemini Response:", result.response.text());

    console.log("\n🎉 Verification Successful! The MCP server logic works.");
    console.log("👉 Please restart your editor to load the MCP config.");
}

verify().catch(e => {
    console.error("\n❌ Verification Failed:", e);
});
