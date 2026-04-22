'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function BackButton() {
  const [fromSio2, setFromSio2] = useState(false);

  useEffect(() => {
    setFromSio2(sessionStorage.getItem('ref_source') === 'sio2renovations');
  }, []);

  if (fromSio2) {
    return (
      <a
        href="https://www.sio2renovations.com/?scroll=ressources"
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
