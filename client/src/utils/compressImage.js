// Downscale + re-encode an image File so it fits under a byte budget.
// Used for profile avatars, which must stay ≤ 50 KB. Any normal phone photo
// (several MB) is squeezed down automatically, so the user never has to resize
// anything by hand. Returns a new JPEG File.

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });

const toBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

export async function compressImage(
  file,
  { maxBytes = 50 * 1024, maxDim = 400, type = "image/jpeg" } = {},
) {
  const img = await loadImage(file);

  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  // Fit the longest edge into maxDim (avatars render tiny; 400px is plenty).
  const scale = Math.min(1, maxDim / Math.max(width, height));
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const draw = () => {
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
  };

  draw();

  // 1) Walk the JPEG quality down until it fits.
  let quality = 0.92;
  let blob = await toBlob(canvas, type, quality);
  while (blob && blob.size > maxBytes && quality > 0.3) {
    quality -= 0.1;
    blob = await toBlob(canvas, type, quality);
  }

  // 2) Still too big (very high-detail image)? Shrink the canvas and retry.
  while (blob && blob.size > maxBytes && width > 80) {
    width = Math.round(width * 0.8);
    height = Math.round(height * 0.8);
    draw();
    blob = await toBlob(canvas, type, 0.7);
  }

  if (!blob) throw new Error("Could not process the image.");
  if (blob.size > maxBytes) {
    throw new Error("Image is too detailed to fit under 50 KB. Try another photo.");
  }

  const base = (file.name || "avatar").replace(/\.[^./\\]+$/, "");
  return new File([blob], `${base}.jpg`, { type });
}
