import ShinyText from './ShinyText/ShinyText';

/**
 * Section headings (From CAD to code, Selected work, Experience, Writing):
 * a soft band of light sweeps across the ink text every few seconds.
 * Wraps whatever is inside it, so the serif spans and the stickers keep working.
 * The text is server-rendered in plain ink, so it reads fine before (and without) JS.
 */
export default function ShinyTitle({ children }) {
  return (
    <ShinyText
      color="#0f1012"
      shineColor="#9a9ea6"
      speed={2.4}
      delay={2.5}
      angle={120}
      shineWidth={40}
      softness={0.8}
      trigger="loop"
    >
      {children}
    </ShinyText>
  );
}
