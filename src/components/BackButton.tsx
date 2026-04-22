'use client';

import { useEffect, useState } from 'react';

export function BackButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only when there's a page to go back to
    if (window.history.length > 1) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.history.back()}
      className="flex items-center gap-2 hover:opacity-70 transition-opacity"
      style={{ color: '#544435', fontSize: 14 }}
    >
      &larr; Retour
    </button>
  );
}
