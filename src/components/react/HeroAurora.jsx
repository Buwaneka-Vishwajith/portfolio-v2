import Aurora from './Aurora/Aurora';

/**
 * Aurora hanging from the top of the page, behind the hero (React Bits Aurora).
 * lightMode is off: on the paper background it washed these colours out.
 * Pauses off screen; reduced-motion visitors get a still frame.
 */
export default function HeroAurora() {
  return (
    <Aurora
      colorStops={['#000000', '#06b6d4', '#f97316']}
      amplitude={1}
      blend={0.5}
      height={0.2}
      speed={1}
      glow={0.6}
      direction="top"
      mouseInteraction
      intro
    />
  );
}
