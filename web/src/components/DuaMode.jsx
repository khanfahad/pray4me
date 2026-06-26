import { useState, useEffect } from 'react';
import { getCategoryById } from '../services/data';

export default function DuaMode({ requests, isAtHolySite, onMakeDua, onClose }) {
  const [index, setIndex] = useState(0);
  const [made, setMade] = useState(new Set());
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (requests.length > 0 && index >= requests.length) {
      setIndex(requests.length - 1);
    }
  }, [requests.length]);

  if (requests.length === 0) {
    return (
      <div className="dua-mode-overlay">
        <div className="dua-mode-empty">
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🤲</div>
          <p>No duas to show right now.</p>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ marginTop: 12 }}>Close</button>
        </div>
      </div>
    );
  }

  const current = requests[index];
  const isMade = made.has(current.id);
  const category = getCategoryById(current.category);
  const displayName = current.isAnonymous ? 'Anonymous Muslim' : current.requesterName;
  const displayText = current.customText || current.suggestedDua || category?.defaultText || '';

  const handleMade = async () => {
    if (confirming || isMade) return;
    setConfirming(true);
    try {
      await onMakeDua(current);
      const newMade = new Set([...made, current.id]);
      setMade(newMade);
      if (newMade.size === requests.length) {
        setTimeout(() => setDone(true), 1000);
      } else {
        setTimeout(() => {
          if (index < requests.length - 1) setIndex(i => i + 1);
          setConfirming(false);
        }, 1200);
        return;
      }
    } catch {
      // error handled in parent
    }
    setConfirming(false);
  };

  const goTo = (i) => {
    if (i >= 0 && i < requests.length) setIndex(i);
  };

  const pct = (made.size / requests.length) * 100;

  return (
    <div className="dua-mode-overlay">
      {/* Header */}
      <div className="dua-mode-header">
        <button className="dua-mode-close" onClick={onClose} aria-label="Close dua mode">✕</button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="dua-mode-title">Dua Mode</div>
          {isAtHolySite && <div className="dua-mode-site-badge">🕌 Holy Site</div>}
        </div>
        <div className="dua-mode-tally">{made.size}/{requests.length}</div>
      </div>

      {/* Progress bar */}
      <div className="dua-mode-progress-track">
        <div className="dua-mode-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* Card */}
      <div className="dua-mode-card fade-in" key={current.id}>
        {current.holyOnly && <div className="dua-mode-holy-tag">🕌 Holy sites only</div>}
        <div className="dua-mode-index">{index + 1} of {requests.length}</div>

        <div className="dua-mode-category-pill">
          {category?.icon} {category?.name}
        </div>
        <div className="dua-mode-name">{displayName}</div>
        {displayText && (
          <div className="dua-mode-text">"{displayText}"</div>
        )}
        <div className="dua-mode-prev-count">
          {current.duasMadeCount > 0
            ? `${current.duasMadeCount} ${current.duasMadeCount === 1 ? 'person has' : 'people have'} made dua`
            : 'Be the first to make dua'}
        </div>

        {isMade && (
          <div className="dua-mode-made-badge fade-in">
            ✓ Ameen — May Allah Accept
          </div>
        )}
      </div>

      {/* Confirm button */}
      <div className="dua-mode-action">
        <button
          className={`dua-mode-confirm-btn ${isMade ? 'made' : isAtHolySite ? 'holy' : 'anywhere'}`}
          onClick={handleMade}
          disabled={isMade || confirming}
        >
          {confirming
            ? 'Recording...'
            : isMade
              ? '✓  Ameen'
              : isAtHolySite
                ? '🕌  I Made This Dua (Holy Site)'
                : '🤲  I Made This Dua'}
        </button>
      </div>

      {/* Navigation */}
      <div className="dua-mode-nav">
        <button
          className="dua-mode-nav-btn"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
        >
          ← Prev
        </button>
        <div className="dua-mode-dots">
          {requests.slice(Math.max(0, index - 2), Math.min(requests.length, index + 3)).map((r, i) => {
            const realIndex = Math.max(0, index - 2) + i;
            return (
              <button
                key={r.id}
                className={`dua-mode-dot ${realIndex === index ? 'active' : ''} ${made.has(r.id) ? 'made' : ''}`}
                onClick={() => goTo(realIndex)}
              />
            );
          })}
        </div>
        <button
          className="dua-mode-nav-btn"
          onClick={() => goTo(index + 1)}
          disabled={index === requests.length - 1}
        >
          Next →
        </button>
      </div>

      {/* Completion screen */}
      {done && (
        <div className="dua-mode-completion fade-in">
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌙</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'white', fontSize: '1.4rem', marginBottom: 8 }}>
            MashaAllah!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 20 }}>
            You've completed all {requests.length} duas.<br/>
            May Allah accept it from you.
          </p>
          <div className="arabic-text" style={{ fontSize: '1.1rem', color: 'rgba(200,169,81,0.9)', marginBottom: 20 }}>
            آمين يا رب العالمين
          </div>
          <button className="btn btn-gold" onClick={onClose}>Close Dua Mode</button>
        </div>
      )}
    </div>
  );
}
