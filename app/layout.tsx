import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { theme } from '@/lib/theme';
import { MainNavigation } from '@/components/MainNavigation';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Megyk Book Summaries - Personalized AI-Generated Summaries",
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
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <ModalsProvider>
            <Notifications />
        <MainNavigation />
        <main>{children}</main>
        <footer style={{ borderTop: '1px solid var(--mantine-color-default-border)', marginTop: '5rem' }}>
          <div className="container mx-auto px-4 py-8 text-center" style={{ color: 'var(--mantine-color-dimmed)' }}>
            <p>&copy; 2025 Megyk Book Summaries. All rights reserved.</p>
          </div>
        </footer>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
