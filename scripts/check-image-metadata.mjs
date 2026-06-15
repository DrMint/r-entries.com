#!/usr/bin/env node
// @ts-check
import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import process from "node:process";
import { exiftool } from "exiftool-vendored";

const MAX_DIMENSION_PX = 4096;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".tif",
  ".tiff",
  ".heic",
  ".avif",
]);

/** @param {string} relPath */
function isImageFile(relPath) {
  const i = relPath.lastIndexOf(".");
  if (i === -1) return false;
  return IMAGE_EXTENSIONS.has(relPath.slice(i).toLowerCase());
}

function listTrackedImageFiles() {
  try {
    const out = execFileSync("git", ["ls-files", "-z", "--", "src", "public"], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    return out.split("\0").filter((p) => p.length > 0 && isImageFile(p));
  } catch (e) {
    throw new Error(
      `git ls-files failed (run from repo root, inside a git clone): ${
        e instanceof Error ? e.message : String(e)
      }`
    );
  }
}

/** @param {unknown} value */
function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/** @param {number} bytes */
function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${bytes}B`;
}

/** @param {Record<string, unknown>} tags */
function gpsSummaryFromTags(tags) {
  if (!tags || typeof tags !== "object") return null;

  const lat = /** @type {unknown} */ (tags.GPSLatitude);
  const lon = /** @type {unknown} */ (tags.GPSLongitude);
  const pos = /** @type {unknown} */ (tags.GPSPosition);

  if (lat != null || lon != null || pos != null) {
    return `GPSLatitude=${lat ?? "?"}, GPSLongitude=${lon ?? "?"}, GPSPosition=${pos ?? "?"}`;
  }

  const locationish = [
    "Location",
    "City",
    "State",
    "ProvinceState",
    "Country",
    "CountryCode",
    "SubLocation",
    "GPSAreaInformation",
    "GPSProcessingMethod",
  ];

  for (const key of locationish) {
    if (tags[key] != null && String(tags[key]).trim()) {
      return `${key}=${String(tags[key]).trim()}`;
    }
  }

  return null;
}

/** @param {Record<string, unknown>} tags */
function dimensionSummaryFromTags(tags) {
  const width = toNumber(
    tags.ImageWidth ?? tags.ExifImageWidth ?? tags.SourceImageWidth
  );
  const height = toNumber(
    tags.ImageHeight ?? tags.ExifImageHeight ?? tags.SourceImageHeight
  );

  if (width == null || height == null) return null;

  if (width > MAX_DIMENSION_PX || height > MAX_DIMENSION_PX) {
    return `${width}x${height}px (max ${MAX_DIMENSION_PX}px per side)`;
  }

  return null;
}

/** @param {string} filePath */
function fileSizeSummary(filePath) {
  const { size } = statSync(filePath);
  if (size > MAX_FILE_SIZE_BYTES) {
    return `${formatBytes(size)} (max 10MB)`;
  }
  return null;
}

/** @param {string} filePath */
async function inspectImage(filePath) {
  const sizeSummary = fileSizeSummary(filePath);

  let tags;
  try {
    tags = await exiftool.read(filePath);
  } catch (e) {
    throw new Error(
      `Failed to read metadata for ${filePath}: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  const metadataSummary = gpsSummaryFromTags(
    /** @type {Record<string, unknown>} */ (tags)
  );
  const dimensionSummary = dimensionSummaryFromTags(
    /** @type {Record<string, unknown>} */ (tags)
  );

  return { metadataSummary, dimensionSummary, sizeSummary };
}

let files;
try {
  files = listTrackedImageFiles();
} catch (e) {
  console.error(
    `\n[check-image-metadata] ${e instanceof Error ? e.message : String(e)}\n`
  );
  process.exit(2);
}

/** @type {{ file: string, summary: string }[]} */
const metadataOffenders = [];
/** @type {{ file: string, summary: string }[]} */
const dimensionOffenders = [];
/** @type {{ file: string, summary: string }[]} */
const sizeOffenders = [];
/** @type {string[]} */
const parseErrors = [];

for (const file of files) {
  try {
    const { metadataSummary, dimensionSummary, sizeSummary } =
      await inspectImage(file);

    if (metadataSummary) {
      metadataOffenders.push({ file, summary: metadataSummary });
    }
    if (dimensionSummary) {
      dimensionOffenders.push({ file, summary: dimensionSummary });
    }
    if (sizeSummary) {
      sizeOffenders.push({ file, summary: sizeSummary });
    }
  } catch (e) {
    parseErrors.push(e instanceof Error ? e.message : String(e));
  }
}

await exiftool.end();

if (parseErrors.length > 0) {
  console.error(
    `\n[check-image-metadata] Could not inspect ${parseErrors.length} image(s). ` +
      "Failing to avoid false negatives.\n"
  );
  for (const msg of parseErrors.slice(0, 20)) console.error(`- ${msg}`);
  if (parseErrors.length > 20) {
    console.error(`- ... (${parseErrors.length - 20} more)`);
  }
  console.error("\nFix: ensure images are valid and readable by exiftool.\n");
  process.exit(2);
}

const hasFailures =
  metadataOffenders.length > 0 ||
  dimensionOffenders.length > 0 ||
  sizeOffenders.length > 0;

if (hasFailures) {
  console.error("\n[check-image-metadata] Blocked commit:\n");

  if (metadataOffenders.length > 0) {
    console.error(
      `GPS/location metadata in ${metadataOffenders.length} image(s):\n`
    );
    for (const { file, summary } of metadataOffenders) {
      console.error(`- ${file} (${summary})`);
    }
    console.error(
      "\nFix: strip metadata before committing (examples):\n" +
        "- exiftool: exiftool -all= -overwrite_original <file>\n" +
        "- ImageMagick: magick <in> -strip <out>\n"
    );
  }

  if (dimensionOffenders.length > 0) {
    console.error(
      `\nDimensions above ${MAX_DIMENSION_PX}px in ${dimensionOffenders.length} image(s):\n`
    );
    for (const { file, summary } of dimensionOffenders) {
      console.error(`- ${file} (${summary})`);
    }
    console.error(
      "\nFix: resize before committing (example):\n" +
        `- ImageMagick: magick <in> -resize '${MAX_DIMENSION_PX}x${MAX_DIMENSION_PX}>' <out>\n`
    );
  }

  if (sizeOffenders.length > 0) {
    console.error(
      `\nFile size above 10MB in ${sizeOffenders.length} image(s):\n`
    );
    for (const { file, summary } of sizeOffenders) {
      console.error(`- ${file} (${summary})`);
    }
    console.error(
      "\nFix: compress or resize before committing (examples):\n" +
        "- ImageMagick: magick <in> -strip -quality 85 <out>\n" +
        "- cwebp: cwebp -q 80 <in> -o <out>.webp\n"
    );
  }

  process.exit(1);
}

console.log(
  `[check-image-metadata] OK: scanned ${files.length} image(s); no GPS/location metadata, ` +
    `no dimension above ${MAX_DIMENSION_PX}px, and no file above 10MB.`
);
