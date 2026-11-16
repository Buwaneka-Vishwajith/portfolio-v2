import { useEffect, useRef, useState } from 'react';
import CurvedLoop from './CurvedLoop/CurvedLoop';

/**
 * The Playground's tagline as a moving strip of text (React Bits CurvedLoop) that runs
 * diagonally behind the memory game:
 *  - left end: the left edge of the screen, level with the bottom of the game card
 *  - right end: the right edge of the screen, a little above "Bored of scrolling?"
 * The angle comes from those two points and is capped at MAX_ANGLE (phones get steep otherwise).
 * Positions are measured from the page, so it stays right at any screen size.
 */
const MAX_ANGLE = 30; // degrees
const LIFT = 28; // px the right end sits above the heading

export default function PlaygroundLoop({ text }) {
  const layerRef = useRef(null);
  const [geo, setGeo] = useState(null);

  useEffect(() => {
    const layer = layerRef.current;
    const section = layer?.closest('section');
    if (!section) return undefined;
    const heading = section.querySelector('h2');
    const game = section.querySelector('.memory-game');
    let lastWidth = 0;

    const measure = (force) => {
      const box = layer.getBoundingClientRect();
      if (!force && Math.abs(box.width - lastWidth) < 1) return; // only re-measure when the width changes
      lastWidth = box.width;
      const W = box.width;
      const gameBottom = game ? game.getBoundingClientRect().bottom - box.top : box.height * 0.8;
      const headTop = heading ? heading.getBoundingClientRect().top - box.top - LIFT : 0;
      let angle = Math.atan2(gameBottom - headTop, W);
      angle = Math.min(angle, (MAX_ANGLE * Math.PI) / 180);
      const length = W / Math.cos(angle);
      // Letter size in real px, then converted to the component's 1440-wide units.
      const px = Math.min(48, Math.max(20, W * 0.032));
      setGeo({
        y: gameBottom,
        angle: (angle * 180) / Math.PI,
        length,
        fontSize: (px * 1440) / length,
      });
    };

    measure(true);
    const ro = new ResizeObserver(() => measure(false));
    ro.observe(layer);
    // Fonts change the heading's position slightly once they load.
    document.fonts?.ready.then(() => measure(true));
    return () => ro.disconnect();
  }, []);

  const height = geo ? geo.length * 0.12 : 0; // the strip's SVG is 100:12

  return (
    <div ref={layerRef} className="playground-loop pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {geo && (
        <div
          className="pointer-events-auto absolute left-0 text-ink"
          style={{
            top: geo.y - height / 2,
            width: geo.length,
            height,
            transformOrigin: '0 50%',
            transform: `rotate(${-geo.angle}deg)`,
          }}
        >
          <CurvedLoop
            marqueeText={text}
            shape="line"
            speed={1.2}
            direction="left"
            fontSize={geo.fontSize}
            fontWeight={400}
            separator="✦"
            separatorColor="#fc734d"
            className="playground-loop__text"
            interactive
          />
        </div>
      )}
    </div>
  );
}
