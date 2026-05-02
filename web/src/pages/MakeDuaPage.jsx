import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebase';
import { DUA_CATEGORIES, HOLY_SITES } from '../services/data';
import DuaCard from '../components/DuaCard';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { id: 'shuffle', label: 'Shuffle', icon: '🔀' },
  { id: 'fewest', label: 'Fewest Duas', icon: '↑' },
  { id: 'most', label: 'Most Duas', icon: '↓' },
  { id: 'newest', label: 'Newest', icon: '✦' },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MakeDuaPage({ locationState }) {
  const { user, refreshUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [duaJustMade, setDuaJustMade] = useState(null);
  const [sortMode, setSortMode] = useState('shuffle');
  const [activeCategory, setActiveCategory] = useState('all');
  const [shuffled, setShuffled] = useState([]);

  useEffect(() => {
    const unsub = FirebaseService.listenToActiveRequests((data) => {
      setRequests(data);
      setShuffled(shuffleArray(data));
    });
    return () => unsub?.();
  }, []);

  const filtered = useMemo(() => {
    let list = activeCategory === 'all' ? requests : requests.filter(r => r.category === activeCategory);
    if (sortMode === 'fewest') return [...list].sort((a, b) => a.duasMadeCount - b.duasMadeCount);
    if (sortMode === 'most') return [...list].sort((a, b) => b.duasMadeCount - a.duasMadeCount);
    if (sortMode === 'newest') return [...list].sort((a, b) => b.createdAt - a.createdAt);
    if (sortMode === 'shuffle') {
      const base = activeCategory === 'all' ? shuffled : shuffled.filter(r => r.category === activeCategory);
      return base;
    }
    return list;
  }, [requests, sortMode, activeCategory, shuffled]);

  const handleMakeDua = async (request) => {
    if (!user || !locationState.currentSite) return;
    if (request.requesterId === user.id) {
      toast.error("You can't make dua for your own request here.");
      return;
    }
    try {
      await FirebaseService.markDuaAsMade(request.id, user.id, user.displayName, locationState.currentSite.id);
      setDuaJustMade(request.id);
      await refreshUser();
      toast.success('Ameen! May Allah accept your dua.', { icon: '🤲', duration: 3500 });
      setTimeout(() => setDuaJustMade(null), 3000);
    } catch (err) {
      toast.error('Failed to record dua. Please try again.');
    }
  };

  const usedCategoryIds = [...new Set(requests.map(r => r.category))];
  const usedCategories = DUA_CATEGORIES.filter(c => usedCategoryIds.includes(c.id));

  return (
    <div className="page-content">
      <div className="islamic-header">
        <div className="header-content">
          <div className="icon">🤲</div>
          <h1>Make Dua</h1>
          <p className="subtitle">
            {locationState.currentSite
              ? `📍 ${locationState.currentSite.name} • ${locationState.currentSite.city}`
              : 'Visit a holy site to make dua for others'}
          </p>
        </div>
      </div>
      <div className="header-accent" />

      {locationState.isAtHolySite && locationState.currentSite ? (
        <>
          <div className="container" style={{ marginTop: 18 }}>
            <div className="info-banner green">
              <span className="banner-icon">🕌</span>
              <div className="banner-text">
                <div className="banner-title">You're at a holy site — SubhanAllah!</div>
                Tap "I Made This Dua" after praying for each request. The requester will be notified, in sha Allah.
              </div>
            </div>

            <div className="debug-bar">
              <div className="debug-title">Debug — Simulate Location</div>
              <div className="debug-buttons">
                {HOLY_SITES.map(site => (
                  <button key={site.id} className="debug-btn" onClick={() => locationState.simulateSite(site)}>
                    {site.name}
                  </button>
                ))}
                <button className="debug-btn clear" onClick={locationState.clearSimulation}>✕ Clear</button>
              </div>
            </div>

            <div className="islamic-divider" style={{ margin: '16px 0 0' }}>
              <div className="line"></div><div className="diamond">◆</div><div className="line"></div>
            </div>

            <div className="section-header">
              <span className="section-title">Dua Requests</span>
              <span className="caption">{filtered.length} showing</span>
            </div>
          </div>

          {/* Sort bar */}
          <div className="sort-bar">
            <span className="sort-label">Sort</span>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`sort-btn ${sortMode === opt.id ? 'active' : ''}`}
                onClick={() => {
                  setSortMode(opt.id);
                  if (opt.id === 'shuffle') setShuffled(shuffleArray(requests));
                }}
              >
                <span>{opt.icon}</span> {opt.label}
              </button>
            ))}
          </div>

          {/* Category chips */}
          {usedCategories.length > 1 && (
            <div className="category-chips">
              <button
                className={`category-chip ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                🌍 All
              </button>
              {usedCategories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? 'all' : cat.id)}
                >
                  <span className="chip-icon">{cat.icon}</span> {cat.name}
                </button>
              ))}
            </div>
          )}

          <div className="container">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🤲</div>
                <p>
                  {activeCategory !== 'all'
                    ? 'No requests in this category.'
                    : 'No dua requests at the moment.\nCheck back soon.'}
                </p>
              </div>
            ) : (
              filtered.map(req => (
                <DuaCard
                  key={req.id}
                  request={req}
                  isAtHolySite={true}
                  showMakeDuaButton={true}
                  onMakeDua={() => handleMakeDua(req)}
                  isDuaJustMade={duaJustMade === req.id}
                />
              ))
            )}
          </div>
        </>
      ) : (
        <div className="container" style={{ marginTop: 18 }}>
          <div className="empty-state" style={{ paddingBottom: 12 }}>
            <div className="empty-icon">📍</div>
            <h2 className="subheading" style={{ fontSize: '1.05rem', marginBottom: 8, color: 'var(--charcoal)' }}>
              You're not at a holy site yet
            </h2>
            <p>Making dua for others is available when you're at one of these blessed locations.</p>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            {HOLY_SITES.map(site => (
              <div key={site.id} className="holy-site-row">
                <span className="holy-site-icon">🕌</span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{site.name}</div>
                  <div className="caption">{site.city} · {(site.radius / 1000).toFixed(1)} km radius</div>
                </div>
              </div>
            ))}
          </div>

          <div className="debug-bar">
            <div className="debug-title">Debug — Simulate being at a holy site</div>
            <div className="debug-buttons">
              {HOLY_SITES.map(site => (
                <button key={site.id} className="debug-btn" onClick={() => locationState.simulateSite(site)}>
                  {site.name}
                </button>
              ))}
              <button className="debug-btn clear" onClick={locationState.clearSimulation}>✕ Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
