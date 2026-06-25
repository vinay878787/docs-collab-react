import { useCallback, useEffect, useState } from 'react';

// Chrome/Edge fire this (not in the standard lib types yet).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Drives the native PWA install flow.
 *
 * The browser fires `beforeinstallprompt` only when the app is installable and
 * not already installed. We capture it, suppress the default mini-infobar, and
 * expose a `promptInstall()` that opens the real OS install dialog on demand.
 */
export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Running inside the installed app already? (Android/desktop + iOS Safari.)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (standalone) setInstalled(true);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === 'accepted') setInstalled(true);
    } catch {
      // prompt() can only run once / may be blocked outside a gesture — ignore.
    } finally {
      // The captured event is single-use; drop it either way.
      setDeferred(null);
    }
  }, [deferred]);

  return { canInstall: !!deferred && !installed, installed, promptInstall };
}
