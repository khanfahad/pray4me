import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebase';
import { DUA_CATEGORIES, HOLY_SITES } from '../services/data';
import DuaCard from '../components/DuaCard';
import HadithBanner from '../components/HadithBanner';
import MosqueSilhouette from '../components/MosqueSilhouette';
import StarfieldBackground from '../components/StarfieldBackground';

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

export default function HomePage({ locationState }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [sortMode, setSortMode] = useState('newest');
  const [activeCategory, setActiveCategory] = useState('all');
  const [shuffled, setShuffled] = useState([]);

  useEffect(() => {
    const unsub1 = FirebaseService.listenToActiveRequests(setRequests);
    const unsub2 = user ? FirebaseService.listenToMyRequests(user.id, setMyRequests) : null;
    return () => { unsub1?.(); unsub2?.(); };
  }, [user]);

  useEffect(() => {
    if (sortMode === 'shuffle') {
      setShuffled(shuffleArray(requests));
    }
  }, [sortMode, requests]);

  const filtered = useMemo(() => {
    let list = activeCategory === 'all' ? requests : requests.filter(r => r.category === activeCategory);
    if (sortMode === 'fewest') return [...list].sort((a, b) => a.duasMadeCount - b.duasMadeCount);
    if (sortMode === 'most') return [...list].sort((a, b) => b.duasMadeCount - a.duasMadeCount);
    if (sortMode === 'newest') return [...list].sort((a, b) => b.createdAt - a.createdAt);
    if (sortMode === 'shuffle') {
      return activeCategory === 'all' ? shuffled : shuffled.filter(r => r.category === activeCategory);
    }
    return list;
  }, [requests, sortMode, activeCategory, shuffled]);

  const firstName = user?.displayName?.split(' ')[0] || 'Friend';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const usedCategoryIds = [...new Set(requests.map(r => r.category))];
  const usedCategories = DUA_CATEGORIES.filter(c => usedCategoryIds.includes(c.id));

  return (
    <div className="page-content">
      <div className="islamic-header">
        <StarfieldBackground starCount={30} />
        <MosqueSilhouette />
        <div className="header-content">
          <div className="icon float">🌙</div>
          <h1>Dua' 4 Me</h1>
          <p className="subtitle">{greeting}, {firstName} — As-salamu alaykum</p>
          <p className="bismillah-watermark">بِسْمِ ٱللَّهِ</p>
        </div>
      </div>
      <div className="header-accent" />
      <HadithBanner />

      <div className="container" style={{ marginTop: 20 }}>
        {locationState.isAtHolySite && locationState.currentSite && (
          <div className="info-banner green fade-in" style={{ marginBottom: 16 }}>
            <span className="banner-icon">📍</span>
            <div className="banner-text">
              <div className="banner-title">You are at {locationState.currentSite.name}</div>
              May Allah accept your prayers from this blessed place.
            </div>
          </div>
        )}

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, margin: '20px 0' }}>
          <div className="card stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{requests.length}</div>
            <div className="stat-label">Requests</div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon">🤲</div>
            <div className="stat-value">{user?.duasMadeCount || 0}</div>
            <div className="stat-label">Duas Made</div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-value">{myRequests.filter(r => r.isActive).length}</div>
            <div className="stat-label">My Requests</div>
          </div>
        </div>

        <div className="islamic-divider-ornate">
          <div className="line"></div>
          <div className="ornament">۞</div>
          <div className="line"></div>
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
                ? 'No requests in this category yet.'
                : 'No dua requests yet.\nBe the first to request a dua!'}
            </p>
          </div>
        ) : (
          filtered.slice(0, 10).map(req => (
            <DuaCard
              key={req.id}
              request={req}
              isAtHolySite={locationState.isAtHolySite}
              showMakeDuaButton={false}
            />
          ))
        )}
      </div>
    </div>
  );
}
