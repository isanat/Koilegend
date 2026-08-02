import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Koi Legend — Da Água à Ascensão do Dragão",
  description:
    "Jogo Web3 baseado na lenda do peixe Koi que se transforma em dragão. 12 etapas de desafios, cartas NFT colecionáveis e um token economy sustentável.",
  keywords: ["Koi", "Dragon", "Web3 Game", "NFT", "Phaser", "Blockchain", "GameFi"],
  authors: [{ name: "Koi Legend" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Koi Legend — Da Água à Ascensão do Dragão",
    description: "Jogo Web3 baseado na lenda milenar do peixe Koi.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
