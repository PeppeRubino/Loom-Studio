import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';
import '@/styles/global.css';

const stripSensitiveParams = () => {
  if (typeof window === 'undefined') return;
  const sensitiveKeys = ['key', 'apiKey', 'api_key', 'access_token', 'id_token'];
  const url = new URL(window.location.href);
  let changed = false;

  sensitiveKeys.forEach((k) => {
    if (url.searchParams.has(k)) {
      url.searchParams.delete(k);
      changed = true;
    }
  });

  if (url.hash && url.hash.includes('=')) {
    const [hashPath, hashQuery = ''] = url.hash.split('?');
    if (hashQuery) {
      const hashParams = new URLSearchParams(hashQuery);
      sensitiveKeys.forEach((k) => {
        if (hashParams.has(k)) {
          hashParams.delete(k);
          changed = true;
        }
      });
      url.hash = hashParams.toString() ? `${hashPath}?${hashParams.toString()}` : hashPath;
    }
  }

  if (changed) {
    window.history.replaceState({}, document.title, url.toString());
  }
};

stripSensitiveParams();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);

