'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/configure', label: 'Configure' },
  { href: '/plans', label: 'Plans' },
  { href: '/checkout', label: 'Checkout' },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 text-sm font-bold text-white shadow-sm">
            CS
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900 group-hover:text-brand-700">
            ConfigStack
          </span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${active ? 'nav-link-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
