
"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { VoucherProvider } from '@/context/voucher-context';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>Luco WIFI</title>
        <meta name="description" content="Connect with Luco WIFI" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <VoucherProvider>
          {children}
        </VoucherProvider>
        <Toaster />
      </body>
    </html>
  );
}
