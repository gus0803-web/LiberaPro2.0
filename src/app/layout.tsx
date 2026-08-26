import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LiberaPro Education",
  description: "Plataforma educativa para docentes",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '64x64', type: 'image/png' },
      { url: '/logo-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Google Analytics Scripts */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-X3XSQ55Q5F"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-X3XSQ55Q5F');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
