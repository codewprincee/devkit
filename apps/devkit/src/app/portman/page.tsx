'use client';

import { usePathname } from 'next/navigation';
import { PortManApp } from '@/components/portman/PortManApp';

export default function PortManPage() {
  const pathname = usePathname();
  const isActive = pathname === '/portman';

  return <PortManApp active={isActive} />;
}
