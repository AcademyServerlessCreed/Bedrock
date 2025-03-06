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

export const invokeModel = async (
  prompt: string,
  modelId = "anthropic.claude-3-haiku-20240307-v1:0"
) => {

  // Prepare the payload for the model.
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: prompt }],
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
// Example usage
const text = await invokeModel("What is AWS Bedrock?");
console.log(text);
