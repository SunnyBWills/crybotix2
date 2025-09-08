import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Trade Tool"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg2 text-text">
        <div className="min-h-screen p-4">{children}</div>
      </body>
    </html>
  );
}
