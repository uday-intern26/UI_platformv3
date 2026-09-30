import './PlatformFooter.css';

export function PlatformFooter() {
  return (
    <footer className="platform-footer">
      <div className="footer-brand">
        <strong>AIJewel</strong>
        <span className="footer-tagline">Build · Orchestrate · Govern · Scale</span>
      </div>
      <div className="footer-pillars">
        {['Secure', 'Observable', 'Extensible', 'Future Ready'].map((item) => (
          <span key={item} className="footer-pill">
            <i className="footer-dot" />
            {item}
          </span>
        ))}
      </div>
      <span className="footer-sub">Enterprise AI Platform for Jewelry</span>
    </footer>
  );
}
