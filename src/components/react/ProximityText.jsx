import VariableProximity from './VariableProximity/VariableProximity';

/**
 * Section-heading words that react to the cursor (React Bits VariableProximity).
 * - variant "bold":  the condensed Archivo headline; letters near the cursor widen and get heavier.
 * - variant "serif": Instrument Serif has no weight/width axes, so those letters grow and lift a touch instead.
 * Each heading is split into a few of these so the serif words, stickers and line breaks keep working.
 * The letters are server-rendered at rest, so headings look the same before (and without) JS.
 */
const VARIANTS = {
  bold: {
    from: "'wght' 800, 'wdth' 62",
    to: "'wght' 900, 'wdth' 96",
    scale: 1,
    lift: 0,
  },
  serif: {
    from: "'wght' 400",
    to: "'wght' 400",
    scale: 1.16,
    lift: 0.06,
  },
};

export default function ProximityText({ text, variant = 'bold' }) {
  const v = VARIANTS[variant] ?? VARIANTS.bold;
  return (
    <VariableProximity
      label={text}
      fromFontVariationSettings={v.from}
      toFontVariationSettings={v.to}
      scale={v.scale}
      lift={v.lift}
      radius={140}
      falloff="gaussian"
      smoothing={0.25}
    />
  );
}
