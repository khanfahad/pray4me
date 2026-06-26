import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebase';
import { getCategoryById } from '../services/data';
import DonationModal from '../components/DonationModal';
import PilgrimModal from '../components/PilgrimModal';
import HadithBanner from '../components/HadithBanner';
import Pray4MeLogo from '../components/Pray4MeLogo';

export default function ProfilePage() {
  const { user, logOut, refreshUser } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [myCollections, setMyCollections] = useState([]);
  const [showSignOut, setShowSignOut] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [showPilgrim, setShowPilgrim] = useState(false);

  useEffect(() => {
    if (!user) return;
    const u1 = FirebaseService.listenToMyRequests(user.id, setMyRequests);
    const u2 = FirebaseService.listenToMyCollections(user.id, setMyCollections);
    return () => { u1?.(); u2?.(); };
  }, [user]);

  const handleDeactivate = async (req) => {
    if (!confirm('Remove this dua request? Others will no longer see it.')) return;
    await FirebaseService.deactivateDuaRequest(req.id);
    await refreshUser();
  };

  const initial = user?.displayName?.charAt(0)?.toUpperCase() || 'M';
  const activeCount = myRequests.filter(r => r.isActive).length;
  const totalDuasReceived = myRequests.reduce((sum, r) => sum + (r.duasMadeCount || 0), 0);
  const activeCollection = myCollections.find(c => c.isActive);

  const destLabel = (dest) => ({ makkah: 'Makkah', madinah: 'Madinah', both: 'Makkah & Madinah' }[dest] || dest);

  return (
    <div className="page-content">
      <div className="islamic-header">
        <div className="header-content">
          <Pray4MeLogo size={28} showBg={false} />
          <h1>Dua' 4 Me</h1>
        </div>
      </div>
      <div className="header-accent" />
      <HadithBanner />

      <div className="container" style={{ marginTop: 16, marginBottom: 0 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="profile-avatar" style={{ margin: '0 auto 8px' }}>{initial}</div>
          <div className="profile-name">{user?.displayName || 'Muslim'}</div>
          <div className="profile-email">{user?.email}</div>
          {user?.joinedAt && (
            <div className="profile-since">Member since {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
          )}
        </div>
      </div>

      <div className="container" style={{ marginTop: 20 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          <div className="card stat-card"><div className="stat-icon">🤲</div><div className="stat-value">{user?.duasMadeCount || 0}</div><div className="stat-label">Duas Made</div></div>
          <div className="card stat-card"><div className="stat-icon">💛</div><div className="stat-value">{totalDuasReceived}</div><div className="stat-label">Received</div></div>
          <div className="card stat-card"><div className="stat-icon">📋</div><div className="stat-value">{activeCount}</div><div className="stat-label">Active</div></div>
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

        {/* Pilgrimage Collection banner */}
        <button onClick={() => setShowPilgrim(true)} style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'none', padding: 0, marginBottom: 12, textAlign: 'left' }}>
          <div style={{
            borderRadius: 'var(--radius)', padding: '16px 18px',
            background: activeCollection
              ? 'linear-gradient(135deg, #1B5E20, #2E7D32)'
              : 'linear-gradient(135deg, #E8F5E9, #F1F8E9)',
            border: activeCollection ? 'none' : '1.5px solid var(--green-light)',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: activeCollection ? '0 3px 12px rgba(27,94,32,0.3)' : 'none',
          }}>
            <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>🕌</span>
            <div style={{ flex: 1 }}>
              {activeCollection ? (
                <>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '0.92rem', fontFamily: 'var(--font-serif)', marginBottom: 2 }}>
                    {activeCollection.isUmrah ? 'Umrah' : 'Hajj'} Collection — {destLabel(activeCollection.destination)}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.78rem' }}>
                    {activeCollection.requestCount || 0} request{activeCollection.requestCount !== 1 ? 's' : ''} collected · Tap to manage
                  </div>
                </>
              ) : (
                <>
                  <div style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: '0.92rem', fontFamily: 'var(--font-serif)', marginBottom: 2 }}>
                    Going to Hajj or Umrah?
                  </div>
                  <div style={{ color: 'var(--green-primary)', fontSize: '0.78rem' }}>
                    Create a collection page — share it with loved ones to collect their duas
                  </div>
                </>
              )}
            </div>
            <span style={{ color: activeCollection ? 'rgba(255,255,255,0.6)' : 'var(--green-primary)', fontSize: '1.1rem' }}>›</span>
          </div>
        </button>

        {/* Donation banner */}
        <button onClick={() => setShowDonation(true)} style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'none', padding: 0, marginBottom: 20, textAlign: 'left' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)',
            borderRadius: 'var(--radius)', padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 3px 12px rgba(27,94,32,0.3)',
          }}>
            <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>💛</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.92rem', fontFamily: 'var(--font-serif)', marginBottom: 2 }}>Support Dua' 4 Me</div>
              <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.78rem' }}>Help keep this service free for the Ummah</div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>›</span>
          </div>
        </button>

        <div className="islamic-divider-ornate"><div className="line"></div><div className="ornament">۞</div><div className="line"></div></div>

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
                  <div className="my-request-cat"><span>{cat?.icon}</span><span>{cat?.name}</span></div>
                  <span className={`badge ${req.isActive ? 'badge-green' : 'badge-gray'}`}>{req.isActive ? 'Active' : 'Completed'}</span>
                </div>
                {(req.customText || req.suggestedDua || cat?.defaultText) && (
                  <p className="my-request-text">"{req.customText || req.suggestedDua || cat?.defaultText}"</p>
                )}
                <div className="my-request-footer">
                  <div className="my-request-count">
                    <span>🤲</span>
                    <span>{req.duasMadeCount} {req.duasMadeCount === 1 ? 'person made' : 'people made'} dua for you</span>
                  </div>
                  {req.isActive && (
                    <button onClick={() => handleDeactivate(req)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--soft-gray)', fontSize: '0.78rem', padding: '4px 0' }}>
                      ✕ Remove
                    </button>
                  )}
                </div>
                {req.holyOnly && <div className="caption" style={{ marginTop: 6 }}>🕌 Holy sites only</div>}
                {req.isAnonymous && <div className="caption" style={{ marginTop: 4 }}>🔒 Posted anonymously</div>}
              </div>
            );
          })
        )}

        <div className="islamic-divider-ornate" style={{ margin: '20px 0' }}><div className="line"></div><div className="ornament">۞</div><div className="line"></div></div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
          <button className="settings-row" onClick={() => setShowPilgrim(true)}>
            <span className="settings-icon">🕌</span><span>My Pilgrimage Collection</span><span className="settings-chevron">›</span>
          </button>
          <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />
          <button className="settings-row" onClick={() => setShowDonation(true)}>
            <span className="settings-icon">💛</span><span>Support Dua' 4 Me</span><span className="settings-chevron">›</span>
          </button>
          <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />
          <button className="settings-row">
            <span className="settings-icon">🔔</span><span>Notifications</span><span className="settings-chevron">›</span>
          </button>
          <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />
          <button className="settings-row">
            <span className="settings-icon">ℹ️</span><span>About Dua' 4 Me</span><span className="settings-chevron">›</span>
          </button>
          <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />
          <button className="settings-row" onClick={() => setShowSignOut(true)} style={{ color: 'var(--red)' }}>
            <span className="settings-icon">🚪</span><span>Sign Out</span>
          </button>
        </div>

        <p className="caption text-center" style={{ marginBottom: 20, opacity: 0.55 }}>Dua' 4 Me · Making the Ummah stronger, one dua at a time</p>
      </div>

      {/* Sign out modal */}
      {showSignOut && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '0 24px' }}>
          <div className="card card-elevated fade-in" style={{ maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🚪</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 8 }}>Sign Out?</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--soft-gray)', marginBottom: 20, lineHeight: 1.5 }}>Are you sure you want to sign out?</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setShowSignOut(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={logOut}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {showDonation && <DonationModal onClose={() => setShowDonation(false)} />}
      {showPilgrim && <PilgrimModal user={user} onClose={() => setShowPilgrim(false)} />}
    </div>
  );
}
