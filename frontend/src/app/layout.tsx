import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "La Boucherie-Fine — Accueil",
  description: "La Boucherie-Fine — Viandes d'exception, passion et raffinement.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${playfair.variable} ${poppins.variable} antialiased`}>{children}</body>
    </html>
  );
}
