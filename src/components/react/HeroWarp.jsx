import { useEffect, useState } from 'react';
import WarpText from './WarpText/WarpText.jsx';
// Pixel eye that replaces the word "EYE" (drawn in the text colour, warps with the letters).
import eyeUrl from '../../assets/icons/eye-pixel.svg?url';

const EYE = '\uE000'; // placeholder character in the text below
const loadEye = () =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = eyeUrl;
  });

// Fonts per line, matching the .headline / .headline-serif styles.
const DISPLAY = {
  fontFamily: '"Archivo Variable", "Arial Narrow", sans-serif',
  fontWeight: 800,
  fontStretch: 'extra-condensed', // ≈ the 62% width used in CSS
  letterSpacingEm: -0.02,
};
const SERIF = {
  fontFamily: '"Instrument Serif", Georgia, serif',
  fontWeight: 400,
  letterSpacingEm: -0.01,
};

// Wide screens: 2 lines. Phones: 3 lines, so the text stays large.
const LAYOUTS = {
  wide: {
    text: `ENGINEER\nWITH A DESIGNER'S ${EYE}`,
    lineFonts: [DISPLAY, SERIF],
    height: 'clamp(220px, 24vw, 460px)',
  },
  narrow: {
    text: `ENGINEER\nWITH A DESIGNER'S ${EYE}`,
    lineFonts: [DISPLAY, SERIF, SERIF],
    height: 'clamp(220px, 62vw, 340px)',
  },
};

export default function HeroWarp() {
  const [layout, setLayout] = useState(null);
  const [glyphs, setGlyphs] = useState(null);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)');
    const pick = () => setLayout(query.matches ? LAYOUTS.narrow : LAYOUTS.wide);

    // Make sure both fonts are loaded before the text is drawn into WebGL,
    // otherwise the first frame would use a fallback font.
    Promise.all([
      document.fonts.load('800 100px "Archivo Variable"').catch(() => {}),
      document.fonts.load('400 100px "Instrument Serif"').catch(() => {}),
      loadEye(),
    ]).then(([, , eye]) => {
      // scale: icon box vs the serif cap height; trim: empty space on the icon's left/right edges.
      setGlyphs(eye ? { [EYE]: { image: eye, scale: 1.4, trim: -0.1 } } : null);
      pick();
    });

    query.addEventListener('change', pick);
    return () => query.removeEventListener('change', pick);
  }, []);

  if (!layout) return <div style={{ height: LAYOUTS.wide.height }} />;

  return (
    <WarpText
      key={layout.text}
      text={glyphs ? layout.text : layout.text.replace(EYE, 'EYE')}
      glyphs={glyphs}
      lineFonts={layout.lineFonts}
      fontSize="var(--text-hero)"
      lineHeight={0.9}
      warpStrength={0.08}
      warpScale={1.7}
      speed={0.55}
      lens="bulge"
      pointerInfluence={0.42}
      pointerStrength={0.38}
      refraction={0.018}
      chromatic={0.35}
      idleDrift={0.2}
      ripple
      clickRipple
      intro
      style={{ height: layout.height }}
    />
  );
}
