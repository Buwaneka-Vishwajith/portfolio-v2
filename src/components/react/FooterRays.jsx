import SideRays from './SideRays/SideRays';

/**
 * Light rays shining into the dark footer from the top-right (React Bits SideRays).
 * Peach + cyan, matching the hero gradient. Pauses off screen; reduced-motion visitors
 * get gentle, near-still rays.
 */
export default function FooterRays() {
  return (
    <SideRays
      rayColor1="#fbb98f"
      rayColor2="#9fdde8"
      origin="top-right"
      speed={2}
      intensity={2}
      spread={3}
      falloff={0.9}
      density={5}
      followMouse
    />
  );
}
