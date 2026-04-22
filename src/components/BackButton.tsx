'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type BackAction = { type: 'history' } | { type: 'url'; href: string };

export function BackButton() {
  const [action, setAction] = useState<BackAction | null>(null);

  useEffect(() => {
    // Within-hub navigation — NavigationTracker stored the previous path
    const previousPath = sessionStorage.getItem('hub_previous_path');
    if (previousPath) {
      setAction({ type: 'history' });
      return;
    }

    // Came from SiO2 — use the stored return URL with scroll
    if (sessionStorage.getItem('ref_source') === 'sio2renovations') {
      const stored = sessionStorage.getItem('ref_return_url');
      setAction({ type: 'url', href: stored ?? 'https://www.sio2renovations.com/?scroll=ressources' });
      return;
    }

    // Default: back to hub home
    setAction({ type: 'url', href: '/' });
  }, []);

  const cls = 'flex items-center gap-2 hover:opacity-70 transition-opacity';
  const style = { color: '#544435', fontSize: 14 };

  if (!action) return null;

  if (action.type === 'history') {
    return (
      <button onClick={() => window.history.back()} className={cls} style={style}>
        &larr; Retour
      </button>
    );
  }

  if (action.href === '/') {
    return <Link href="/" className={cls} style={style}>&larr; Retour</Link>;
  }

  return <a href={action.href} className={cls} style={style}>&larr; Retour</a>;
}
