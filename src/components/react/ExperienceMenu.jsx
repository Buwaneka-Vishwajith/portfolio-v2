import FlowingMenu from './FlowingMenu/FlowingMenu.jsx';

/**
 * Experience as a FlowingMenu: one row per role showing the job title.
 * Hover a row and a band slides over it with the company name scrolling past.
 * Data comes from src/data/experience.json.
 */
export default function ExperienceMenu({ roles }) {
  const items = roles.map((role) => ({
    text: role.position,
    meta: role.period,
    marquee: role.company,
  }));

  return (
    <FlowingMenu
      items={items}
      ariaLabel="Experience"
      speed={60}
      stretch={0.6}
      magnet={0.25}
      followCursor={0.4}
      textColor="#0f1012"
      bgColor="transparent"
      marqueeBgColor="#0f1012"
      marqueeTextColor="#f4f4f0"
      borderColor="rgba(15, 16, 18, 0.14)"
      style={{ height: `clamp(${roles.length * 4.5}rem, ${roles.length * 9}vw, ${roles.length * 8}rem)` }}
    />
  );
}
