import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebase';
import { getCategoryById, HOLY_SITES } from '../services/data';
import DuaCard from '../components/DuaCard';

export default function HomePage({ locationState }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    const unsub1 = FirebaseService.listenToActiveRequests(setRequests);
    const unsub2 = user ? FirebaseService.listenToMyRequests(user.id, setMyRequests) : null;
    return () => { unsub1?.(); unsub2?.(); };
  }, [user]);

  const firstName = user?.displayName?.split(' ')[0] || 'Muslim';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="page-content">
      <div className="islamic-header">
        <div className="icon">🌙</div>
        <h1>Pray4Me</h1>
        <p className="subtitle">As-salamu alaykum, {firstName}</p>
      </div>

      <div className="container" style={{ marginTop: 16 }}>
        {/* Location Status */}
        {locationState.isAtHolySite && locationState.currentSite ? (
          <div className="card fade-in" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.5rem' }}>📍</span>
              <div>
                <div className="subheading" style={{ color: 'var(--green-primary)', fontSize: '0.95rem' }}>
                  You are at {locationState.currentSite.name}
                </div>
                <div className="caption">Dua requests are available. May Allah accept your prayers.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>📍</span>
              <div>
                <div className="subheading" style={{ fontSize: '0.95rem' }}>Not at a holy site</div>
                <div className="caption">You can still request duas. Making dua is available at holy sites.</div>
              </div>
            </div>
          </div>
        )}

        {/* Debug location simulator */}
        <div className="debug-bar">
          <div className="debug-title">DEBUG: Simulate Location</div>
          <div className="debug-buttons">
            {HOLY_SITES.map(site => (
              <button key={site.id} className="debug-btn" onClick={() => locationState.simulateSite(site)}>
                {site.name}
              </button>
            ))}
            <button className="debug-btn clear" onClick={locationState.clearSimulation}>Clear</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, margin: '16px 0' }}>
          <div className="card stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{requests.length}</div>
            <div className="stat-label">Active Requests</div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon">💛</div>
            <div className="stat-value">{user?.duasMadeCount || 0}</div>
            <div className="stat-label">Duas You Made</div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-value">{myRequests.filter(r => r.isActive).length}</div>
            <div className="stat-label">Your Requests</div>
          </div>
        </div>

        {/* Divider */}
        <div className="islamic-divider">
          <div className="line"></div>
          <div className="diamond">◆</div>
          <div className="line"></div>
        </div>

        {/* Recent Requests */}
        <h2 className="subheading" style={{ fontSize: '1.1rem', margin: '16px 0 12px' }}>Recent Dua Requests</h2>

        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>No dua requests yet.<br/>Be the first to request a dua!</p>
          </div>
        ) : (
          requests.slice(0, 5).map(req => (
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
