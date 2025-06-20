import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
  config({ path: ".env.test" });
} else {
  config();
}

const envSchem = z.object({
  NODE_ENV: z
    .enum(["development", "test", "productions"])
    .default("productions"),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
});

const _env = envSchem.safeParse(process.env);

if (_env.success === false) {
  console.error("invalid environment variables", _env.error.format());

  throw new Error("invalid environment variables");
}

export const env = _env.data;
