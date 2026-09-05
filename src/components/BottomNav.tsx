'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ShoppingCart, Warehouse, User } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const navItems = [
  { href: '/', label: 'Board', icon: LayoutGrid },
  { href: '/handcarts', label: 'Carts', icon: ShoppingCart },
  { href: '/unloading-bays', label: 'Bays', icon: Warehouse },
  { href: '/me', label: 'Me', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-bottom">
      <div className="max-w-lg mx-auto flex items-stretch">
        {navItems?.map((item) => {
          const isActive =
            item?.href === '/'
              ? pathname === '/'
              : pathname?.startsWith(item?.href);
          const Icon = item?.icon;
          return (
            <Link
              key={`nav-${item?.label}`}
              href={item?.href}
              className={[
                'flex flex-col items-center justify-center flex-1 py-2 gap-0.5 tap-target transition-colors duration-150',
                isActive
                  ? 'text-primary' :'text-muted-foreground hover:text-foreground',
              ]?.join(' ')}
              aria-label={item?.label}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
                className="shrink-0"
              />
              <span
                className={[
                  'text-[10px] font-semibold tracking-wide',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                ]?.join(' ')}
              >
                {item?.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}