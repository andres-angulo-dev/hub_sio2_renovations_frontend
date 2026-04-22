'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationTracker() {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevPathRef.current !== null) {
      sessionStorage.setItem('hub_previous_path', prevPathRef.current);
    }
    prevPathRef.current = pathname;
  }, [pathname]);

  return null;
}
