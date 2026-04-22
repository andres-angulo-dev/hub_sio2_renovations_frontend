'use client';

import { useEffect } from 'react';

export function RefTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const returnUrl = params.get('return');
    if (ref === 'sio2renovations') {
      sessionStorage.setItem('ref_source', 'sio2renovations');
      if (returnUrl) {
        sessionStorage.setItem('ref_return_url', returnUrl);
      }
    }
  }, []);

  return null;
}
