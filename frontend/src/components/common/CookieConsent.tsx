import React, { useState, useEffect } from 'react';

interface CookieConfig {
  enabled: boolean;
  title: string;
  bodyText: string;
  privacyLinkText?: string;
  privacyLinkUrl?: string;
  acceptButtonText: string;
  declineButtonText: string;
  settingsButtonText: string;
  settingsUrl?: string;
}

export const CookieConsent = () => {
  const [config, setConfig] = useState<CookieConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/cookie-consent-config/public')
      .then((res) => res.json())
      .then((data: CookieConfig) => {
        if (cancelled) return;
        setConfig(data);

        const consent = localStorage.getItem('cookie-consent');
        if (data.enabled && !consent) {
          const timer = setTimeout(() => {
            if (!cancelled) setIsVisible(true);
          }, 1000);
          return () => clearTimeout(timer);
        }
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible || !config) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[calc(100%-2rem)] md:w-[450px] bg-white rounded-lg shadow-2xl z-[9999] border border-gray-100 p-6 flex flex-col font-sans">
      <h3 className="text-[16px] font-semibold text-gray-800 mb-3">{config.title}</h3>

      <p className="text-[13px] text-gray-600 leading-relaxed mb-4 whitespace-pre-line">
        {config.bodyText}
      </p>

      {config.privacyLinkText && (
        <a
          href={config.privacyLinkUrl || '/datenschutz'}
          className="text-[13px] text-[#53a8c7] hover:underline mb-6 inline-block"
        >
          {config.privacyLinkText}
        </a>
      )}

      <div className="flex gap-4 mb-4">
        <button
          onClick={handleAccept}
          className="flex-1 border border-gray-300 rounded-sm py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {config.acceptButtonText}
        </button>
        <button
          onClick={handleDecline}
          className="flex-1 border border-gray-300 rounded-sm py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {config.declineButtonText}
        </button>
      </div>

      {config.settingsUrl && (
        <div className="text-center">
          <a href={config.settingsUrl} className="text-[13px] text-[#53a8c7] hover:underline">
            {config.settingsButtonText}
          </a>
        </div>
      )}
    </div>
  );
};
