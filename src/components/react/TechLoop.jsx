import {
  SiJavascript, SiTypescript, SiReact, SiNodedotjs, SiExpress, SiMongodb, SiMysql,
  SiOpenjdk, SiKotlin, SiPython, SiDocker, SiKubernetes, SiTailwindcss, SiGit,
} from 'react-icons/si';
import LogoLoop from './LogoLoop/LogoLoop.jsx';
import { stack } from '../../data/site';

// Icons used by the `stack` list in src/data/site.ts. Imported one by one
// so only these end up in the page's JavaScript.
const ICONS = {
  SiJavascript, SiTypescript, SiReact, SiNodedotjs, SiExpress, SiMongodb, SiMysql,
  SiOpenjdk, SiKotlin, SiPython, SiDocker, SiKubernetes, SiTailwindcss, SiGit,
};

const logos = stack.map(({ title, icon, href, color }) => {
  const Icon = ICONS[icon];
  if (!Icon) console.warn(`TechLoop: no icon "${icon}" for ${title}; add it to ICONS.`);
  return {
    node: Icon ? <Icon /> : <span>{title}</span>,
    title,
    href,
    hoverColor: color,
  };
});

export default function TechLoop() {
  return (
    <LogoLoop
      logos={logos}
      speed={60}
      direction="left"
      logoHeight={30}
      gap={56}
      hoverSpeed={0}
      labels="inline"
      scaleOnHover
      fadeOut
      fadeOutWidth={0.1}
      ariaLabel="Technologies I work with"
    />
  );
}
