import type { Metadata, Viewport } from 'next';
import ConsentBanner from '@/components/consent/ConsentBanner';
import './globals.css';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Modularix - Prefabricated modular data centers', template: '%s - Modularix' },
  description: SITE.description,
  openGraph: {
    title: 'Modularix - Prefabricated modular data centers',
    description: SITE.description,
    siteName: 'Modularix',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#040814',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
