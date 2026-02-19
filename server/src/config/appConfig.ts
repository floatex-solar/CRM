import dotenv from "dotenv";

dotenv.config();

/* ---------------------- Helper Functions ---------------------- */

// ✅ Ensure required env variables exist
function getEnvVar(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }

  return value;
}

/* ---------------------- App Config Object ---------------------- */

const appConfig = Object.freeze({
  PORT: Number(process.env.PORT) || 3000,

  GOOGLE_SHEET_ID: getEnvVar("GOOGLE_SHEET_ID"),

  DRIVE_FOLDER_ID: getEnvVar("DRIVE_FOLDER_ID"),

  FRONTEND_URL: getEnvVar("FRONTEND_URL"),

  GOOGLE_SERVICE_ACCOUNT_BASE64: getEnvVar("GOOGLE_SERVICE_ACCOUNT_BASE64"),

  EMAIL_USERNAME: getEnvVar("EMAIL_USERNAME"),
  EMAIL_PASSWORD: getEnvVar("EMAIL_PASSWORD"),
  EMAIL_HOST: getEnvVar("EMAIL_HOST"),
  EMAIL_PORT: getEnvVar("EMAIL_PORT"),

  WHATSAPP_API_URL: getEnvVar("WHATSAPP_API_URL"),
  WHATSAPP_API_KEY: getEnvVar("WHATSAPP_API_KEY"),

  DATABASE: getEnvVar("DATABASE"),
  DATABASE_PASSWORD: getEnvVar("DATABASE_PASSWORD"),

  JWT_SECRET: getEnvVar("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnvVar("JWT_EXPIRES_IN"),
  JWT_COOKIE_EXPIRES_IN: getEnvVar("JWT_COOKIE_EXPIRES_IN"),

  NODE_ENV: getEnvVar("NODE_ENV"),
});

export default appConfig;
