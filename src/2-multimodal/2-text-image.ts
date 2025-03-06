// This file is used to generate an image from a text prompt using AWS Bedrock.

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { keys } from "../keys.js";
import fs from "fs";
import path from "path";

// Initialize AWS Bedrock Client
const bedrockClient = new BedrockRuntimeClient({
  region: keys.AWS_REGION,
  credentials: {
    accessKeyId: keys.AWS_ACCESS_KEY_ID,
    secretAccessKey: keys.AWS_SECRET_ACCESS_KEY,
  },
});

// Define the model ID for Titan Image Generator
const modelId = "amazon.titan-image-generator-v1";

/**
 * Generate images from a text prompt using AWS Bedrock Titan Image Generator
 * @param prompt Text prompt to generate images from
 * @param options Additional options for image generation
 * @returns Array of base64 encoded images
 */
async function generateImage(
  prompt: string,
  options = {
    cfgScale: 8,
    seed: 42,
    quality: "standard",
    width: 1024,
    height: 1024,
    numberOfImages: 1,
  }
) {
  const payload = {
    textToImageParams: {
      text: prompt,
    },
    taskType: "TEXT_IMAGE",
    imageGenerationConfig: {
      cfgScale: options.cfgScale,
      seed: options.seed,
      quality: options.quality,
      width: options.width,
      height: options.height,
      numberOfImages: options.numberOfImages,
    },
  };

  try {
    const command = new InvokeModelCommand({
      modelId: modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);

    if (response.body) {
      const responseData = await response.body.transformToString();
      const parsedResponse = JSON.parse(responseData);

      // Save images to disk and return their paths
      if (parsedResponse.images && parsedResponse.images.length > 0) {
        const savedImagePaths = [];
        const outputDir = path.join(process.cwd(), "output");

        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        // Save each image
        for (let i = 0; i < parsedResponse.images.length; i++) {
          const base64Image = parsedResponse.images[i];
          const imagePath = path.join(
            outputDir,
            `generated-image-${Date.now()}-${i}.png`
          );

          // Convert base64 to image file and save
          fs.writeFileSync(imagePath, Buffer.from(base64Image, "base64"));
          savedImagePaths.push(imagePath);
        }

        console.log(`Generated ${savedImagePaths.length} images`);
        return {
          images: parsedResponse.images,
          paths: savedImagePaths,
        };
      } else {
        console.log("No images returned in the response");
        return { images: [], paths: [] };
      }
    } else {
      console.log("No response body received.");
      return { images: [], paths: [] };
    }
  } catch (error) {
    console.error("Error generating images:", error);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    const result = await generateImage(
      "A image of an engineer working on a laptop at night",
      {
        cfgScale: 8,
        seed: 42,
        quality: "standard",
        width: 1024,
        height: 1024,
        numberOfImages: 3,
      }
    );

    console.log(`Successfully generated ${result.images.length} images`);
    console.log(`Images saved at: ${result.paths.join(", ")}`);
  } catch (error) {
    console.error("Failed to generate images:", error);
  }
}

main();
