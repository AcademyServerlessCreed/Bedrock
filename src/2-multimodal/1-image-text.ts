import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { keys } from "../keys.js";
import fs from "fs";
const GoldenRetrieverImage = fs.readFileSync("./images/golden.jpeg");
const GoldenRetrieverImageBase64 = GoldenRetrieverImage.toString("base64");
const PikachuImage = fs.readFileSync("./images/pikachu.jpeg");
const PikachuImageBase64 = PikachuImage.toString("base64");

// Initialize AWS Bedrock Client
const bedrockClient = new BedrockRuntimeClient({
  region: keys.AWS_REGION,
  credentials: {
    accessKeyId: keys.AWS_ACCESS_KEY_ID,
    secretAccessKey: keys.AWS_SECRET_ACCESS_KEY,
  },
});

export const invokeModelWithImage = async (
  imageBase64: string, // Base64 encoded image data as placeholder for now
  prompt: string,
  modelId = "anthropic.claude-3-sonnet-20240229-v1:0"
) => {
  // Prepare the payload for the model.
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  };

  // Invoke Claude with the payload and wait for the response.
  const command = new InvokeModelCommand({
    contentType: "application/json",
    body: JSON.stringify(payload),
    modelId,
  });
  const apiResponse = await bedrockClient.send(command);

  // Decode and return the response(s)
  const decodedResponseBody = new TextDecoder().decode(apiResponse.body);
  const responseBody = JSON.parse(decodedResponseBody);
  return responseBody.content[0].text;
};

const base64Image = [GoldenRetrieverImageBase64, PikachuImageBase64];
// Example usage
const result = await invokeModelWithImage(
  base64Image[1],
  "What's in this image?"
);
console.log(result);
