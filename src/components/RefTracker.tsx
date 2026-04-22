'use client';

import { useEffect } from 'react';

export function RefTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref === 'sio2renovations') {
      sessionStorage.setItem('ref_source', 'sio2renovations');
    }
  }, []);

  return null;
}
