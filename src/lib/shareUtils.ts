import html2canvas from "html2canvas";

export interface ShareOptions {
  title: string;
  text: string;
  fileName: string;
}

/**
 * Check if Web Share API with file sharing is supported
 */
export const canShareFiles = (): boolean => {
  return !!(navigator.share && navigator.canShare);
};

/**
 * Generate a canvas from a DOM element
 */
export const captureElement = async (
  element: HTMLElement,
  options: {
    backgroundColor: string;
    width: number;
    height: number;
  }
): Promise<HTMLCanvasElement> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const canvas = await html2canvas(element, {
    backgroundColor: options.backgroundColor,
    scale: 2,
    useCORS: true,
    logging: false,
    allowTaint: true,
    width: options.width,
    height: options.height,
    windowWidth: options.width,
    windowHeight: options.height,
  });
  
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = options.width;
  finalCanvas.height = options.height;
  const ctx = finalCanvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }
  
  ctx.drawImage(canvas, 0, 0, options.width, options.height);
  
  return finalCanvas;
};

/**
 * Convert canvas to File object
 */
export const canvasToFile = (canvas: HTMLCanvasElement, fileName: string): Promise<File> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], fileName, { type: 'image/png' });
        resolve(file);
      } else {
        reject(new Error('Failed to create blob'));
      }
    }, 'image/png', 1.0);
  });
};

/**
 * Download a canvas as PNG
 */
export const downloadCanvas = (canvas: HTMLCanvasElement, fileName: string): void => {
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, 'image/png', 1.0);
};

/**
 * Share image via Web Share API or fallback to download
 */
export const shareOrDownloadImage = async (
  element: HTMLElement,
  captureOptions: {
    backgroundColor: string;
    width: number;
    height: number;
  },
  shareOptions: ShareOptions
): Promise<{ shared: boolean; downloaded: boolean }> => {
  const canvas = await captureElement(element, captureOptions);
  
  // Try Web Share API with file
  if (canShareFiles()) {
    try {
      const file = await canvasToFile(canvas, shareOptions.fileName);
      const shareData = {
        title: shareOptions.title,
        text: shareOptions.text,
        files: [file],
      };
      
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return { shared: true, downloaded: false };
      }
    } catch (error: any) {
      // User cancelled or share failed - fall through to download
      if (error.name === 'AbortError') {
        return { shared: false, downloaded: false };
      }
      console.log('Web Share failed, falling back to download:', error);
    }
  }
  
  // Fallback to download
  downloadCanvas(canvas, shareOptions.fileName);
  return { shared: false, downloaded: true };
};
