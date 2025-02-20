import { z } from "zod";
import dotenv from "dotenv";
import fs from "fs";


export const loadEnv = () => {
  /* These values are only used if the similarly named
  environment variables are not set */
  const defaultEnv = dotenv.parse(fs.readFileSync(".env.local"));

  process.env.PORT ??= defaultEnv.PORT;
  process.env.SITE_URL ??= defaultEnv.SITE_URL;
  process.env.BASE_PATH ??= defaultEnv.BASE_PATH;
  process.env.TRAILING_SLASH ??= defaultEnv.TRAILING_SLASH;

  const result = z
    .object({
      PORT: z.coerce.number(),
      SITE_URL: z.string().url(),
      BASE_PATH: z.string().startsWith("/"),
      TRAILING_SLASH: z.enum(["always", "never", "ignore"]),
    })
    .safeParse(process.env);

  if (!result.success) {
    console.error(
      "❌ Invalid environment variables",
      result.error.flatten().fieldErrors
    );
    process.exit(1);
  }

  console.log(`
🔍 Environment variables:
----------------------------------------
${Object.entries(result.data)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}
----------------------------------------
`);

  return result.data;
};
