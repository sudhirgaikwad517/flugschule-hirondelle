import { useEffect, useState } from 'react';

// Admin-configured image URLs (from the pagemedia API) can go stale - an
// upload gets deleted, or a row still points at an old dev machine's
// localhost URL - and the naive `media?.url || fallback` pattern renders
// the good local fallback first, then silently swaps to the broken remote
// URL as soon as the fetch resolves, breaking the image after a visible
// delay (fallback -> flash -> broken alt text). This preloads the
// candidate URL via a real Image() and only ever promotes it once the
// browser confirms it actually loads, so the visible src can go
// fallback -> real, never real -> broken.
export function useValidatedImageUrl(url: string | null | undefined, fallback: string): string {
  const [resolved, setResolved] = useState(fallback);

  useEffect(() => {
    if (!url) {
      setResolved(fallback);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setResolved(url);
    };
    img.onerror = () => {
      if (!cancelled) setResolved(fallback);
    };
    img.src = url;
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, fallback]);

  return resolved;
}

// Same idea for a whole gallery array: only images that actually load get
// included, in their original order, never replacing a working fallback
// set with a partially-broken remote one.
export function useValidatedImageList(urls: string[] | null | undefined, fallback: string[]): string[] {
  const [resolved, setResolved] = useState(fallback);

  useEffect(() => {
    if (!urls || urls.length === 0) {
      setResolved(fallback);
      return;
    }
    let cancelled = false;
    Promise.all(
      urls.map(
        (url) =>
          new Promise<string | null>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => resolve(null);
            img.src = url;
          })
      )
    ).then((results) => {
      if (cancelled) return;
      const valid = results.filter((r): r is string => r !== null);
      setResolved(valid.length > 0 ? valid : fallback);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls, fallback]);

  return resolved;
}
