import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

import ConditionalLayout from '@/components/ui/layout/ConditionalLayout';

// Backend URL configuration
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ebookbackend.vercel.app';

async function fetchSiteLogo(): Promise<string | null> {
  try {
    // Try public settings endpoint first
    const res = await fetch(`${BACKEND_URL}/api/v1/settings/public`, {
      cache: 'no-store',
    });
    const data = await res.json();
    if (data?.success && data?.data?.site_logo) {
      return String(data.data.site_logo);
    }

    // Fallback to value endpoint
    const valueRes = await fetch(`${BACKEND_URL}/api/v1/settings/value/site_logo`, {
      cache: 'no-store',
    });
    const valueData = await valueRes.json();
    if (valueData?.success && valueData?.value) {
      return String(valueData.value);
    }
  } catch {
    // Return null if fetch fails
  }
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const siteLogo = await fetchSiteLogo();

  return {
    title: 'TechUniqueIIT - Ebook Store',
    description:
      'Your one-stop destination for ebooks, audiobooks, book summaries and learning resources',
    ...(siteLogo
      ? {
          icons: {
            icon: siteLogo,
            shortcut: siteLogo,
            apple: siteLogo,
          },
        }
      : {}),
  };
}

import { AuthProvider } from '@/contexts/AuthContext';
import AuthModal from '@/components/ui/auth/AuthModal';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang='en' className={`${syne.variable} ${dmSans.variable}`}>
      <body suppressHydrationWarning className="font-sans">
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
