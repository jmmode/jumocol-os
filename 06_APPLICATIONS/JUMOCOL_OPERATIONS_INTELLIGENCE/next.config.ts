
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const applicationRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.4"],

  outputFileTracingRoot: path.resolve(applicationRoot, "../.."),

  // La página HOY consume el motor gobernado 05_AUTOMATION/tiviplay-monthly-close-v1
  // sin copiarlo: el root del bundler se amplía al repositorio y el alias apunta al core.
  turbopack: {
    root: path.resolve(applicationRoot, "../.."),
    resolveAlias: {
      "@motor/tiviplay-monthly-close-v1/core": "../../05_AUTOMATION/tiviplay-monthly-close-v1/src/core.mjs",
    },
  },

  outputFileTracingIncludes: {
    "/operaciones/tiviplay/contexto": [
      "../../03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/JUM-OI-OPS-TIVI-001_CONTEXTO_MAESTRO.md",
    ],
  },

  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
