// src/lib/imageUtils.js
export async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve({
        dataUrl: reader.result,
        width: 0,
        height: 0,
        size: file.size,
        format: 'svg',
      });
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let mimeType = 'image/webp';
        let dataUrl = canvas.toDataURL(mimeType, quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          mimeType = 'image/jpeg';
          dataUrl = canvas.toDataURL(mimeType, quality);
        }

        const approxSize = Math.round((dataUrl.length * 3) / 4);

        resolve({
          dataUrl,
          width,
          height,
          size: approxSize,
          format: mimeType.split('/')[1],
        });
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}