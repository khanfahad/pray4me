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

export default function DuaCard({ request, isAtHolySite, showMakeDuaButton, onMakeDua, isDuaJustMade }) {
  const category = getCategoryById(request.category);

  const displayName = request.isAnonymous
    ? 'Anonymous Muslim'
    : isAtHolySite ? request.requesterName : 'A Muslim';

  const displayText = request.customText || request.suggestedDua || category?.defaultText || '';

  return (
    <div
      className={`card dua-card fade-in ${isDuaJustMade ? 'celebrated' : ''}`}
    >
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
        <div className="dua-card-count-bubble">
          <div className="count-num">{request.duasMadeCount}</div>
          <div className="count-label">duas</div>
        </div>
      </div>

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
          className={`btn ${isDuaJustMade ? 'btn-gold celebrate' : 'btn-primary'}`}
          onClick={onMakeDua}
          disabled={isDuaJustMade}
        >
          {isDuaJustMade ? '✓  Ameen — May Allah Accept' : '🤲  I Made This Dua'}
        </button>
      )}
    </div>
  );
}
