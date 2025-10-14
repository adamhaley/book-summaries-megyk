import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { theme } from '@/lib/theme';
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
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-xl font-bold">Megyk Book Summaries</div>
            <div className="flex gap-4">
              <a href="#" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Library</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Profile</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t mt-20">
          <div className="container mx-auto px-4 py-8 text-center text-gray-600">
            <p>&copy; 2025 Megyk Book Summaries. All rights reserved.</p>
          </div>
        </footer>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
