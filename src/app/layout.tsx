import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'ConfigStack - Product Configurator',
  description: 'Frontend-only multi-device product configurator with cross-device state and dependency validation.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <footer className="mt-auto border-t border-slate-200/80 bg-white/60 py-6 text-center text-xs text-slate-500">
            ConfigStack - multi-device product configurator demo
          </footer>
        </Providers>
      </body>
    </html>
  );
}
