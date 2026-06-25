import { useState } from 'react';
import { getCategoryById } from '../services/data';

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

function isNew(timestamp) {
  return Date.now() - timestamp < 3600000 * 6;
}

export default function DuaCard({
  request,
  isAtHolySite,
  showMakeDuaButton,
  onMakeDua,
  isDuaJustMade,
  makerIsAtHolySite,
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const category = getCategoryById(request.category);

  const displayName = request.isAnonymous
    ? 'Anonymous Muslim'
    : isAtHolySite ? request.requesterName : 'A Muslim';

  const displayText = request.customText || request.suggestedDua || category?.defaultText || '';

  const holyCount = request.holyDuasCount || 0;
  const otherCount = Math.max(0, (request.duasMadeCount || 0) - holyCount);
  const totalCount = request.duasMadeCount || 0;
  const hasBothTypes = holyCount > 0 && otherCount > 0;

  return (
    <div className={`card card-spiritual dua-card fade-in ${isDuaJustMade ? 'celebrated glow-gold' : ''}`}>

      {/* Holy-site-only badge */}
      {request.holyOnly && (
        <div className="holy-only-badge">
          <span>🕌</span> Holy sites only
        </div>
      )}

      <div className="dua-card-header">
        <div className="dua-card-left">
          <div className="dua-card-name">{displayName}</div>
          <div style={{ marginTop: 5 }}>
            <span className="dua-card-category">
              <span>{category?.icon}</span>
              <span>{category?.name}</span>
            </span>
          </div>
        </div>

        {/* Clickable count bubble */}
        <button
          className={`dua-card-count-bubble ${showBreakdown ? 'expanded' : ''}`}
          onClick={() => totalCount > 0 && setShowBreakdown(s => !s)}
          title={totalCount > 0 ? 'Tap to see breakdown' : undefined}
          style={{ cursor: totalCount > 0 ? 'pointer' : 'default' }}
        >
          {showBreakdown ? (
            <div className="count-breakdown">
              <div className="count-breakdown-row">
                <span className="count-breakdown-icon">🕌</span>
                <span className="count-breakdown-num">{holyCount}</span>
              </div>
              <div className="count-breakdown-divider" />
              <div className="count-breakdown-row">
                <span className="count-breakdown-icon">🌍</span>
                <span className="count-breakdown-num">{otherCount}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="count-num">{totalCount}</div>
              <div className="count-label">
                {totalCount > 0 && hasBothTypes ? 'tap ▾' : 'duas'}
              </div>
            </>
          )}
        </button>
      </div>

      {/* Breakdown hint */}
      {showBreakdown && (
        <div className="count-breakdown-hint fade-in">
          <span>🕌 {holyCount} from holy site{holyCount !== 1 ? 's' : ''}</span>
          <span className="count-breakdown-sep">·</span>
          <span>🌍 {otherCount} from elsewhere</span>
        </div>
      )}

      {displayText ? (
        <p className="dua-card-text">"{displayText}"</p>
      ) : (
        <p className="dua-card-text no-text">{category?.defaultText}</p>
      )}

      <div className="dua-card-footer">
        <span className="dua-card-time">{timeAgo(request.createdAt)}</span>
        {isNew(request.createdAt) && <span className="dua-card-new">✦ New</span>}
      </div>

      {showMakeDuaButton && (
        <button
          className={`btn ${isDuaJustMade ? 'btn-gold celebrate' : makerIsAtHolySite ? 'btn-primary' : 'btn-make-anywhere'}`}
          onClick={onMakeDua}
          disabled={isDuaJustMade}
        >
          {isDuaJustMade
            ? '✓  Ameen — May Allah Accept'
            : makerIsAtHolySite
              ? '🕌  I Made This Dua (Holy Site)'
              : '🤲  I Made This Dua'}
        </button>
      )}
    </div>
  );
}
