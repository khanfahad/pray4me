import { getCategoryById } from '../services/data';

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DuaCard({ request, isAtHolySite, showMakeDuaButton, onMakeDua, isDuaJustMade }) {
  const category = getCategoryById(request.category);

  const displayName = request.isAnonymous
    ? 'A Muslim Brother/Sister'
    : isAtHolySite ? request.requesterName : 'A Muslim';

  const displayText = request.customText || request.suggestedDua || category?.defaultText || '';

  return (
    <div className={`card dua-card fade-in ${isDuaJustMade ? 'pulse' : ''}`}
      style={isDuaJustMade ? { border: '2px solid var(--gold)' } : {}}>
      <div className="dua-card-header">
        <div>
          <div className="dua-card-name">{displayName}</div>
          <div className="dua-card-category">
            <span>{category?.icon}</span>
            <span>{category?.name}</span>
          </div>
        </div>
        <div className="dua-card-count">
          <div className="count-num">{request.duasMadeCount}</div>
          <div className="count-label">duas</div>
        </div>
      </div>

      <p className="dua-card-text">{displayText}</p>
      <p className="dua-card-time">{timeAgo(request.createdAt)}</p>

      {showMakeDuaButton && (
        <button
          className={`btn ${isDuaJustMade ? 'btn-gold' : 'btn-primary'}`}
          onClick={onMakeDua}
          disabled={isDuaJustMade}
        >
          {isDuaJustMade ? '✓ Ameen — Dua Made' : '🤲 I Made This Dua'}
        </button>
      )}
    </div>
  );
}
