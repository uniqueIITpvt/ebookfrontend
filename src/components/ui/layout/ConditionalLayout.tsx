'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import AutomaticChatEmbed from '../primitives/AutomaticChatEmbed';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

// Simple loading fallback for Navbar
const NavbarLoading = () => (
  <div className="h-16 bg-white border-b border-slate-200" />
);

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAuthRoute = pathname?.startsWith('/user/login') || pathname?.startsWith('/user/signup') || pathname?.startsWith('/user/auth');

  if (isAdminRoute || isAuthRoute) {
    // For admin and auth routes, don't show navbar, footer, or chat embed
    return <>{children}</>;
  }

  // For regular routes, show the full layout
  return (
    <>
      <Suspense fallback={<NavbarLoading />}>
        <Navbar />
      </Suspense>
      <main>{children}</main>
      <Footer />
      <AutomaticChatEmbed />
    </>
  );
}
