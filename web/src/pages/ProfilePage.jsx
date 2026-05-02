import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebase';
import { getCategoryById } from '../services/data';

export default function ProfilePage() {
  const { user, logOut, refreshUser } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [showSignOut, setShowSignOut] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = FirebaseService.listenToMyRequests(user.id, setMyRequests);
    return () => unsub?.();
  }, [user]);

  const handleDeactivate = async (req) => {
    if (!confirm('Remove this dua request? Others will no longer see it.')) return;
    await FirebaseService.deactivateDuaRequest(req.id);
    await refreshUser();
  };

  const initial = user?.displayName?.charAt(0)?.toUpperCase() || 'M';
  const activeCount = myRequests.filter(r => r.isActive).length;
  const totalDuasReceived = myRequests.reduce((sum, r) => sum + (r.duasMadeCount || 0), 0);

  return (
    <div className="page-content">
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar">{initial}</div>
          <div className="profile-name">{user?.displayName || 'Muslim'}</div>
          <div className="profile-email">{user?.email}</div>
          {user?.joinedAt && (
            <div className="profile-since">
              Member since {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>
      <div className="header-accent" />

      <div className="container" style={{ marginTop: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          <div className="card stat-card">
            <div className="stat-icon">🤲</div>
            <div className="stat-value">{user?.duasMadeCount || 0}</div>
            <div className="stat-label">Duas Made</div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon">💛</div>
            <div className="stat-value">{totalDuasReceived}</div>
            <div className="stat-label">Duas Received</div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>

        {user?.duasMadeCount > 0 && (
          <div className="info-banner gold" style={{ marginBottom: 20 }}>
            <span className="banner-icon">🌟</span>
            <div className="banner-text">
              <div className="banner-title">JazakAllahu Khayran</div>
              You've made dua for {user.duasMadeCount} request{user.duasMadeCount !== 1 ? 's' : ''}. May Allah reward you abundantly.
            </div>
          </div>
        )}

        <div className="islamic-divider">
          <div className="line"></div><div className="diamond">◆</div><div className="line"></div>
        </div>

        <div className="section-header">
          <span className="section-title">My Dua Requests</span>
          <span className="caption">{myRequests.length} total</span>
        </div>

        {myRequests.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 16px' }}>
            <div className="empty-icon">🤲</div>
            <p>You haven't requested any duas yet.<br/>Tap "Request Dua" to get started.</p>
          </div>
        ) : (
          myRequests.map(req => {
            const cat = getCategoryById(req.category);
            return (
              <div key={req.id} className="card my-request-row">
                <div className="my-request-header">
                  <div className="my-request-cat">
                    <span>{cat?.icon}</span>
                    <span>{cat?.name}</span>
                  </div>
                  <span className={`badge ${req.isActive ? 'badge-green' : 'badge-gray'}`}>
                    {req.isActive ? 'Active' : 'Completed'}
                  </span>
                </div>
                {(req.customText || req.suggestedDua || cat?.defaultText) && (
                  <p className="my-request-text">
                    "{req.customText || req.suggestedDua || cat?.defaultText}"
                  </p>
                )}
                <div className="my-request-footer">
                  <div className="my-request-count">
                    <span>🤲</span>
                    <span>{req.duasMadeCount} {req.duasMadeCount === 1 ? 'person made' : 'people made'} dua for you</span>
                  </div>
                  {req.isActive && (
                    <button
                      onClick={() => handleDeactivate(req)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--soft-gray)', fontSize: '0.78rem', padding: '4px 0' }}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
                {req.isAnonymous && (
                  <div className="caption" style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>🔒</span> Posted anonymously
                  </div>
                )}
              </div>
            );
          })
        )}

        <div className="islamic-divider" style={{ margin: '20px 0' }}>
          <div className="line"></div><div className="diamond">◆</div><div className="line"></div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
          <button className="settings-row">
            <span className="settings-icon">🔔</span>
            <span>Notifications</span>
            <span className="settings-chevron">›</span>
          </button>
          <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />
          <button className="settings-row">
            <span className="settings-icon">ℹ️</span>
            <span>About Pray4Me</span>
            <span className="settings-chevron">›</span>
          </button>
          <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />
          <button className="settings-row" onClick={() => setShowSignOut(true)} style={{ color: 'var(--red)' }}>
            <span className="settings-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>

        <p className="caption text-center" style={{ marginBottom: 20, opacity: 0.6 }}>
          Pray4Me • Making the Ummah stronger, one dua at a time
        </p>
      </div>

      {showSignOut && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
          padding: '0 24px',
        }}>
          <div className="card card-elevated fade-in" style={{ maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🚪</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 8 }}>Sign Out?</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--soft-gray)', marginBottom: 20, lineHeight: 1.5 }}>
              Are you sure you want to sign out?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setShowSignOut(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={logOut}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
