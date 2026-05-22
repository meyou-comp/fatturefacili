import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const sfPro = localFont({
  src: [
    {
      path: '../../public/SFPRODISPLAYREGULAR.OTF',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/SFPRODISPLAYSEMIBOLD.otf',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-sfpro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Fatture Facili — Fatturazione Elettronica Semplice',
  description:
    'Software SaaS di fatturazione italiana completo. Fatture elettroniche SDI, gestione clienti, regime forfettario, asilo nido, comunicazioni 730.',
  openGraph: {
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="light" style={{ colorScheme: 'light' }} suppressHydrationWarning>
      <body className={`${inter.variable} ${sfPro.variable} font-sans antialiased bg-white text-black`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
