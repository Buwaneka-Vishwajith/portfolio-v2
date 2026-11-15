import FlexCarousel from './FlexCarousel/FlexCarousel.jsx';

/**
 * Medium articles in the FlexCarousel. Click a side card to bring it to the
 * centre; click the centre card (or press Enter) to open the article.
 */
export default function ArticleCarousel({ articles }) {
  const items = articles.map((a) => ({
    src: a.cover,
    alt: a.title,
    title: a.title,
    subtitle: a.subtitle,
  }));

  const open = (index) => {
    const article = articles[index];
    if (article) window.open(article.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <FlexCarousel
      items={items}
      preset="liquid"
      intro="rise"
      fit="landscape"
      cardHeight={0.5}
      gap={16}
      radius={14}
      squeeze={0.2}
      focusOnClick={false}
      captureWheel={false}
      captions
      onSelect={open}
    />
  );
}
