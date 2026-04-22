'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function BackButton() {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    const pathname = window.location.pathname;

    // Article page → always back to listing, regardless of navigation origin
    if (pathname.startsWith('/articles/')) {
      setHref('/articles');
      return;
    }

    // Articles listing or any other page → came from SiO2?
    if (sessionStorage.getItem('ref_source') === 'sio2renovations') {
      const stored = sessionStorage.getItem('ref_return_url');
      setHref(stored ?? 'https://www.sio2renovations.com/?scroll=ressources');
      return;
    }

    // Default: back to hub home
    setHref('/');
  }, []);

  const cls = 'flex items-center gap-2 hover:opacity-70 transition-opacity';
  const style = { color: '#544435', fontSize: 14 };

  if (!href) return null;

  if (href.startsWith('http')) {
    return <a href={href} className={cls} style={style}>&larr; Retour</a>;
  }

  return <Link href={href} className={cls} style={style}>&larr; Retour</Link>;
}
