import type { Metadata } from 'next';
import { Archivo, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['800', '900'],
  variable: '--font-display',
  display: 'swap',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'SNKRS Console',
  description: 'Content & Insights Ops Console',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${archivo.variable} ${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-ink-900 font-sans text-paper antialiased">{children}</body>
    </html>
  );
}
