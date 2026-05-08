#!/usr/bin/env node
// @ts-check
import process from "node:process";
import fg from "fast-glob";
import { exiftool } from "exiftool-vendored";

const SHOULD_BYPASS =
  process.env.ALLOW_IMAGE_GPS_METADATA === "1" ||
  process.env.SKIP_IMAGE_METADATA_CHECK === "1";

if (SHOULD_BYPASS) {
  console.log(
    "[check-image-metadata] Skipped (ALLOW_IMAGE_GPS_METADATA=1 or SKIP_IMAGE_METADATA_CHECK=1).",
  );
  process.exit(0);
}

const patterns = [
  "src/**/*.{jpg,jpeg,png,webp,tif,tiff,heic,avif}",
  "public/**/*.{jpg,jpeg,png,webp,tif,tiff,heic,avif}",
];

const ignore = [
  "**/node_modules/**",
  "**/dist/**",
  "**/.astro/**",
  "**/.git/**",
];

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
      `Failed to read metadata for ${filePath}: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}

const files = await fg(patterns, { ignore, dot: false, onlyFiles: true });

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
      "Failing to avoid false negatives.\n",
  );
  for (const msg of parseErrors.slice(0, 20)) console.error(`- ${msg}`);
  if (parseErrors.length > 20) console.error(`- ... (${parseErrors.length - 20} more)`);
  console.error(
    "\nFix: ensure images are valid, or bypass with SKIP_IMAGE_METADATA_CHECK=1 for this commit.\n",
  );
  process.exit(2);
}

if (offenders.length > 0) {
  console.error(
    `\n[check-image-metadata] Blocked commit: found potential doxxing metadata (GPS/location) in ${offenders.length} image(s):\n`,
  );
  for (const { file, gpsSummary } of offenders) {
    console.error(`- ${file} (${gpsSummary})`);
  }

  console.error(
    "\nFix: strip metadata before committing (examples):\n" +
      "- exiftool: exiftool -all= -overwrite_original <file>\n" +
      "- ImageMagick: magick <in> -strip <out>\n" +
      "\nBypass (not recommended): set ALLOW_IMAGE_GPS_METADATA=1 for this commit.\n",
  );
  process.exit(1);
}

console.log(
  `[check-image-metadata] OK: scanned ${files.length} image(s); no GPS/location metadata found.`,
);
