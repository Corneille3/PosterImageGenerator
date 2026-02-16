import fs from "fs";
import path from "path";
import sharp from "sharp";

const src = "public/images/logo1.jpg";

async function main() {
  if (!fs.existsSync(src)) {
    console.error(`Source image not found: ${src}`);
    process.exit(1);
  }

  const img = sharp(src);

  // Square crop centered
  async function makePng(size, out) {
    await img
      .clone()
      .resize(size, size, { fit: "cover", position: "centre" })
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log("Wrote", out);
  }

  await makePng(512, "public/icon-512.png");
  await makePng(192, "public/icon-192.png");
  await makePng(180, "public/apple-touch-icon.png");

  // Favicon (ICO) with multiple sizes
  // sharp can write ICO in recent versions; if not supported in your build,
  // we’ll fall back to a PNG favicon.
  try {
    const faviconPng = await img
      .clone()
      .resize(256, 256, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();

    // Write PNG favicon as a fallback
    await sharp(faviconPng).toFile("public/favicon.png");
    console.log("Wrote public/favicon.png (fallback)");

    // Try ICO
    await sharp(faviconPng).toFormat("ico").toFile("public/favicon.ico");
    console.log("Wrote public/favicon.ico");
  } catch (e) {
    console.warn("ICO generation failed; keeping public/favicon.png only.");
    console.warn(String(e));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
