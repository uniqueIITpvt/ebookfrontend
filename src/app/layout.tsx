import type { Metadata } from 'next';
import './globals.css';
import ConditionalLayout from '@/components/ui/layout/ConditionalLayout';


export const metadata: Metadata = {
  title: 'TechUniqueIIT - Ebook Store',
  description:
    'Your one-stop destination for ebooks, audiobooks, book summaries and learning resources',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang='en'>
      <body suppressHydrationWarning>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
