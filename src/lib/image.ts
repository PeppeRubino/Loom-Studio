interface CompressResult {
  blob: Blob;
  dataUrl: string;
}

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const toDataUrl = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<string> =>
  new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => {
        if (!b) {
          reject(new Error('Canvas blob not available'));
          return;
        }
        blobToDataUrl(b).then(resolve).catch(reject);
      },
      type,
      quality
    )
  );

export const compressImage = async (
  file: File,
  { maxSize = 1280, quality = 0.76 }: { maxSize?: number; quality?: number } = {}
): Promise<CompressResult> => {
  const imageBitmap = await createImageBitmap(file);
  const ratio = Math.min(maxSize / imageBitmap.width, maxSize / imageBitmap.height, 1);
  const width = Math.round(imageBitmap.width * ratio);
  const height = Math.round(imageBitmap.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  ctx.drawImage(imageBitmap, 0, 0, width, height);

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b || file), 'image/webp', quality)
  );
  const dataUrl = await toDataUrl(canvas, 'image/webp', quality);
  return { blob, dataUrl };
};

export interface UploadResult {
  url: string;
  provider: string;
  providerId?: string;
  deleteUrl?: string;
  uploadedAt?: string;
}

const removeBgApiKey = import.meta.env.VITE_REMOVEBG_API_KEY;

const blobToArrayBuffer = (blob: Blob) =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

export const removeBackground = async (blob: Blob): Promise<Blob> => {
  if (!removeBgApiKey) return blob;
  try {
    const form = new FormData();
    form.append('image_file', new File([await blobToArrayBuffer(blob)], 'upload.webp', { type: blob.type || 'image/webp' }));
    form.append('size', 'auto');
    const res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': removeBgApiKey },
      body: form,
    });
    if (!res.ok) throw new Error('remove.bg failed');
    const out = await res.blob();
    return out.size ? out : blob;
  } catch (err) {
    console.warn('removeBackground fallback', err);
    return blob;
  }
};

const uploadToImgbb = async (blob: Blob, apiKey: string): Promise<UploadResult> => {
  const form = new FormData();
  form.append('image', blob);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Upload imgbb fallito');
  const json = await res.json();
  const data = json?.data;
  return {
    url: data?.url,
    provider: 'imgbb',
    providerId: data?.id,
    deleteUrl: data?.delete_url,
    uploadedAt: new Date().toISOString(),
  };
};

export const uploadImage = async (blob: Blob, opts?: { removeBackground?: boolean }): Promise<UploadResult> => {
  let toUpload = blob;
  if (opts?.removeBackground) {
    toUpload = await removeBackground(blob);
  }
  const key = import.meta.env.VITE_IMGBB_API_KEY;
  if (key) {
    try {
      return await uploadToImgbb(toUpload, key);
    } catch (err) {
      console.warn('Upload imgbb fallito, uso provider local', err);
    }
  }
  const dataUrl = await blobToDataUrl(toUpload);
  return { url: dataUrl, provider: 'local', uploadedAt: new Date().toISOString() };
};
