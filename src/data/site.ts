// Site-wide details. Change them here and they update everywhere.

export const site = {
  name: 'Buwaneka Vishwajith',
  shortName: 'Buwaneka',
  role: 'Full stack engineer',
  location: 'Kandy, Sri Lanka',
  email: 'buwaneka10000@gmail.com',
  cv: '/Buwaneka_Senarathne_cv.pdf',
  description:
    'Buwaneka Vishwajith — full stack engineer from Kandy, Sri Lanka. From mechanical engineering to building web and cloud systems.',
};

export const socials = [
  { label: 'GitHub', href: 'https://github.com/Buwaneka-Vishwajith' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/buwaneka-vishwajith-645378206/' },
  { label: 'Medium', href: 'https://medium.com/@buwaneka10000' },
];

export const nav = [
  { label: 'About', href: '/#about' },
  { label: 'Work', href: '/#work' },
  { label: 'Playground', href: '/#playground' },
];

// Shown in the scrolling tech strip under the hero (LogoLoop).
// `icon` is a Simple Icons name from react-icons/si (browse: https://react-icons.github.io/react-icons/icons/si/).
// Add the same name to the ICONS map in src/components/react/TechLoop.jsx when you use a new one.
// `color` is the brand color the logo turns on hover.
export const stack = [
  { title: 'JavaScript', icon: 'SiJavascript', href: 'https://developer.mozilla.org/docs/Web/JavaScript', color: '#e8c400' },
  { title: 'TypeScript', icon: 'SiTypescript', href: 'https://www.typescriptlang.org', color: '#3178c6' },
  { title: 'React', icon: 'SiReact', href: 'https://react.dev', color: '#149eca' },
  { title: 'Node.js', icon: 'SiNodedotjs', href: 'https://nodejs.org', color: '#5fa04e' },
  { title: 'Express', icon: 'SiExpress', href: 'https://expressjs.com' },
  { title: 'MongoDB', icon: 'SiMongodb', href: 'https://www.mongodb.com', color: '#47a248' },
  { title: 'MySQL', icon: 'SiMysql', href: 'https://www.mysql.com', color: '#4479a1' },
  { title: 'Java', icon: 'SiOpenjdk', href: 'https://dev.java' },
  { title: 'Kotlin', icon: 'SiKotlin', href: 'https://kotlinlang.org', color: '#7f52ff' },
  { title: 'Python', icon: 'SiPython', href: 'https://www.python.org', color: '#3776ab' },
  { title: 'Docker', icon: 'SiDocker', href: 'https://www.docker.com', color: '#2496ed' },
  { title: 'Kubernetes', icon: 'SiKubernetes', href: 'https://kubernetes.io', color: '#326ce5' },
  { title: 'Tailwind CSS', icon: 'SiTailwindcss', href: 'https://tailwindcss.com', color: '#06b6d4' },
  { title: 'Git', icon: 'SiGit', href: 'https://git-scm.com', color: '#f05032' },
];
