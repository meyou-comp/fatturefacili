import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'FatturazioneIT — Fatturazione Elettronica Italiana',
  description:
    'Software SaaS di fatturazione italiana completo. Fatture elettroniche SDI, gestione clienti, regime forfettario, asilo nido, comunicazioni 730.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="light" style={{ colorScheme: 'light' }} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-white text-black`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
