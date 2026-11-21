import React, { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuideModal(true);
  };

  const buttonLabel = isInstallable
    ? 'Instal Aplikasi'
    : isIOS
      ? 'Instal di iPhone'
      : isAndroid
        ? 'Instal di Android'
        : 'Instal HP / App';

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        data-testid="pwa-install-button"
        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 whitespace-nowrap shrink-0 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
      >
        <Download className="h-3.5 w-3.5" />
        {buttonLabel}
      </button>

      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#0F1522]">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2
                  id="pwa-install-dialog-title"
                  className="font-display text-sm font-bold text-slate-900 dark:text-white"
                >
                  Instal QuantScan di Android &amp; iPhone
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Tutup panduan instalasi"
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div
                className={`rounded-lg border p-3.5 ${
                  isIOS
                    ? 'border-blue-500 bg-blue-50/50 dark:border-blue-500/50 dark:bg-blue-500/10'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#0B0F17]'
                }`}
              >
                <p className="font-display font-bold text-slate-900 dark:text-white">
                  Untuk iPhone / iPad (iOS Safari)
                </p>
                <ol className="mt-2 space-y-1.5 leading-relaxed text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">1.</span>
                    <span>
                      Buka aplikasi ini langsung melalui browser <strong>Safari</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">2.</span>
                    <span>
                      Ketuk tombol <strong>Bagikan / Share</strong> (
                      <Share className="inline h-3.5 w-3.5 align-text-bottom text-blue-600 dark:text-blue-400" />
                      ) di bilah menu bawah Safari.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">3.</span>
                    <span>
                      Gulir ke bawah lalu pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>,
                      kemudian ketuk <strong>Tambah</strong>.
                    </span>
                  </li>
                </ol>
              </div>

              <div
                className={`rounded-lg border p-3.5 ${
                  isAndroid
                    ? 'border-blue-500 bg-blue-50/50 dark:border-blue-500/50 dark:bg-blue-500/10'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#0B0F17]'
                }`}
              >
                <p className="font-display font-bold text-slate-900 dark:text-white">
                  Untuk Android (Chrome / Edge)
                </p>
                <ol className="mt-2 space-y-1.5 leading-relaxed text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">1.</span>
                    <span>
                      Buka URL aplikasi melalui <strong>Google Chrome</strong> di tab utama (bukan
                      in-app browser).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">2.</span>
                    <span>
                      Ketuk ikon menu <strong>⋮</strong> di kanan atas lalu pilih{' '}
                      <strong>Instal aplikasi</strong> atau <strong>Tambahkan ke layar utama</strong>.
                    </span>
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
