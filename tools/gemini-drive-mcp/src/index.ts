#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { google } from "googleapis";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GOOGLE_AI_API_KEY;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "my-cats-pro"; // For logging
const TOKEN_PATH = process.env.GOOGLE_DRIVE_OAUTH_TOKEN_PATH || path.resolve(process.cwd(), "../../.oauth-token.json");
const CREDENTIALS_PATH = process.env.GOOGLE_DRIVE_CREDENTIALS_PATH || path.resolve(process.cwd(), "../../oauth-credentials.json");

if (!API_KEY) {
    console.error("GOOGLE_AI_API_KEY is required");
    process.exit(1);
}

// Global state
let cachedContextParts: any[] = [];
let lastSyncTime: Date | null = null;
let cachedContentNames: string[] = [];

// Initialize clients
// Using @google/generative-ai v0.24.1+
const genAI = new GoogleGenerativeAI(API_KEY);
const modelName = "gemini-3-flash-preview";

function getDriveClient() {
    if (!fs.existsSync(TOKEN_PATH) || !fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error("OAuth token or credentials file not found");
    }

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
    const { client_id, client_secret } = credentials.installed || credentials.web;

    const auth = new google.auth.OAuth2(client_id, client_secret);
    auth.setCredentials({
        refresh_token: token.refresh_token,
    });

    return google.drive({ version: "v3", auth });
}

// Helper: Fetch markdown files from Drive folder
async function fetchDomainFiles(folderId: string) {
    const drive = getDriveClient();
    const files: { name: string; content: string }[] = [];

    try {
        const res = await drive.files.list({
            q: `'${folderId}' in parents and mimeType = 'text/markdown' and trashed = false`,
            fields: "files(id, name)",
        });

        const fileList = res.data.files || [];
        console.error(`Found ${fileList.length} files in Drive folder.`);

        for (const file of fileList) {
            if (!file.id || !file.name) continue;

            const contentRes = await drive.files.get({
                fileId: file.id,
                alt: "media",
            });

            const content = typeof contentRes.data === 'string' ? contentRes.data : JSON.stringify(contentRes.data);

            files.push({
                name: file.name,
                content: content,
            });
            console.error(`Fetched: ${file.name}`);
        }
    } catch (error) {
        console.error("Error fetching files from Drive:", error);
        throw error;
    }
    return files;
}

// Helper: Refresh Context Cache
async function refreshContext() {
    if (!FOLDER_ID) {
        throw new Error("GOOGLE_DRIVE_FOLDER_ID is not set");
    }

    console.error("Refreshing context from Google Drive...");
    const files = await fetchDomainFiles(FOLDER_ID);

    if (files.length === 0) {
        return "No markdown files found in the specified Drive folder.";
    }

    // Pre-formatting context for easier consumption
    cachedContextParts = [
        `You are an expert AI coding assistant for the 'my-cats-pro' project.
You have access to the latest codebase definitions through the following domain files.
Always base your answers on this context.`
    ];

    for (const f of files) {
        cachedContextParts.push(`=== FILE: ${f.name} ===\n${f.content}\n`);
    }

    lastSyncTime = new Date();
    cachedContentNames = files.map(f => f.name);

    return `Successfully loaded ${files.length} files: ${cachedContentNames.join(", ")}`;
}

// MCP Server Setup
const server = new Server(
    {
        name: "gemini-drive-mcp",
        version: "0.3.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "analyze_codebase",
                description: "Ask a question about the codebase based on the latest files in Google Drive.",
                inputSchema: zodToJsonSchema(
                    z.object({
                        query: z.string().describe("The question or analysis request"),
                    })
                ),
            },
            {
                name: "refresh_context",
                description: "Reload the latest domain files from Google Drive to update the AI's context.",
                inputSchema: zodToJsonSchema(z.object({})),
            },
            {
                name: "get_status",
                description: "Check the status of the loaded context.",
                inputSchema: zodToJsonSchema(z.object({})),
            }
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
        case "analyze_codebase": {
            const { query } = request.params.arguments as { query: string };

            if (cachedContextParts.length === 0) {
                try {
                    await refreshContext();
                } catch (e: any) {
                    return {
                        content: [{ type: "text", text: `Error loading context: ${e.message}` }],
                        isError: true,
                    };
                }
            }

            try {
                // Prepare system instruction separately
                const systemInstruction = cachedContextParts[0]; // First part is system instruction
                const contextData = cachedContextParts.slice(1).join("\n"); // All files combined

                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: systemInstruction
                });

                // Combine context data and query into user prompt
                // Sending massive context in one go
                const fullPrompt = `${contextData}\n\nUser Query: ${query}`;

                const result = await model.generateContent(fullPrompt);
                const response = result.response;
                return {
                    content: [
                        {
                            type: "text",
                            text: response.text(),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Gemini API Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        case "refresh_context": {
            try {
                const result = await refreshContext();
                return {
                    content: [{ type: "text", text: result }],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error refreshing context: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        case "get_status": {
            const status = lastSyncTime
                ? `Context loaded at ${lastSyncTime.toISOString()}.\nFiles: ${cachedContentNames.join(", ")}\nModel: ${modelName}`
                : "Context not loaded yet.";

            return {
                content: [{ type: "text", text: status }]
            };
        }

        default:
            throw new Error("Unknown tool");
    }
});

function zodToJsonSchema(schema: any): any {
    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        const properties: any = {};
        const required: string[] = [];

        for (const [key, value] of Object.entries(shape)) {
            properties[key] = { type: "string" };
            if (!(value as any).isOptional()) {
                required.push(key);
            }
        }
        return { type: "object", properties, required };
    }
    return { type: "object" };
}

async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`Gemini Drive MCP Server (${modelName}) running on stdio`);
}

run().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
