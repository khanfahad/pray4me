import { useState, useEffect } from 'react';
import { getCategoryById } from '../services/data';

export default function DuaMode({ requests, sunnahDuas = [], isAtHolySite, onMakeDua, onClose }) {
  const allItems = [
    ...sunnahDuas.map(d => ({ ...d, _isSunnah: true })),
    ...requests,
  ];

  const [index, setIndex] = useState(0);
  const [made, setMade] = useState(new Set());
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  // Clamp index if allItems shrinks (e.g. a request is removed while DuaMode is open)
  useEffect(() => {
    if (allItems.length > 0 && index >= allItems.length) {
      setIndex(allItems.length - 1);
    }
  }, [allItems.length]);

  if (allItems.length === 0) {
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

  const current = allItems[index];
  const isMade = made.has(current.id);
  const isSunnah = current._isSunnah === true;
  const category = !isSunnah ? getCategoryById(current.category) : null;
  const displayName = isSunnah
    ? current.title
    : (current.isAnonymous ? 'Anonymous Muslim' : current.requesterName);
  const displayText = isSunnah
    ? current.translation
    : (current.customText || current.suggestedDua || category?.defaultText || '');

  const handleMade = async () => {
    if (confirming || isMade) return;
    setConfirming(true);
    try {
      if (!isSunnah) {
        await onMakeDua(current);
      }
      const newMade = new Set([...made, current.id]);
      setMade(newMade);
      if (newMade.size === allItems.length) {
        setTimeout(() => setDone(true), 1000);
      } else {
        setTimeout(() => {
          if (index < allItems.length - 1) setIndex(i => i + 1);
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
    if (i >= 0 && i < allItems.length) setIndex(i);
  };

  const pct = (made.size / allItems.length) * 100;

  return (
    <div className="dua-mode-overlay">
      {/* Header */}
      <div className="dua-mode-header">
        <button className="dua-mode-close" onClick={onClose} aria-label="Close dua mode">✕</button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="dua-mode-title">Dua Mode</div>
          {isAtHolySite && <div className="dua-mode-site-badge">🕌 Holy Site</div>}
        </div>
        <div className="dua-mode-tally">{made.size}/{allItems.length}</div>
      </div>

      {/* Progress bar */}
      <div className="dua-mode-progress-track">
        <div className="dua-mode-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* Card */}
      <div className="dua-mode-card fade-in" key={current.id}>
        {isSunnah ? (
          <div className="dua-mode-sunnah-tag">📖 Quran & Sunnah</div>
        ) : (
          current.holyOnly && <div className="dua-mode-holy-tag">🕌 Holy sites only</div>
        )}
        <div className="dua-mode-index">{index + 1} of {allItems.length}</div>

        {isSunnah ? (
          <>
            <div className="dua-mode-category-pill" style={{ background: 'rgba(200,169,81,0.18)', color: '#C8A951' }}>
              {current.theme}
            </div>
            <div className="dua-mode-name">{displayName}</div>
            <div className="arabic-text" style={{ fontSize: '1.25rem', color: '#C8A951', margin: '14px 0 10px', lineHeight: 2 }}>
              {current.arabic}
            </div>
            <div className="dua-mode-text">"{displayText}"</div>
            <div className="dua-mode-prev-count" style={{ marginTop: 8 }}>
              — {current.source}
            </div>
          </>
        ) : (
          <>
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
          </>
        )}

        {isMade && (
          <div className="dua-mode-made-badge fade-in">
            ✓ Ameen — May Allah Accept
          </div>
        )}
      </div>

      {/* Confirm button */}
      <div className="dua-mode-action">
        <button
          className={`dua-mode-confirm-btn ${isMade ? 'made' : isAtHolySite && !isSunnah ? 'holy' : 'anywhere'}`}
          onClick={handleMade}
          disabled={isMade || confirming}
        >
          {confirming
            ? 'Recording...'
            : isMade
              ? '✓  Ameen'
              : isAtHolySite && !isSunnah
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
          {allItems.slice(Math.max(0, index - 2), Math.min(allItems.length, index + 3)).map((r, i) => {
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
          disabled={index === allItems.length - 1}
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
            You've completed all {allItems.length} duas.<br/>
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
