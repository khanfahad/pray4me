import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebase';
import { HOLY_SITES } from '../services/data';
import DuaCard from '../components/DuaCard';
import toast from 'react-hot-toast';

export default function MakeDuaPage({ locationState }) {
  const { user, refreshUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [duaJustMade, setDuaJustMade] = useState(null);

  useEffect(() => {
    const unsub = FirebaseService.listenToActiveRequests(setRequests);
    return () => unsub?.();
  }, []);

  const handleMakeDua = async (request) => {
    if (!user || !locationState.currentSite) return;
    if (request.requesterId === user.id) {
      toast.error("You can't make dua for your own request here, but you can always make dua for yourself directly!");
      return;
    }
    try {
      await FirebaseService.markDuaAsMade(request.id, user.id, user.displayName, locationState.currentSite.id);
      setDuaJustMade(request.id);
      await refreshUser();
      toast.success('Ameen! May Allah accept your dua.', { icon: '🤲' });
      setTimeout(() => setDuaJustMade(null), 2500);
    } catch (err) {
      toast.error('Failed to record dua.');
    }
  };

  return (
    <div className="page-content">
      <div className="islamic-header">
        <div className="icon">🤲</div>
        <h1>Make Dua</h1>
        <p className="subtitle">
          {locationState.currentSite ? `You are at ${locationState.currentSite.name}` : 'Visit a holy site to make dua'}
        </p>
      </div>

      <div className="container" style={{ marginTop: 16 }}>
        {locationState.isAtHolySite && locationState.currentSite ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div className="location-badge">
                📍 {locationState.currentSite.name} • {locationState.currentSite.city}
              </div>
            </div>

            <p className="caption text-center" style={{ marginBottom: 16 }}>
              Tap "I Made This Dua" after praying for each request. The requester will be notified, in sha Allah.
            </p>

            <div className="islamic-divider">
              <div className="line"></div><div className="diamond">◆</div><div className="line"></div>
            </div>

            <p className="subheading text-center" style={{ fontSize: '0.9rem', margin: '12px 0' }}>
              {requests.length} dua requests waiting
            </p>

            {requests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🤲</div>
                <p>No dua requests at the moment.<br/>Check back soon.</p>
              </div>
            ) : (
              requests.map(req => (
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
          </>
        ) : (
          <>
            <div className="empty-state" style={{ paddingBottom: 20 }}>
              <div className="empty-icon">📍</div>
              <h2 className="subheading" style={{ fontSize: '1.1rem', marginBottom: 8 }}>
                You're not at a holy site yet
              </h2>
              <p>Making dua for others is available when you're at one of these blessed locations:</p>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              {HOLY_SITES.map(site => (
                <div key={site.id} className="holy-site-row">
                  <span className="holy-site-icon">📍</span>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{site.name}</div>
                    <div className="caption">{site.city}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="debug-bar">
              <div className="debug-title">DEBUG: Simulate being at a holy site</div>
              <div className="debug-buttons">
                {HOLY_SITES.map(site => (
                  <button key={site.id} className="debug-btn" onClick={() => locationState.simulateSite(site)}>
                    {site.name}
                  </button>
                ))}
                <button className="debug-btn clear" onClick={locationState.clearSimulation}>Clear</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
