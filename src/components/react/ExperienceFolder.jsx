import Folder from './Folder/Folder.jsx';

// Folder colours, used in order. Set "color" on an entry in
// src/data/experience.json to pick one yourself.
const PALETTE = ['#0297DE', '#FC734D', '#393E46', '#2DD4BF'];

const RolePage = ({ role }) => (
  <div className="exp-page">
    <span className="exp-page__kicker">Role</span>
    <span className="exp-page__title">{role.position}</span>
    <span className="exp-page__meta">{role.company}</span>
    <span className="exp-page__meta">{role.period}</span>
  </div>
);

const HighlightsPage = ({ role }) => (
  <div className="exp-page">
    <span className="exp-page__kicker">Highlights</span>
    <ul className="exp-page__list">
      {role.description.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  </div>
);

const StackPage = ({ role }) => (
  <div className="exp-page">
    <span className="exp-page__kicker">Tools</span>
    <ul className="exp-page__chips">
      {role.technologies.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  </div>
);

/** One experience as a folder. Click to open; click a page to zoom. */
export default function ExperienceFolder({ role, index }) {
  return (
    <Folder
      label={role.tab || role.company}
      color={role.color || PALETTE[index % PALETTE.length]}
      paperColor="#ffffff"
      theme="light"
      variant="solid"
      mode="flap"
      layout="spread"
      size={1.15}
      draggable={false}
      items={[
        { content: <RolePage role={role} /> },
        ...(role.description.length ? [{ content: <HighlightsPage role={role} /> }] : []),
        ...(role.technologies.length ? [{ content: <StackPage role={role} /> }] : []),
      ]}
    />
  );
}
