import ImageTrail from './ImageTrail/ImageTrail';

/**
 * A light trail of the Spidey mask while the cursor moves over the project bento grid
 * (React Bits ImageTrail). One image, repeated a few times so a short trail can form.
 * Kept small and quick on purpose. Reduced-motion visitors get no trail.
 */
const COPIES = 5;

export default function SpideyTrail({ src }) {
  return (
    <ImageTrail
      items={Array.from({ length: COPIES }, () => src)}
      size={64}
      aspectRatio={1}
      radius="50%"
      threshold={90}
      appearScale={0.4}
      lifetime={0.5}
      exitScale={0.3}
      rotation={18}
      zone="[data-trail-zone]"
      className="pointer-events-none"
    />
  );
}
