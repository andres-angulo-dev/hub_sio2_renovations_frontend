'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function BackButton() {
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('ref_source') === 'sio2renovations') {
      const stored = sessionStorage.getItem('ref_return_url');
      setReturnUrl(stored ?? 'https://www.sio2renovations.com/?scroll=ressources');
    }
  }, []);

  if (returnUrl) {
    return (
      <a
        href={returnUrl}
        className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        style={{ color: '#544435', fontSize: 14 }}
      >
        &larr; Retour
      </a>
    );
  }

  return (
    <Link
      href="/"
      className="flex items-center gap-2 hover:opacity-70 transition-opacity"
      style={{ color: '#544435', fontSize: 14 }}
    >
      &larr; Retour
    </Link>
  );
}
