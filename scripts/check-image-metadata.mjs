#!/usr/bin/env node
// @ts-check
import { execFileSync } from "node:child_process";
import process from "node:process";
import { exiftool } from "exiftool-vendored";

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

/** @param {Record<string, unknown>} tags */
function gpsSummaryFromTags(tags) {
  if (!tags || typeof tags !== "object") return null;

  const lat = /** @type {unknown} */ (tags.GPSLatitude);
  const lon = /** @type {unknown} */ (tags.GPSLongitude);
  const pos = /** @type {unknown} */ (tags.GPSPosition);

  if (lat != null || lon != null || pos != null) {
    return `GPSLatitude=${lat ?? "?"}, GPSLongitude=${lon ?? "?"}, GPSPosition=${pos ?? "?"}`;
  }

  // Some tools store location as descriptive text rather than coordinates
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

/** @param {string} filePath */
async function readCompromisingLocationMetadata(filePath) {
  try {
    const tags = await exiftool.read(filePath);
    return gpsSummaryFromTags(/** @type {Record<string, unknown>} */ (tags));
  } catch (e) {
    throw new Error(
      `Failed to read metadata for ${filePath}: ${e instanceof Error ? e.message : String(e)}`
    );
  }
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

const offenders = [];
const parseErrors = [];
for (const file of files) {
  try {
    const gpsSummary = await readCompromisingLocationMetadata(file);
    if (gpsSummary) offenders.push({ file, gpsSummary });
  } catch (e) {
    parseErrors.push(e instanceof Error ? e.message : String(e));
  }
}

await exiftool.end();

if (parseErrors.length > 0) {
  console.error(
    `\n[check-image-metadata] Could not read metadata for ${parseErrors.length} image(s). ` +
      "Failing to avoid false negatives.\n"
  );
  for (const msg of parseErrors.slice(0, 20)) console.error(`- ${msg}`);
  if (parseErrors.length > 20)
    console.error(`- ... (${parseErrors.length - 20} more)`);
  console.error("\nFix: ensure images are valid and readable by exiftool.\n");
  process.exit(2);
}

if (offenders.length > 0) {
  console.error(
    `\n[check-image-metadata] Blocked commit: found potential doxxing metadata (GPS/location) in ${offenders.length} image(s):\n`
  );
  for (const { file, gpsSummary } of offenders) {
    console.error(`- ${file} (${gpsSummary})`);
  }

  console.error(
    "\nFix: strip metadata before committing (examples):\n" +
      "- exiftool: exiftool -all= -overwrite_original <file>\n" +
      "- ImageMagick: magick <in> -strip <out>\n"
  );
  process.exit(1);
}

console.log(
  `[check-image-metadata] OK: scanned ${files.length} image(s); no GPS/location metadata found.`
);
