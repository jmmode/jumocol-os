
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const applicationRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.4"],

  outputFileTracingRoot: path.resolve(applicationRoot, "../.."),

  outputFileTracingIncludes: {
    "/operaciones/tiviplay/contexto": [
      "../../../03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/JUM-OI-OPS-TIVI-001_CONTEXTO_MAESTRO.md",
    ],
  },

  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
