import fs from "node:fs";
import { GoogleGenAI } from "@google/genai";
import { Buffer } from "node:buffer";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
export const gemini = genAI;

/**
 * Generate an image and return as Buffer.
 * Uses Imagen model via Google Gen AI.
 */
export async function generateImageBuffer(
  prompt: string,
  size: "1024x1024" | "1024x1792" | "1792x1024" = "1024x1024"
): Promise<Buffer> {
  const response = await gemini.models.generateImages({
    model: "imagen-3.0-generate-001",
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: size === "1024x1024" ? "1:1" : size === "1024x1792" ? "9:16" : "16:9",
    },
  });

  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
  if (!imageBytes) {
    throw new Error("Failed to generate image: No image data returned");
  }

  return Buffer.from(imageBytes, "base64");
}

/**
 * Edit/combine multiple images into a composite.
 * Uses Imagen editing capabilities via Google Gen AI.
 */
export async function editImages(
  imageFiles: string[],
  prompt: string,
  outputPath?: string
): Promise<Buffer> {
  // Gemini expects FileSource or base64 for reference images
  const referenceImages = imageFiles.map((file) => ({
    image: {
      imageBytes: fs.readFileSync(file).toString("base64"),
      mimeType: "image/png",
    }
  }));

  const response = await gemini.models.editImage({
    model: "imagen-3.0-capability-001",
    prompt,
    referenceImages: referenceImages as any,
    config: {
      numberOfImages: 1,
    }
  });

  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
  if (!imageBytes) {
    throw new Error("Failed to edit image: No image data returned");
  }

  const imageBuffer = Buffer.from(imageBytes, "base64");

  if (outputPath) {
    fs.writeFileSync(outputPath, imageBuffer);
  }

  return imageBuffer;
}

