import { useEffect, useState } from 'react';
import DitherVeil from './DitherVeil/DitherVeil';

/**
 * About-me portrait effect. Sits on top of the real <Picture> (which stays for
 * SEO, screen readers and no-JS), and fades in once mounted.
 * Colours match the site: ink #0f1012, paper #f4f4f0.
 */
export default function PortraitVeil({ src }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    // Skip on browsers without WebGL; the plain photo underneath stays visible.
    const ok = !!document.createElement('canvas').getContext('webgl2');
    if (ok) setOn(true);
  }, []);
  // The empty frame is always rendered so client:visible has something to watch.
  return (
    <div aria-hidden="true" className="pointer-events-auto absolute inset-0 overflow-hidden rounded-[6px]">
      {on && <DitherVeil
        src={src}
        fit="cover"
        pattern="floyd"
        pixelSize={2}
        inkColor="#0f1012"
        paperColor="#f4f4f0"
        revealRadius={120}
        softness={0.6}
        linger={1}
      />}
    </div>
  );
}
