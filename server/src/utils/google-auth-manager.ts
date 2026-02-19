import { GoogleAuth } from "google-auth-library";
import appConfig from "../config/appConfig.js";

const { GOOGLE_SERVICE_ACCOUNT_BASE64 } = appConfig;

interface GoogleServiceAccountCredentials {
  client_email: string;
  private_key: string;
  [key: string]: unknown;
}

function decodeCredentials(base64: string): GoogleServiceAccountCredentials {
  const json = Buffer.from(base64, "base64").toString("utf8");
  const creds = JSON.parse(json) as GoogleServiceAccountCredentials;

  if (!creds.client_email || !creds.private_key) {
    throw new Error("Invalid service account credentials");
  }

  return creds;
}

class AuthManager {
  private accounts: GoogleServiceAccountCredentials[];
  private authClients: GoogleAuth[];
  private currentIndex: number;

  constructor(accounts: string[]) {
    this.accounts = accounts.map(decodeCredentials);

    this.authClients = this.accounts.map(
      (credentials) =>
        new GoogleAuth({
          credentials,
          scopes: [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive",
          ],
        }),
    );

    this.currentIndex = 0;
  }

  getAuth(): GoogleAuth {
    const client = this.authClients[this.currentIndex];
    if (!client) {
      throw new Error("No auth client available");
    }
    return client;
  }

  rotate(): boolean {
    if (this.authClients.length <= 1) return false;
    this.currentIndex = (this.currentIndex + 1) % this.authClients.length;
    return true;
  }
}

export const authManager = new AuthManager([GOOGLE_SERVICE_ACCOUNT_BASE64]);
