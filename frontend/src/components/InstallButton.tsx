import { useEffect } from 'react';
import InstallMobileOutlinedIcon from '@mui/icons-material/InstallMobileOutlined';
import { usePwaInstall } from '@/hooks/usePwaInstall';

// Only auto-pop the native dialog once per browser session, so it doesn't nag
// on every navigation. The manual button is always there as the fallback.
const AUTO_PROMPT_KEY = 'pwa-auto-prompted';

export function InstallButton() {
  const { canInstall, promptInstall } = usePwaInstall();

  // Auto-trigger the install dialog the first time it becomes available.
  useEffect(() => {
    if (!canInstall) return;
    if (sessionStorage.getItem(AUTO_PROMPT_KEY)) return;
    sessionStorage.setItem(AUTO_PROMPT_KEY, '1');
    void promptInstall();
  }, [canInstall, promptInstall]);

  // Hidden when already installed or the browser can't install (e.g. iOS, or
  // already dismissed) — there's nothing to do in those cases.
  if (!canInstall) return null;

  return (
    <button
      onClick={() => void promptInstall()}
      title="Install DocsCollab as an app"
      className="flex h-8 items-center gap-1.5 rounded border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 px-3 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
    >
      <InstallMobileOutlinedIcon style={{ fontSize: 16 }} />
      <span className="hidden sm:inline">Install app</span>
    </button>
  );
}
