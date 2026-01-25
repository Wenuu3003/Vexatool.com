import { pipeline, env } from "@huggingface/transformers";

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

// Cache the segmenter to avoid reloading the model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedSegmenter: any = null;

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

// Check if device is mobile
function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Check if WebGPU is available AND working properly
async function isWebGPUAvailable(): Promise<boolean> {
  // Force WASM on mobile devices - WebGPU is unstable on mobile browsers
  if (isMobileDevice()) {
    console.log("Mobile device detected, using WASM for stability");
    return false;
  }
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    if (!nav.gpu) return false;
    
    const adapter = await nav.gpu.requestAdapter();
    if (!adapter) return false;
    
    // Test if device can actually create buffers (some implementations fail here)
    const device = await adapter.requestDevice();
    if (!device) return false;
    
    // Try creating a small test buffer to verify WebGPU actually works
    try {
      const testBuffer = device.createBuffer({
        size: 64,
        usage: 1, // GPUBufferUsage.MAP_READ
        mappedAtCreation: true,
      });
      testBuffer.unmap();
      testBuffer.destroy();
      device.destroy();
      return true;
    } catch (bufferError) {
      console.log("WebGPU buffer creation failed, falling back to WASM:", bufferError);
      device.destroy();
      return false;
    }
  } catch (e) {
    console.log("WebGPU not available:", e);
    return false;
  }
}

export const removeBackground = async (
  imageElement: HTMLImageElement,
  onProgress?: (progress: number) => void,
): Promise<RemovalResult> => {
  // Use stable progress updates with a reference to prevent flickering
  let currentProgress = 0;
  const updateProgress = (value: number) => {
    // Only update if new value is greater (never go backwards)
    if (value > currentProgress) {
      currentProgress = value;
      onProgress?.(value);
    }
  };

  try {
    console.log("Starting background removal process...");
    updateProgress(5);

    // Use cached segmenter or create new one
    if (!cachedSegmenter) {
      console.log("Loading segmentation model...");
      updateProgress(10);
      
      const hasWebGPU = await isWebGPUAvailable();
      console.log(`WebGPU available: ${hasWebGPU}`);
      
      // Use Xenova/modnet - a much faster and lighter model (~25MB vs ~170MB for RMBG)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cachedSegmenter = await pipeline(
        "image-segmentation",
        "Xenova/modnet",
        {
          device: hasWebGPU ? "webgpu" : "wasm",
          // Progress callback for model download
          progress_callback: (progress: { progress?: number; status?: string }) => {
            if (progress.progress !== undefined) {
              // Map download progress to 10-40% (smooth progression)
              const downloadProgress = Math.round(10 + progress.progress * 0.30);
              updateProgress(downloadProgress);
            }
          },
        }
      ) as any;
      console.log("Model loaded successfully");
    }

    updateProgress(45);

    // Convert HTMLImageElement to canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Could not get canvas context");

    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? "was" : "was not"} resized. Final dimensions: ${canvas.width}x${canvas.height}`);

    // Get image data as base64
    const imageData = canvas.toDataURL("image/png");
    console.log("Image converted to base64");

    updateProgress(55);

    // Process the image with the segmentation model
    console.log("Processing with background removal model...");
    
    // Start a smooth progress animation during segmentation
    let segmentationComplete = false;
    const progressInterval = setInterval(() => {
      if (!segmentationComplete && currentProgress < 75) {
        updateProgress(currentProgress + 2);
      }
    }, 200);
    
    const result = await cachedSegmenter(imageData);
    segmentationComplete = true;
    clearInterval(progressInterval);

    updateProgress(85);

    console.log("Segmentation result:", result);

    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error("Invalid segmentation result");
    }

    // ModNet returns a foreground mask where values near 1 = subject (keep), 0 = background (remove)
    const maskData = new Float32Array(result[0].mask.data);

    updateProgress(92);

    // Create the result blob - ModNet uses foreground mask like RMBG
    const blob = await applyMaskToImage(canvas, maskData, true);

    updateProgress(100);

    return {
      blob,
      maskData,
      width: canvas.width,
      height: canvas.height,
      originalImage: imageElement,
    };
  } catch (error) {
    console.error("Error removing background:", error);
    // Clear cache on error so it can retry
    cachedSegmenter = null;
    throw error;
  }
};

// Apply a mask to an image and return a blob
// isForegroundMask: true for RMBG model (1 = keep subject), false for inverted mask
export const applyMaskToImage = async (
  canvas: HTMLCanvasElement,
  maskData: Float32Array,
  isForegroundMask: boolean = true
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

  // Apply mask to alpha channel
  for (let i = 0; i < maskData.length; i++) {
    // For RMBG model: mask value 1 = foreground (keep), 0 = background (remove)
    // For other models: invert the mask
    const alpha = isForegroundMask 
      ? Math.round(maskData[i] * 255) 
      : Math.round((1 - maskData[i]) * 255);
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

  // Use foreground mask (RMBG format)
  return applyMaskToImage(canvas, maskData, true);
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

// Apply a custom background (color or image) to a transparent image
export const applyCustomBackground = async (
  transparentBlob: Blob,
  background: { type: 'color'; value: string } | { type: 'image'; value: string },
  outputFormat: "png" | "jpeg" | "webp" = "png"
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Apply background
      if (background.type === 'color') {
        ctx.fillStyle = background.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error("Failed to create blob")),
          `image/${outputFormat}`,
          0.92
        );
      } else {
        // Load background image
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
          // Draw background image scaled to cover canvas
          const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
          const bgWidth = bgImg.width * scale;
          const bgHeight = bgImg.height * scale;
          const bgX = (canvas.width - bgWidth) / 2;
          const bgY = (canvas.height - bgHeight) / 2;
          
          ctx.drawImage(bgImg, bgX, bgY, bgWidth, bgHeight);
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error("Failed to create blob")),
            `image/${outputFormat}`,
            0.92
          );
        };
        bgImg.onerror = () => reject(new Error("Failed to load background image"));
        bgImg.src = background.value;
      }
    };
    img.onerror = () => reject(new Error("Failed to load transparent image"));
    img.src = URL.createObjectURL(transparentBlob);
  });
};
