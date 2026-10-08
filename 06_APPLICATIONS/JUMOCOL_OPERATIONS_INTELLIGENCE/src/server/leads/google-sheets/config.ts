import "server-only";

export type GoogleSheetsLeadConfig = {
  clientEmail: string;
  privateKey: string;
};

export function getGoogleSheetsLeadConfig(): GoogleSheetsLeadConfig {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail) {
    throw new Error("Missing GOOGLE_SHEETS_CLIENT_EMAIL");
  }

  if (!privateKey) {
    throw new Error("Missing GOOGLE_SHEETS_PRIVATE_KEY");
  }

  return {
    clientEmail,
    privateKey,
  };
}
