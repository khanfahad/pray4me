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

  return (
    <div className="page-content">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">{initial}</div>
        <div className="profile-name">{user?.displayName || 'Muslim'}</div>
        <div className="profile-email">{user?.email}</div>
        {user?.joinedAt && (
          <div className="profile-since">
            Member since {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        )}
      </div>

      <div className="container" style={{ marginTop: 16 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div className="card stat-card">
            <div className="stat-icon">🤲</div>
            <div className="stat-value">{user?.duasMadeCount || 0}</div>
            <div className="stat-label">Duas Made</div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-value">{user?.duasRequestedCount || 0}</div>
            <div className="stat-label">Duas Requested</div>
          </div>
        </div>

        <div className="islamic-divider">
          <div className="line"></div><div className="diamond">◆</div><div className="line"></div>
        </div>

        {/* My Requests */}
        <h2 className="subheading" style={{ fontSize: '1rem', margin: '16px 0 12px' }}>My Dua Requests</h2>

        {myRequests.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 16px' }}>
            <div className="empty-icon">💬</div>
            <p>You haven't requested any duas yet.</p>
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
                <p className="my-request-text">
                  {req.customText || req.suggestedDua || cat?.defaultText || ''}
                </p>
                <div className="my-request-footer">
                  <div className="my-request-count">
                    <span>💛</span>
                    <span>{req.duasMadeCount} people made dua for you</span>
                  </div>
                  {req.isActive && (
                    <button
                      onClick={() => handleDeactivate(req)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--soft-gray)', fontSize: '0.8rem' }}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
                {req.isAnonymous && (
                  <div className="caption" style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>👁️‍🗨️</span> Anonymous
                  </div>
                )}
              </div>
            );
          })
        )}

        <div className="islamic-divider" style={{ margin: '16px 0' }}>
          <div className="line"></div><div className="diamond">◆</div><div className="line"></div>
        </div>

        {/* Settings */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
          <button className="settings-row">
            <span className="settings-icon">🔔</span>
            <span>Notifications</span>
            <span className="settings-chevron">›</span>
          </button>
          <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: 0 }}/>
          <button className="settings-row">
            <span className="settings-icon">ℹ️</span>
            <span>About Pray4Me</span>
            <span className="settings-chevron">›</span>
          </button>
          <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: 0 }}/>
          <button className="settings-row" onClick={() => setShowSignOut(true)} style={{ color: 'var(--red)' }}>
            <span className="settings-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>

        {/* Sign out confirmation */}
        {showSignOut && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
          }}>
            <div className="card" style={{ maxWidth: 320, textAlign: 'center' }}>
              <h3 style={{ marginBottom: 8 }}>Sign Out?</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--soft-gray)', marginBottom: 16 }}>
                Are you sure you want to sign out?
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setShowSignOut(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={logOut}>Sign Out</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
