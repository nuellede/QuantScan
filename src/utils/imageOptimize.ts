export const MAX_VERCEL_SAFE_IMAGE_BYTES = 2_400_000;
export const MAX_CHART_DIMENSION_PX = 1600;

export function computeTargetDimensions(
  width: number,
  height: number,
  maxDim: number = MAX_CHART_DIMENSION_PX
): { width: number; height: number } {
  if (width <= 0 || height <= 0) {
    return { width: maxDim, height: maxDim };
  }
  const largest = Math.max(width, height);
  if (largest <= maxDim) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  const scale = maxDim / largest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export async function optimizeChartImageFile(file: File): Promise<{
  base64: string;
  mimeType: string;
  dataUrl: string;
}> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });

  // If already compact enough for Vercel serverless payload limits, keep original quality
  if (file.size <= MAX_VERCEL_SAFE_IMAGE_BYTES) {
    const commaIdx = rawDataUrl.indexOf(',');
    return {
      base64: commaIdx >= 0 ? rawDataUrl.slice(commaIdx + 1) : rawDataUrl,
      mimeType: file.type || 'image/png',
      dataUrl: rawDataUrl,
    };
  }

  return await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const target = computeTargetDimensions(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = target.width;
      canvas.height = target.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const commaIdx = rawDataUrl.indexOf(',');
        resolve({
          base64: commaIdx >= 0 ? rawDataUrl.slice(commaIdx + 1) : rawDataUrl,
          mimeType: file.type || 'image/png',
          dataUrl: rawDataUrl,
        });
        return;
      }
      ctx.drawImage(img, 0, 0, target.width, target.height);
      const outMime = 'image/jpeg';
      const outDataUrl = canvas.toDataURL(outMime, 0.86);
      const commaIdx = outDataUrl.indexOf(',');
      resolve({
        base64: commaIdx >= 0 ? outDataUrl.slice(commaIdx + 1) : outDataUrl,
        mimeType: outMime,
        dataUrl: outDataUrl,
      });
    };
    img.onerror = () => {
      const commaIdx = rawDataUrl.indexOf(',');
      resolve({
        base64: commaIdx >= 0 ? rawDataUrl.slice(commaIdx + 1) : rawDataUrl,
        mimeType: file.type || 'image/png',
        dataUrl: rawDataUrl,
      });
    };
    img.src = rawDataUrl;
  });
}
