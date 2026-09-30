import './PlaceholderPage.css';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({
  title,
  description = 'This capability is part of the AIJewel platform roadmap. Full enablement is coming in the next release.',
}: PlaceholderPageProps) {
  return (
    <div className="placeholder-page animate-in">
      <div className="placeholder-icon">◇</div>
      <h2>{title}</h2>
      <p>{description}</p>
      <span className="placeholder-badge">Platform enablement — coming in next release</span>
    </div>
  );
}
