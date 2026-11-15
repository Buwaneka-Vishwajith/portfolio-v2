import { useEffect, useState } from 'react';
import SwarmCursor from './SwarmCursor/SwarmCursor.jsx';

// Particle colour for the cursor swarm.
const PARTICLE_COLOR = '#393E46';

/**
 * Site-wide cursor swarm: a fixed, click-through layer over the whole page.
 * Only on devices with a real mouse/trackpad, and never for people who
 * prefer reduced motion.
 */
export default function SiteCursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(fine.matches && !calm.matches);
    update();
    fine.addEventListener('change', update);
    calm.addEventListener('change', update);
    return () => {
      fine.removeEventListener('change', update);
      calm.removeEventListener('change', update);
    };
  }, []);

  if (!enabled) return null;

  return (
    <SwarmCursor
      aria-hidden="true"
      lightMode
      color={PARTICLE_COLOR}
      accentColor={PARTICLE_COLOR}
      count={600}
      size={2.4}
      spread={70}
      swirl={0.6}
      tail={0.5}
      idle="hide"
      clickEffect="burst"
      targets=""
      intro={false}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        // Behind all page content: above the page background, below every section and card.
        zIndex: -1,
      }}
    />
  );
}
