import Grainient from './Grainient/Grainient';

/**
 * Hero background: a slow, grainy gradient (React Bits Grainient).
 * First colour = the page background, so the edges blend into the site.
 * Drag the cursor to stir the colours; click for a swirl. Pauses off screen;
 * reduced-motion visitors get a still frame.
 */
export default function HeroGrainient() {
  return (
    <Grainient
      colors={['#efeae2', '#f6dcc8', '#fbb98f', '#f97316', '#9fdde8']}
      type="linear"
      angle={55}
      flow={0.8}
      silk={0.35}
      grainAmount={0.08}
      saturation={0.85}
    />
  );
}
