const STATUSES = [
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'refunded', label: 'Refunded' },
] as const

const TYPE_SCALE = [
  { token: '--font-size-h1', label: 'H1', weight: 'var(--font-weight-bold)', sample: 'Order #48213' },
  { token: '--font-size-h2', label: 'H2', weight: 'var(--font-weight-bold)', sample: 'Customer details' },
  { token: '--font-size-h3', label: 'H3', weight: 'var(--font-weight-medium)', sample: 'Shipping address' },
  { token: '--font-size-body', label: 'Body', weight: 'var(--font-weight-regular)', sample: 'Placed on July 14, 2026.' },
  { token: '--font-size-caption', label: 'Caption', weight: 'var(--font-weight-regular)', sample: 'Last updated 2 minutes ago' },
] as const

function DesignSystemPage() {
  return (
    <div className="ds">
      <style>{`
        .ds {
          min-height: 100svh;
          background: var(--surface-bg-app);
          color: var(--text-primary);
          font-family: var(--font-family-base);
          padding: var(--space-layout-gap);
          box-sizing: border-box;
        }
        .ds *, .ds *::before, .ds *::after { box-sizing: border-box; }
        .ds-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-lg);
          flex-wrap: wrap;
          margin-bottom: var(--space-xl);
        }
        .ds-title {
          font-size: var(--font-size-h1);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          margin: 0 0 var(--space-xs);
        }
        .ds-subtitle {
          font-size: var(--font-size-body);
          color: var(--text-secondary);
          margin: 0;
        }
        .ds-section {
          margin-bottom: var(--space-xl);
        }
        .ds-section-title {
          font-size: var(--font-size-h3);
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          margin: 0 0 var(--space-md);
        }
        .ds-panel {
          background: var(--surface-bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-card);
          padding: var(--space-card-padding);
        }
        .ds-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-lg);
        }
        .ds-swatch-label {
          font-size: var(--font-size-caption);
          color: var(--text-secondary);
          margin-top: var(--space-sm);
        }
        .ds-surface-app {
          background: var(--surface-bg-app);
          border: 1px dashed var(--border-strong);
          border-radius: var(--radius-card);
          padding: var(--space-lg);
          flex: 1 1 260px;
        }
        .ds-surface-panel {
          background: var(--surface-bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-card);
          padding: var(--space-md);
        }
        .ds-text-primary {
          font-size: var(--font-size-body);
          color: var(--text-primary);
          margin: 0 0 var(--space-xs);
        }
        .ds-text-secondary {
          font-size: var(--font-size-body);
          color: var(--text-secondary);
          margin: 0;
        }
        .ds-accent-swatch {
          flex: 1 1 160px;
          border-radius: var(--radius-card);
          padding: var(--space-lg);
          color: var(--accent-fg);
          font-size: var(--font-size-body);
          font-weight: var(--font-weight-medium);
        }
        .ds-accent-base { background: var(--accent-base); }
        .ds-accent-hover { background: var(--accent-hover); }
        .ds-accent-button {
          font-family: var(--font-family-base);
          font-size: var(--font-size-body);
          font-weight: var(--font-weight-medium);
          color: var(--accent-fg);
          background: var(--accent-base);
          border: none;
          border-radius: var(--radius-button);
          padding: var(--space-sm) var(--space-lg);
          cursor: pointer;
        }
        .ds-accent-button:hover {
          background: var(--accent-hover);
        }
        .ds-accent-button:focus-visible {
          outline: none;
          box-shadow: var(--focus-ring);
        }
        .ds-badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }
        .ds-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-xs) var(--space-md);
          border-radius: var(--radius-badge);
          font-size: var(--font-size-caption);
          font-weight: var(--font-weight-medium);
        }
        .ds-badge-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-badge);
          flex-shrink: 0;
        }
        .ds-status-pending { background: var(--status-pending-bg); color: var(--status-pending-text); }
        .ds-status-pending .ds-badge-dot { background: var(--status-pending-accent); }
        .ds-status-paid { background: var(--status-paid-bg); color: var(--status-paid-text); }
        .ds-status-paid .ds-badge-dot { background: var(--status-paid-accent); }
        .ds-status-shipped { background: var(--status-shipped-bg); color: var(--status-shipped-text); }
        .ds-status-shipped .ds-badge-dot { background: var(--status-shipped-accent); }
        .ds-status-delivered { background: var(--status-delivered-bg); color: var(--status-delivered-text); }
        .ds-status-delivered .ds-badge-dot { background: var(--status-delivered-accent); }
        .ds-status-cancelled { background: var(--status-cancelled-bg); color: var(--status-cancelled-text); }
        .ds-status-cancelled .ds-badge-dot { background: var(--status-cancelled-accent); }
        .ds-status-refunded { background: var(--status-refunded-bg); color: var(--status-refunded-text); }
        .ds-status-refunded .ds-badge-dot { background: var(--status-refunded-accent); }
        .ds-focus-demo-btn {
          font-family: var(--font-family-base);
          font-size: var(--font-size-body);
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          background: var(--surface-bg-app);
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-button);
          padding: var(--space-sm) var(--space-lg);
          cursor: pointer;
        }
        .ds-focus-demo-btn:focus-visible {
          outline: none;
          box-shadow: var(--focus-ring);
        }
        .ds-type-row {
          display: flex;
          align-items: baseline;
          gap: var(--space-md);
          padding: var(--space-sm) 0;
          border-bottom: 1px solid var(--border-subtle);
        }
        .ds-type-row:last-child { border-bottom: none; }
        .ds-type-token {
          flex: 0 0 90px;
          font-size: var(--font-size-caption);
          color: var(--text-secondary);
        }
        .ds-type-sample {
          color: var(--text-primary);
        }
        .ds-shadow-panel {
          flex: 1 1 220px;
          background: var(--surface-bg-panel);
          border-radius: var(--radius-card);
          padding: var(--space-card-padding);
        }
        .ds-shadow-card { box-shadow: var(--shadow-card); }
        .ds-shadow-overlay { box-shadow: var(--shadow-overlay); }
      `}</style>

      <header className="ds-header">
        <div>
          <p className="ds-title">Design System</p>
          <p className="ds-subtitle">Live reference for every token in src/shared/styles/tokens.css</p>
        </div>
      </header>

      <section className="ds-section">
        <h2 className="ds-section-title">Surfaces</h2>
        <div className="ds-row">
          <div className="ds-surface-app">
            <p className="ds-swatch-label" style={{ marginTop: 0 }}>
              --surface-bg-app / --border-strong (dashed)
            </p>
            <div className="ds-surface-panel">
              <p className="ds-swatch-label" style={{ marginTop: 0 }}>
                --surface-bg-panel / --border-subtle
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ds-section">
        <h2 className="ds-section-title">Text</h2>
        <div className="ds-panel">
          <p className="ds-text-primary">--text-primary — the customer confirmed order #48213.</p>
          <p className="ds-text-secondary">--text-secondary — placed 2 minutes ago via mobile checkout.</p>
        </div>
      </section>

      <section className="ds-section">
        <h2 className="ds-section-title">Accent</h2>
        <div className="ds-row">
          <div className="ds-accent-swatch ds-accent-base">--accent-base + --accent-fg</div>
          <div className="ds-accent-swatch ds-accent-hover">--accent-hover + --accent-fg</div>
          <button type="button" className="ds-accent-button">
            Hover or Tab me
          </button>
        </div>
      </section>

      <section className="ds-section">
        <h2 className="ds-section-title">Order status badges</h2>
        <div className="ds-badge-row">
          {STATUSES.map(({ key, label }) => (
            <span key={key} className={`ds-badge ds-status-${key}`}>
              <span className="ds-badge-dot" />
              {label}
            </span>
          ))}
        </div>
      </section>

      <section className="ds-section">
        <h2 className="ds-section-title">Focus ring</h2>
        <div className="ds-panel">
          <button type="button" className="ds-focus-demo-btn">
            Press Tab to focus this button
          </button>
        </div>
      </section>

      <section className="ds-section">
        <h2 className="ds-section-title">Type scale</h2>
        <div className="ds-panel">
          {TYPE_SCALE.map(({ token, label, weight, sample }) => (
            <div key={token} className="ds-type-row">
              <span className="ds-type-token">
                {label}
                <br />
                {token}
              </span>
              <span className="ds-type-sample" style={{ fontSize: `var(${token})`, fontWeight: weight }}>
                {sample}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="ds-section">
        <h2 className="ds-section-title">Elevation</h2>
        <div className="ds-row">
          <div className="ds-shadow-panel ds-shadow-card">
            <p className="ds-text-primary" style={{ marginBottom: 'var(--space-xs)' }}>
              --shadow-card
            </p>
            <p className="ds-text-secondary">Resting elevation for cards and list rows.</p>
          </div>
          <div className="ds-shadow-panel ds-shadow-overlay">
            <p className="ds-text-primary" style={{ marginBottom: 'var(--space-xs)' }}>
              --shadow-overlay
            </p>
            <p className="ds-text-secondary">Raised elevation for modals and popovers.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DesignSystemPage
