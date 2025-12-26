// Shared image compression helper used across tools
// Uses canvas re-encode + optional resize, and picks the smallest result from a few attempts.

export type CompressImageOptions = {
  /** 10-100 */
  quality: number;
  /** Max pixel width/height (keeps aspect ratio). Default: 2048 */
  maxDimension?: number;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const isWebpSupported = (() => {
  try {
    const canvas = document.createElement("canvas");
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
})();

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode image"));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";

    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };

    img.src = url;
  });
}

export async function compressImageFile(
  file: File,
  opts: CompressImageOptions
): Promise<{ blob: Blob; outputType: string }> {
  const quality = clamp(opts.quality, 10, 100) / 100;
  const maxDimension = opts.maxDimension ?? 2048;

  const img = await loadImageFromFile(file);

  // Resize (optional)
  let width = img.width;
  let height = img.height;

  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      height = Math.round((height / width) * maxDimension);
      width = maxDimension;
    } else {
      width = Math.round((width / height) * maxDimension);
      height = maxDimension;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  const inputType = file.type || "image/jpeg";

  // Candidate output formats
  const typeCandidates: string[] = (() => {
    if (inputType === "image/png") {
      // PNG is lossless; re-encoding often won't shrink. Prefer WebP if supported.
      return isWebpSupported ? ["image/webp", "image/png"] : ["image/png"];
    }

    if (inputType === "image/webp") {
      return isWebpSupported ? ["image/webp", "image/jpeg"] : ["image/jpeg"];
    }

    if (inputType === "image/jpeg") {
      return ["image/jpeg"];
    }

    // Other image types (gif, bmp, etc.)
    return isWebpSupported ? ["image/webp", "image/jpeg"] : ["image/jpeg"];
  })();

  let bestBlob: Blob | null = null;
  let bestType = typeCandidates[0];

  for (const outType of typeCandidates) {
    const qualityAttempts = outType === "image/png"
      ? [undefined]
      : [quality, Math.max(0.25, quality - 0.15), Math.max(0.25, quality - 0.3)];

    for (const q of qualityAttempts) {
      try {
        const blob = await canvasToBlob(canvas, outType, q);
        if (!bestBlob || blob.size < bestBlob.size) {
          bestBlob = blob;
          bestType = outType;
        }
      } catch {
        // ignore and try next candidate
      }
    }
  }

  if (!bestBlob) {
    // Very rare: all encodes failed.
    throw new Error("Could not compress image");
  }

  return { blob: bestBlob, outputType: bestType };
}
