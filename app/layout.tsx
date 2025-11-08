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
        <ColorSchemeScript defaultColorScheme="dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <ModalsProvider>
            <Notifications />
        <MainNavigation />
        <main>{children}</main>
        <footer style={{ borderTop: '1px solid var(--mantine-color-default-border)', marginTop: '5rem' }}>
          <div className="container mx-auto px-4 py-8 text-center" style={{ color: 'var(--mantine-color-dimmed)' }}>
          </div>
        </footer>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
