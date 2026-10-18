import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { ClientProviders } from '@/components/providers/ClientProviders';

export const metadata: Metadata = {
  title: 'MADEN FAF — Maden Football Academy Foundation | Where Passion Meets Excellence',
  description: 'Official website of MADEN FAF (Maden Football Academy Foundation). Professional youth football development, structured training methodology, campus network, and digital player assessment.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'MADEN FAF — Maden Football Academy Foundation',
    description: 'Official website of MADEN FAF (Maden Football Academy Foundation). Professional youth football development, structured training methodology, campus network, and digital player assessment.',
    type: 'website',
    images: ['/images/maden-faf-official-logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MADEN FAF — Maden Football Academy Foundation',
    description: 'Official website of MADEN FAF (Maden Football Academy Foundation). Professional youth football development, structured training methodology, campus network, and digital player assessment.',
    images: ['/images/maden-faf-official-logo.png'],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
