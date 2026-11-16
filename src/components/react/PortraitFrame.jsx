import LensImage from './LensImage/LensImage';

/**
 * About-me portrait effect: a soft lens follows the cursor (and drifts on its own
 * when the cursor is away) and blurs the photo inside it, with a little colour fringing.
 * Sits on top of the real <Picture>, which shows until this is ready (and for no-JS / no-WebGL).
 * Set focus to true to flip it: photo blurred, the cursor brings it into focus.
 */
export default function PortraitFrame({ src }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      <LensImage src={src} blur={16} lensSize={0.6} lensSoftness={0.7} chroma={0.3} idle />
    </div>
  );
}
