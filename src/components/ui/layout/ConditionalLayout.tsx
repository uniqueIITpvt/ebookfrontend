'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import AutomaticChatEmbed from '../primitives/AutomaticChatEmbed';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    // For admin routes, don't show navbar, footer, or chat embed
    return <>{children}</>;
  }

  // For regular routes, show the full layout
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <AutomaticChatEmbed />
    </>
  );
}
