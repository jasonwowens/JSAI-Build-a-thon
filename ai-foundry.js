import dotenv from "dotenv";
dotenv.config();

import createClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const endpoint = process.env.AZURE_INFERENCE_SDK_ENDPOINT;
const apiKey = process.env.AZURE_INFERENCE_SDK_KEY;

console.log("✅ ENDPOINT:", endpoint);
console.log("✅ API KEY:", apiKey ? "Loaded" : "Missing");

if (!endpoint || !apiKey) {
  console.error("❌ Missing endpoint or API key in .env file");
  process.exit(1);
}

const client = createClient(endpoint, new AzureKeyCredential(apiKey));

const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "List 3 fun things to do in Seattle with short descriptions." },
];

try {
  const response = await client
    .path("/openai/deployments/gpt-4.1/chat/completions")
    .post({
      queryParameters: {
        "api-version": "2024-05-01-preview",
      },
      body: {
        messages,
        temperature: 0.7,
        max_tokens: 512,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

  const result = response.body ?? (await response.json?.());

  console.log("✅ FULL RESPONSE:");
  console.dir(result, { depth: null });

  console.log("\n✅ AI Message:");
  console.log(result?.choices?.[0]?.message?.content || "Still no response from model.");
} catch (error) {
  console.error("❌ Error during inference:");
  console.error(error);
}
