import { useState } from 'react';
import {
  hasGlobalPrivacyControl,
  isMetaAdvertisingOptedOut,
  setMetaAdvertisingOptOut,
} from '@/lib/ad-choices';

const MetaPixelChoice = () => {
  const [optedOut, setOptedOut] = useState(() => isMetaAdvertisingOptedOut());
  const gpc = hasGlobalPrivacyControl();

  const toggle = () => {
    const next = !optedOut;
    setMetaAdvertisingOptOut(next);
    setOptedOut(next);
    window.location.reload();
  };

  return (
    <div className="border border-border px-4 py-5 space-y-3">
      <p className="text-cream text-sm">
        {gpc
          ? 'Your browser sent Global Privacy Control. The Meta Pixel is not loaded in this browser.'
          : optedOut
            ? 'Meta Pixel is off in this browser.'
            : 'Meta Pixel is on in this browser.'}
      </p>
      {gpc ? (
        <p className="text-cream/50 text-xs leading-relaxed">
          To allow the pixel, turn off Global Privacy Control in the browser, then return here.
        </p>
      ) : (
        <button type="button" onClick={toggle} className="btn-hero-primary">
          {optedOut ? 'Allow Meta Pixel on this browser' : 'Turn off Meta Pixel on this browser'}
        </button>
      )}
    </div>
  );
};

export default MetaPixelChoice;
