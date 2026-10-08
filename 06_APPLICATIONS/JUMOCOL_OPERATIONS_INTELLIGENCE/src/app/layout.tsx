import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "JUMOCOL Operations Intelligence",
  description: "Intranet operacional JUMOCOL OS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen bg-slate-50">
          <div className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <div>
                <div className="text-sm font-semibold tracking-wide text-slate-950">
                  JUMOCOL OS
                </div>
                <div className="text-xs text-slate-500">
                  Operations Intelligence
                </div>
              </div>
              <div className="text-xs font-medium text-slate-500">
                TiviPlay · Operación
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
        </div>
      </body>
    </html>
  );
}
