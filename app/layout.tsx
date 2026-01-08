import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleTagManager } from '@next/third-parties/google';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { theme } from '@/lib/theme';
import { MainNavigation } from '@/components/MainNavigation';
import { AppTourProvider } from '@/components/tour/AppTourProvider';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Megyk Books - Personalized AI-Generated Summaries",
  description: "Get personalized book summaries tailored to your reading preferences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript forceColorScheme="light" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <GoogleTagManager gtmId="GTM-WNR6MV8H" />
        <MantineProvider theme={theme} forceColorScheme="light">
          <ModalsProvider>
            <Notifications />
        <MainNavigation />
        <main>
          <AppTourProvider>{children}</AppTourProvider>
        </main>
        <footer style={{ 
          borderTop: '1px solid #e5e7eb', 
          marginTop: '5rem',
          backgroundColor: '#ffffff'
        }}>
          <div className="container mx-auto px-4 py-8 text-center" style={{ color: '#374151' }}>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>
              © {new Date().getFullYear()} Megyk Books.
            </p>
          </div>
        </footer>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
