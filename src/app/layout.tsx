import type { Metadata } from 'next';
import { Cormorant_Garamond, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Final Entry | Jamaica\'s Premier Pest Control',
    template: '%s | Final Entry Pest Control',
  },
  description:
    'Professional pest control services across all 14 parishes of Jamaica. Cockroaches, termites, rodents, mosquitoes — eliminated. Licensed, insured, guaranteed.',
  keywords: ['pest control Jamaica', 'exterminator Jamaica', 'termite control', 'cockroach control', 'rodent removal Kingston'],
  openGraph: {
    type: 'website',
    locale: 'en_JM',
    siteName: 'Final Entry Pest Control',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0 }}>
        <ThemeRegistry>
          <Providers>
            <Navbar />
            {children}
            <WhatsAppFab />
            <Footer />
          </Providers>
        </ThemeRegistry>
      </body>
    </html>
  );
}
