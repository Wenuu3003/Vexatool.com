/** Decode browser-supported images with bounded loading and deterministic cleanup. */
export async function imageToPng(file: Blob): Promise<Uint8Array> {
  const url = URL.createObjectURL(file);
  const img = document.createElement('img');
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image is corrupt or unsupported by this browser.'));
      timer = setTimeout(() => reject(new Error('Image loading timed out.')), 15000);
      img.src = url;
    });
    if (!img.naturalWidth || !img.naturalHeight) throw new Error('Image has no pixels.');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable.');
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image conversion failed.')), 'image/png');
    });
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    clearTimeout(timer);
    img.onload = null;
    img.onerror = null;
    img.removeAttribute('src');
    URL.revokeObjectURL(url);
  }
}
