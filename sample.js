import * as dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

// Load .env using full path (for ESM support)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

console.log("✅ GITHUB_TOKEN loaded:", process.env.GITHUB_TOKEN ? "Yes" : "No");

// Configuration
const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "meta/Llama-4-Maverick-17B-128E-Instruct-FP8";

// Load and encode image
const imagePath = join(__dirname, "contoso_layout_sketch.jpg");
let imageData;
try {
  imageData = fs.readFileSync(imagePath).toString("base64");
} catch (e) {
  console.error("❌ Error reading image file:", e.message);
  process.exit(1);
}

// Main execution
export async function main() {
  try {
    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Convert this hand-drawn sketch into a responsive HTML layout." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageData}` } }
            ]
          }
        ],
        temperature: 0.5,
        top_p: 1.0,
        model: model
      }
    });

    if (isUnexpected(response)) {
      console.error("❌ API returned an error response:");
      console.dir(response.body, { depth: null });
      return;
    }

    console.log("\n🧠 HTML Output:\n");
    console.log(response.body.choices[0].message.content);
  } catch (err) {
    console.error("❌ Exception caught in try/catch:");
    console.dir(err, { depth: null });
  }
}

// Run the function
main();
