'use client';

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="cc-link"
      onClick={() => window.dispatchEvent(new Event('mx-open-consent'))}
    >
      Cookie settings
    </button>
  );
}
