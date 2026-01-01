import { pipeline, env } from "@huggingface/transformers";

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export interface RemovalResult {
  blob: Blob;
  maskData: Float32Array;
  width: number;
  height: number;
  originalImage: HTMLImageElement;
}

export const removeBackground = async (
  imageElement: HTMLImageElement,
  onProgress?: (progress: number) => void,
): Promise<RemovalResult> => {
  try {
    console.log("Starting background removal process...");
    onProgress?.(20);

    const segmenter = await pipeline("image-segmentation", "Xenova/segformer-b0-finetuned-ade-512-512", {
      device: "webgpu",
    });

    onProgress?.(60);

    // Convert HTMLImageElement to canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Could not get canvas context");

    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? "was" : "was not"} resized. Final dimensions: ${canvas.width}x${canvas.height}`);

    // Get image data as base64
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    console.log("Image converted to base64");

    onProgress?.(50);

    // Process the image with the segmentation model
    console.log("Processing with segmentation model...");
    const result = await segmenter(imageData);

    onProgress?.(80);

    console.log("Segmentation result:", result);

    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error("Invalid segmentation result");
    }

    // Store the mask data for later editing
    const maskData = new Float32Array(result[0].mask.data);

    // Create the result blob
    const blob = await applyMaskToImage(canvas, maskData);

    onProgress?.(100);

    return {
      blob,
      maskData,
      width: canvas.width,
      height: canvas.height,
      originalImage: imageElement,
    };
  } catch (error) {
    console.error("Error removing background:", error);
    throw error;
  }
};

// Apply a mask to an image and return a blob
export const applyMaskToImage = async (
  canvas: HTMLCanvasElement,
  maskData: Float32Array
): Promise<Blob> => {
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = canvas.width;
  outputCanvas.height = canvas.height;
  const outputCtx = outputCanvas.getContext("2d");

  if (!outputCtx) throw new Error("Could not get output canvas context");

  // Draw original image
  outputCtx.drawImage(canvas, 0, 0);

  // Apply the mask
  const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
  const data = outputImageData.data;

  // Apply inverted mask to alpha channel
  for (let i = 0; i < maskData.length; i++) {
    // Invert the mask value (1 - value) to keep the subject instead of the background
    const alpha = Math.round((1 - maskData[i]) * 255);
    data[i * 4 + 3] = alpha;
  }

  outputCtx.putImageData(outputImageData, 0, 0);
  console.log("Mask applied successfully");

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    outputCanvas.toBlob(
      (blob) => {
        if (blob) {
          console.log("Successfully created final blob");
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      "image/png",
      1.0,
    );
  });
};

// Apply mask from editor and generate new blob
export const applyEditedMask = async (
  originalImage: HTMLImageElement,
  maskData: Float32Array,
  width: number,
  height: number
): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(originalImage, 0, 0, width, height);

  return applyMaskToImage(canvas, maskData);
};

export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const convertBlobToFormat = (
  blob: Blob,
  format: "png" | "jpeg" | "webp",
  quality: number = 0.92,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // For JPEG, fill with white background since it doesn't support transparency
      if (format === "jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (newBlob) => {
          if (newBlob) {
            resolve(newBlob);
          } else {
            reject(new Error("Failed to convert image"));
          }
        },
        `image/${format}`,
        quality,
      );
    };
    img.onerror = () => reject(new Error("Failed to load image for conversion"));
    img.src = URL.createObjectURL(blob);
  });
};
