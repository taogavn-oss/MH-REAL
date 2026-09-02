import type { Metadata } from 'next';
import '@fontsource/geist-sans';
import '@fontsource/geist-mono';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Rakusai MH-REAL',
  description: 'Recruitment Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased h-full flex flex-col`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
