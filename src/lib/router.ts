import { useEffect, useState } from 'react';

export type Route =
  | { page: 'insights' }
  | { page: 'journal'; params: URLSearchParams }
  | { page: 'new' }
  | { page: 'decision'; id: string; params: URLSearchParams };

export const parseHash = (hash: string): Route => {
  const [path, query = ''] = hash.replace(/^#/, '').split('?');
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'journal') return { page: 'journal', params: new URLSearchParams(query) };
  if (parts[0] === 'new') return { page: 'new' };
  if (parts[0] === 'decision' && parts[1]) return { page: 'decision', id: safeDecode(parts[1]), params: new URLSearchParams(query) };
  return { page: 'insights' };
};

/** A hand-typed bad URL like #/decision/% must not crash the app. */
const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export const href = {
  insights: () => '#/insights',
  journal: (params?: Record<string, string>) => {
    const q = params ? new URLSearchParams(params).toString() : '';
    return `#/journal${q ? `?${q}` : ''}`;
  },
  new: () => '#/new',
  decision: (id: string, params?: Record<string, string>) => {
    const q = params ? new URLSearchParams(params).toString() : '';
    return `#/decision/${encodeURIComponent(id)}${q ? `?${q}` : ''}`;
  },
};

export const navigate = (to: string) => {
  window.location.hash = to;
};

export const useRoute = (): Route => {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    let path = window.location.hash.split('?')[0];
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      const next = window.location.hash.split('?')[0];
      // Filter changes keep your place; a new page starts at the top, and
      // focus moves to the content so screen readers hear the new page.
      if (next !== path) {
        window.scrollTo(0, 0);
        document.getElementById('main')?.focus({ preventScroll: true });
      }
      path = next;
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
};
