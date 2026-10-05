import { GoogleAuth } from "google-auth-library";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

export async function readSheetValues({ spreadsheetId, sheetName, range = "A1:W5000" }) {
  if (!spreadsheetId) throw new Error("spreadsheetId is required");
  if (!sheetName) throw new Error("sheetName is required");

  const auth = buildGoogleAuth();
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  if (!token?.token) throw new Error("Could not obtain Google access token");

  const a1 = `${quoteSheet(sheetName)}!${range}`;
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}` +
    `/values/${encodeURIComponent(a1)}?valueRenderOption=FORMATTED_VALUE`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token.token}` },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Sheets read failed (${response.status}): ${body}`);
  }

  const payload = await response.json();
  return payload.values ?? [];
}

function buildGoogleAuth() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

  if (clientEmail && privateKeyRaw) {
    return new GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKeyRaw.replace(/\\n/g, "\n"),
      },
      scopes: [SHEETS_SCOPE],
    });
  }

  return new GoogleAuth({ scopes: [SHEETS_SCOPE] });
}

function quoteSheet(name) {
  return `'${String(name).replaceAll("'", "''")}'`;
}
