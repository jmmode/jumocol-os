import { createPrivateKey, generateKeyPairSync, sign, verify } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getGoogleSheetsLeadConfig } from "./config";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

afterEach(() => vi.unstubAllEnvs());

describe("Google Sheets PEM configuration", () => {
  it.each([
    ["valid PEM", pem],
    ["escaped newlines", pem.replaceAll("\n", "\\n")],
    ["empty line before END", pem.replace("-----END", "\n-----END")],
    [
      "escaped empty line before END",
      pem.replace("-----END", "\n-----END").replaceAll("\n", "\\n"),
    ],
    [
      "CRLF and whitespace-only line",
      pem.replace("-----END", " \t\n-----END").replaceAll("\n", "\r\n"),
    ],
  ])("preserves a usable signing key with %s", (_label, value) => {
    vi.stubEnv("GOOGLE_SHEETS_PRIVATE_KEY", value);
    vi.stubEnv("GOOGLE_SHEETS_CLIENT_EMAIL", "test@example.invalid");
    vi.stubEnv("COMMERCIAL_LEADS_SPREADSHEET_ID", "test-sheet");
    vi.stubEnv("COMMERCIAL_LEADS_SHEET_NAME", "test-tab");

    const config = getGoogleSheetsLeadConfig();
    expect(createPrivateKey(config.privateKey).asymmetricKeyType).toBe("rsa");
    const payload = Buffer.from("Google Sheets JWT signing regression");
    const signature = sign("RSA-SHA256", payload, config.privateKey);
    expect(verify("RSA-SHA256", payload, publicKey, signature)).toBe(true);
  });
});
