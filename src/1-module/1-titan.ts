import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { keys } from "../keys.js";

// Initialize AWS Bedrock Client
const bedrockClient = new BedrockRuntimeClient({
  region: keys.AWS_REGION,
  credentials: {
    accessKeyId: keys.AWS_ACCESS_KEY_ID,
    secretAccessKey: keys.AWS_SECRET_ACCESS_KEY,
  },
});

// Define available models
const modelId = "amazon.titan-text-express-v1";

// Function to generate text using Bedrock
async function generateText(prompt: string) {
  const payload = {
    inputText: prompt,
    textGenerationConfig: {
      maxTokenCount: 100, // Adjust based on model requirements
      stopSequences: [],
      temperature: 0,
      topP: 1,
    },
  };

  try {
    const command = new InvokeModelCommand({
      modelId: modelId, // Select model
      contentType: "application/json",
      accept: "application/json", // Specify the accept header
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);

    if (response.body) {
      const responseData = await response.body.transformToString();
      console.log(JSON.parse(responseData));
      const text = JSON.parse(responseData).results[0].outputText;
      return text;
    } else {
      console.log("No response body received.");
    }
  } catch (error) {
    console.error("Error invoking model:", error);
  }
}

const text = await generateText("What is AWS Bedrock?");
console.log(text);
