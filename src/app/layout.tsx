import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AIESEC in USJ Partner Portal | BD Tool",
  description:
    "Premium partner portal for AIESEC in USJ's corporate partnerships. Access your campaign deliverables and partnership assets.",
  keywords: ["AIESEC", "AIESEC in USJ", "USJ", "Partner Portal", "Sri Lanka", "Business Development"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
