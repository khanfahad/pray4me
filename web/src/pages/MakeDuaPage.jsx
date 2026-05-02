import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebase';
import { DUA_CATEGORIES, HOLY_SITES } from '../services/data';
import DuaCard from '../components/DuaCard';
import DuaMode from '../components/DuaMode';
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

function RequestList({ requests, isAtHolySite, onMakeDua, duaJustMade, sortMode, setSortMode, activeCategory, setActiveCategory, onReshuffle, onEnterDuaMode }) {
  const usedCategoryIds = [...new Set(requests.map(r => r.category))];
  const usedCategories = DUA_CATEGORIES.filter(c => usedCategoryIds.includes(c.id));

  return (
    <>
      {/* Dua Mode entry */}
      {requests.length > 0 && (
        <div className="container" style={{ paddingTop: 0, paddingBottom: 0, marginBottom: -4 }}>
          <button className="btn-dua-mode" onClick={onEnterDuaMode}>
            <span>✨</span>
            <span>Start Dua Mode</span>
            <span className="btn-dua-mode-count">{requests.length}</span>
          </button>
        </div>
      )}

      <div className="sort-bar">
        <span className="sort-label">Sort</span>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.id}
            className={`sort-btn ${sortMode === opt.id ? 'active' : ''}`}
            onClick={() => { setSortMode(opt.id); if (opt.id === 'shuffle') onReshuffle(); }}
          >
            <span>{opt.icon}</span> {opt.label}
          </button>
        ))}
      </div>

      {usedCategories.length > 1 && (
        <div className="category-chips">
          <button className={`category-chip ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>🌍 All</button>
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
        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤲</div>
            <p>{activeCategory !== 'all' ? 'No requests in this category.' : 'No dua requests at the moment.\nCheck back soon.'}</p>
          </div>
        ) : (
          requests.map(req => (
            <DuaCard
              key={req.id}
              request={req}
              isAtHolySite={isAtHolySite}
              showMakeDuaButton={true}
              makerIsAtHolySite={isAtHolySite}
              onMakeDua={() => onMakeDua(req)}
              isDuaJustMade={duaJustMade === req.id}
            />
          ))
        )}
      </div>
    </>
  );
}

export default function MakeDuaPage({ locationState }) {
  const { user, refreshUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [duaJustMade, setDuaJustMade] = useState(null);
  const [sortMode, setSortMode] = useState('shuffle');
  const [activeCategory, setActiveCategory] = useState('all');
  const [shuffled, setShuffled] = useState([]);
  const [duaModeActive, setDuaModeActive] = useState(false);

  useEffect(() => {
    const unsub = FirebaseService.listenToActiveRequests((data) => {
      setRequests(data);
      setShuffled(shuffleArray(data));
    });
    return () => unsub?.();
  }, []);

  const applySort = (list) => {
    if (sortMode === 'fewest') return [...list].sort((a, b) => a.duasMadeCount - b.duasMadeCount);
    if (sortMode === 'most') return [...list].sort((a, b) => b.duasMadeCount - a.duasMadeCount);
    if (sortMode === 'newest') return [...list].sort((a, b) => b.createdAt - a.createdAt);
    return list;
  };
  const applyCategory = (list) => activeCategory === 'all' ? list : list.filter(r => r.category === activeCategory);

  const allFiltered = useMemo(() => applySort(applyCategory(sortMode === 'shuffle' ? shuffled : requests)), [requests, sortMode, activeCategory, shuffled]);
  const anywhereFiltered = useMemo(() => applySort(applyCategory((sortMode === 'shuffle' ? shuffled : requests).filter(r => !r.holyOnly))), [requests, sortMode, activeCategory, shuffled]);

  const isAtHolySite = locationState.isAtHolySite && !!locationState.currentSite;
  const displayList = isAtHolySite ? allFiltered : anywhereFiltered;

  const handleMakeDua = async (request, fromHolySite) => {
    if (!user) return;
    if (request.requesterId === user.id) { toast.error("You can't make dua for your own request."); return; }
    try {
      const locationId = (fromHolySite ?? isAtHolySite) ? locationState.currentSite?.id : null;
      await FirebaseService.markDuaAsMade(request.id, user.id, user.displayName, locationId);
      setDuaJustMade(request.id);
      await refreshUser();
      const msg = locationId ? 'Ameen! A blessed dua from a holy site.' : 'Ameen! May Allah accept your dua from wherever you are.';
      toast.success(msg, { icon: '🤲', duration: 3500 });
      setTimeout(() => setDuaJustMade(null), 3000);
    } catch {
      toast.error('Failed to record dua. Please try again.');
    }
  };

  return (
    <div className="page-content">
      <div className="islamic-header">
        <div className="header-content">
          <div className="icon">🤲</div>
          <h1>Make Dua</h1>
          <p className="subtitle">
            {isAtHolySite
              ? `📍 ${locationState.currentSite.name} • ${locationState.currentSite.city}`
              : 'Make dua for your Muslim brothers & sisters'}
          </p>
        </div>
      </div>
      <div className="header-accent" />

      {isAtHolySite ? (
        <>
          <div className="container" style={{ marginTop: 18 }}>
            <div className="info-banner green">
              <span className="banner-icon">🕌</span>
              <div className="banner-text">
                <div className="banner-title">SubhanAllah — you're at a holy site!</div>
                Your duas here carry special blessing. Use Dua Mode for a focused experience, or browse below.
              </div>
            </div>
            <div className="debug-bar">
              <div className="debug-title">Debug — Simulate Location</div>
              <div className="debug-buttons">
                {HOLY_SITES.map(site => (
                  <button key={site.id} className="debug-btn" onClick={() => locationState.simulateSite(site)}>{site.name}</button>
                ))}
                <button className="debug-btn clear" onClick={locationState.clearSimulation}>✕ Clear</button>
              </div>
            </div>
            <div className="islamic-divider" style={{ margin: '16px 0 0' }}>
              <div className="line"></div><div className="diamond">◆</div><div className="line"></div>
            </div>
            <div className="section-header">
              <span className="section-title">All Dua Requests</span>
              <span className="caption">{allFiltered.length} showing</span>
            </div>
          </div>
          <RequestList
            requests={allFiltered}
            isAtHolySite={true}
            onMakeDua={(req) => handleMakeDua(req, true)}
            duaJustMade={duaJustMade}
            sortMode={sortMode} setSortMode={setSortMode}
            activeCategory={activeCategory} setActiveCategory={setActiveCategory}
            onReshuffle={() => setShuffled(shuffleArray(requests))}
            onEnterDuaMode={() => setDuaModeActive(true)}
          />
        </>
      ) : (
        <div style={{ marginTop: 18 }}>
          <div className="container">
            <div className="info-banner gold" style={{ marginBottom: 16 }}>
              <span className="banner-icon">🌍</span>
              <div className="banner-text">
                <div className="banner-title">Make dua from wherever you are</div>
                These requests welcome duas from anywhere on earth — from your home, masjid, or anywhere at all.
              </div>
            </div>
            <div className="debug-bar">
              <div className="debug-title">Debug — Simulate being at a holy site</div>
              <div className="debug-buttons">
                {HOLY_SITES.map(site => (
                  <button key={site.id} className="debug-btn" onClick={() => locationState.simulateSite(site)}>{site.name}</button>
                ))}
                <button className="debug-btn clear" onClick={locationState.clearSimulation}>✕ Clear</button>
              </div>
            </div>
            <div className="islamic-divider" style={{ margin: '16px 0 0' }}>
              <div className="line"></div><div className="diamond">◆</div><div className="line"></div>
            </div>
            <div className="section-header">
              <span className="section-title">Open to All</span>
              <span className="caption">{anywhereFiltered.length} requests</span>
            </div>
          </div>
          <RequestList
            requests={anywhereFiltered}
            isAtHolySite={false}
            onMakeDua={(req) => handleMakeDua(req, false)}
            duaJustMade={duaJustMade}
            sortMode={sortMode} setSortMode={setSortMode}
            activeCategory={activeCategory} setActiveCategory={setActiveCategory}
            onReshuffle={() => setShuffled(shuffleArray(requests))}
            onEnterDuaMode={() => setDuaModeActive(true)}
          />
          <div className="container" style={{ marginTop: 8 }}>
            <div className="islamic-divider" style={{ margin: '8px 0 16px' }}>
              <div className="line"></div><div className="diamond">◆</div><div className="line"></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: '1.3rem' }}>🕌</span>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--charcoal)' }}>
                  {requests.filter(r => r.holyOnly).length} requests need duas from holy sites
                </div>
                <div className="caption">These requesters seek duas exclusively from the blessed locations below</div>
              </div>
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
          </div>
        </div>
      )}

      {/* Dua Mode overlay */}
      {duaModeActive && (
        <DuaMode
          requests={displayList}
          isAtHolySite={isAtHolySite}
          onMakeDua={handleMakeDua}
          onClose={() => setDuaModeActive(false)}
        />
      )}
    </div>
  );
}
