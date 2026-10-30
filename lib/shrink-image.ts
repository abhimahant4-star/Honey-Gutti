/** Shrinks a photo in the browser (max 1600 px wide) so uploads are small and pages stay fast. */
export async function shrinkImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("This file doesn't look like a photo."));
      i.src = url;
    });
    const scale = Math.min(1, 1600 / img.naturalWidth);
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser can't prepare this photo.");
    ctx.fillStyle = "#ffffff"; // transparent PNGs get a white background
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    const toBlob = (type: string, q: number) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, q));
    let blob = await toBlob("image/webp", 0.82);
    if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg", 0.85); // older Safari
    if (!blob) throw new Error("Couldn't prepare this photo.");
    return { blob, width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}
