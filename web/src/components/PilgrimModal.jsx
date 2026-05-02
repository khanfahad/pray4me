import { useEffect, useState } from 'react';
import { FirebaseService } from '../services/firebase';
import DuaMode from './DuaMode';
import toast from 'react-hot-toast';

const DESTINATION_OPTIONS = [
  { value: 'both', label: 'Makkah & Madinah', icon: '🕌' },
  { value: 'makkah', label: 'Makkah', icon: '🕋' },
  { value: 'madinah', label: 'Madinah', icon: '☪️' },
  { value: 'other', label: 'Other Holy Site', icon: '🌍' },
];

function CreateForm({ user, onCreated, onClose }) {
  const [destination, setDestination] = useState('both');
  const [isUmrah, setIsUmrah] = useState(true);
  const [departureDate, setDepartureDate] = useState('');
  const [customDest, setCustomDest] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const dest = destination === 'other' ? customDest.trim() : destination;
      const id = await FirebaseService.createPilgrimageCollection({
        userId: user.id,
        pilgrimName: user.displayName,
        destination: dest,
        isUmrah,
        departureDate: departureDate || null,
        isActive: true,
        requestCount: 0,
      });
      toast.success('Your collection page is ready to share!', { icon: '🕌', duration: 3500 });
      onCreated(id);
    } catch {
      toast.error('Failed to create. Please try again.');
    }
    setSubmitting(false);
  };

  const isValid = destination !== 'other' || customDest.trim().length > 0;

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>🕌</div>
        <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)', marginBottom: 4 }}>
          Create Your Collection Page
        </h3>
        <p className="caption" style={{ lineHeight: 1.5 }}>
          Share a personal link so your loved ones can send you duas to make at the holy site
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '0.86rem', fontWeight: 700, marginBottom: 10, color: 'var(--charcoal)' }}>Trip type</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setIsUmrah(true)}
            style={{
              flex: 1, padding: '11px 8px', borderRadius: 'var(--radius-sm)',
              border: `2px solid ${isUmrah ? 'var(--green-primary)' : 'var(--border)'}`,
              background: isUmrah ? 'var(--green-lighter)' : 'var(--warm-white)',
              cursor: 'pointer', fontSize: '0.88rem', fontWeight: isUmrah ? 700 : 400,
              color: isUmrah ? 'var(--green-primary)' : 'var(--charcoal)',
            }}
          >
            🤲 Umrah
          </button>
          <button
            onClick={() => setIsUmrah(false)}
            style={{
              flex: 1, padding: '11px 8px', borderRadius: 'var(--radius-sm)',
              border: `2px solid ${!isUmrah ? 'var(--green-primary)' : 'var(--border)'}`,
              background: !isUmrah ? 'var(--green-lighter)' : 'var(--warm-white)',
              cursor: 'pointer', fontSize: '0.88rem', fontWeight: !isUmrah ? 700 : 400,
              color: !isUmrah ? 'var(--green-primary)' : 'var(--charcoal)',
            }}
          >
            🕋 Hajj
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '0.86rem', fontWeight: 700, marginBottom: 10, color: 'var(--charcoal)' }}>Destination</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DESTINATION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDestination(opt.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 14px', borderRadius: 'var(--radius-sm)',
                border: `2px solid ${destination === opt.value ? 'var(--green-primary)' : 'var(--border)'}`,
                background: destination === opt.value ? 'var(--green-lighter)' : 'var(--warm-white)',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span>{opt.icon}</span>
              <span style={{ fontSize: '0.88rem', fontWeight: destination === opt.value ? 700 : 400, color: destination === opt.value ? 'var(--green-primary)' : 'var(--charcoal)' }}>
                {opt.label}
              </span>
              {destination === opt.value && (
                <span style={{ marginLeft: 'auto', color: 'var(--green-primary)', fontWeight: 700 }}>✓</span>
              )}
            </button>
          ))}
        </div>
        {destination === 'other' && (
          <input
            type="text"
            value={customDest}
            onChange={e => setCustomDest(e.target.value)}
            placeholder="e.g. Al-Aqsa, Jerusalem"
            maxLength={60}
            style={{ marginTop: 8, width: '100%' }}
          />
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: '0.86rem', fontWeight: 700, display: 'block', marginBottom: 8, color: 'var(--charcoal)' }}>
          Departure date <span className="caption">(optional)</span>
        </label>
        <input
          type="date"
          value={departureDate}
          onChange={e => setDepartureDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          style={{ width: '100%' }}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleCreate}
        disabled={submitting || !isValid}
      >
        {submitting ? 'Creating...' : '🕌  Create My Collection Page'}
      </button>
    </div>
  );
}

function CollectionView({ collection, collectionId, requests, onDeactivate, onOpenDuaMode }) {
  const shareUrl = `${window.location.origin}${window.location.pathname}#collect/${collectionId}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the text
      const el = document.querySelector('.pilgrim-share-url-text');
      if (el) { const r = document.createRange(); r.selectNode(el); window.getSelection().removeAllRanges(); window.getSelection().addRange(r); }
    }
  };

  const destLabel = {
    makkah: 'Makkah', madinah: 'Madinah', both: 'Makkah & Madinah',
  }[collection.destination] || collection.destination;

  const pending = requests.filter(r => !r.isMade);
  const made = requests.filter(r => r.isMade);

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>🕌</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem', color: 'var(--charcoal)', marginBottom: 4 }}>
          {collection.isUmrah ? 'Umrah' : 'Hajj'} — {destLabel}
        </div>
        {collection.departureDate && (
          <div className="caption">Departing {new Date(collection.departureDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--green-primary)' }}>{requests.length}</div>
            <div className="caption">Requests</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--gold-dark)' }}>{made.length}</div>
            <div className="caption">Made</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--charcoal-light)' }}>{pending.length}</div>
            <div className="caption">Pending</div>
          </div>
        </div>
      </div>

      {/* Shareable URL */}
      <div style={{
        background: 'var(--green-lighter)', border: '1.5px solid var(--green-light)',
        borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: 16,
      }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--green-primary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Your Shareable Link
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="pilgrim-share-url-text" style={{
            flex: 1, fontSize: '0.75rem', color: 'var(--charcoal-light)', wordBreak: 'break-all',
            background: 'white', padding: '8px 10px', borderRadius: 'var(--radius-xs)', lineHeight: 1.4,
          }}>
            {shareUrl}
          </div>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? 'var(--green-primary)' : 'white',
              color: copied ? 'white' : 'var(--green-primary)',
              border: '1.5px solid var(--green-light)', borderRadius: 'var(--radius-xs)',
              padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
              flexShrink: 0, transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
        <p className="caption" style={{ marginTop: 8, lineHeight: 1.4 }}>
          Share this link on WhatsApp, Instagram, or any social media. Your loved ones can submit their duas directly.
        </p>
      </div>

      {/* Dua Mode button */}
      {pending.length > 0 && (
        <button className="btn btn-primary" onClick={onOpenDuaMode} style={{ marginBottom: 16 }}>
          ✨ Start Dua Mode — {pending.length} Pending
        </button>
      )}

      {/* Requests list */}
      {requests.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="section-header">
            <span className="section-title">Submitted Requests</span>
          </div>
          {requests.map(req => (
            <CollectionRequestCard key={req.id} request={req} collectionId={collection.id} />
          ))}
        </div>
      )}

      {requests.length === 0 && (
        <div className="empty-state" style={{ padding: '24px 0' }}>
          <div className="empty-icon">📋</div>
          <p>No requests yet. Share your link to start collecting duas.</p>
        </div>
      )}

      <button
        onClick={onDeactivate}
        style={{
          width: '100%', background: 'none', border: '1.5px solid #FFCDD2',
          color: 'var(--red)', borderRadius: 'var(--radius-sm)', padding: '11px',
          cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600,
        }}
      >
        Close Collection (stop accepting requests)
      </button>
    </div>
  );
}

function CollectionRequestCard({ request, collectionId }) {
  const [marking, setMarking] = useState(false);
  const [isMade, setIsMade] = useState(request.isMade);

  const handleMark = async () => {
    setMarking(true);
    try {
      await FirebaseService.markCollectionRequestMade(collectionId, request.id);
      setIsMade(true);
      toast.success('Marked as made. JazakAllahu Khayran!', { icon: '🤲', duration: 2500 });
    } catch {
      toast.error('Failed to update. Please try again.');
    }
    setMarking(false);
  };

  return (
    <div className="card" style={{
      marginBottom: 10, padding: '14px 16px',
      borderLeft: `3px solid ${isMade ? 'var(--gold)' : 'var(--green-light)'}`,
      opacity: isMade ? 0.75 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--charcoal)' }}>
          {request.isPrivate ? '🔒 Anonymous' : request.submitterName}
        </div>
        {isMade ? (
          <span style={{ background: 'var(--gold-lighter)', color: 'var(--gold-dark)', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(200,169,81,0.3)' }}>
            ✓ Made
          </span>
        ) : (
          <span style={{ background: 'var(--green-lighter)', color: 'var(--green-primary)', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(0,100,0,0.1)' }}>
            Pending
          </span>
        )}
      </div>
      <p style={{ fontSize: '0.84rem', color: 'var(--charcoal-light)', lineHeight: 1.6, marginBottom: isMade ? 0 : 10, fontStyle: 'italic' }}>
        "{request.duaText}"
      </p>
      {!isMade && (
        <button
          onClick={handleMark}
          disabled={marking}
          style={{
            background: 'none', border: '1.5px solid var(--green-light)', color: 'var(--green-primary)',
            borderRadius: 'var(--radius-xs)', padding: '6px 14px', cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.18s',
          }}
        >
          {marking ? '...' : '✓ Mark as Made'}
        </button>
      )}
    </div>
  );
}

export default function PilgrimModal({ user, onClose }) {
  const [collections, setCollections] = useState([]);
  const [collectionRequests, setCollectionRequests] = useState([]);
  const [createdId, setCreatedId] = useState(null);
  const [duaModeActive, setDuaModeActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = FirebaseService.listenToMyCollections(user.id, (cols) => {
      setCollections(cols);
      setLoading(false);
    });
    return () => unsub?.();
  }, [user]);

  const activeCollection = collections.find(c => c.isActive);
  const activeId = createdId || activeCollection?.id;

  useEffect(() => {
    if (!activeId) return;
    const unsub = FirebaseService.listenToCollectionRequests(activeId, setCollectionRequests);
    return () => unsub?.();
  }, [activeId]);

  const handleDeactivate = async () => {
    if (!activeId) return;
    if (!confirm('Close your collection? People will no longer be able to submit requests.')) return;
    await FirebaseService.updatePilgrimageCollection(activeId, { isActive: false });
    setCreatedId(null);
    toast.success('Collection closed.');
  };

  const pendingRequests = collectionRequests.filter(r => !r.isMade);
  const handleMakeDuaForCollection = async (req) => {
    await FirebaseService.markCollectionRequestMade(activeId, req.id);
    toast.success('Ameen! Dua recorded.', { icon: '🤲', duration: 2500 });
  };

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className="card fade-in"
          style={{ width: '100%', maxWidth: 600, borderRadius: '20px 20px 0 0', padding: 0, overflow: 'hidden', maxHeight: '90vh' }}
        >
          {/* Modal header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--green-dark), var(--green-primary))',
            padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem' }}>
                My Pilgrimage Collection
              </div>
              <div className="caption" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Collect duas from loved ones to make at holy sites
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(90vh - 72px)' }}>
            {loading ? (
              <div className="empty-state"><div className="empty-icon">⏳</div><p>Loading...</p></div>
            ) : activeCollection || createdId ? (
              <CollectionView
                collection={activeCollection || { id: activeId, isActive: true }}
                collectionId={activeId}
                requests={collectionRequests}
                onDeactivate={handleDeactivate}
                onOpenDuaMode={() => setDuaModeActive(true)}
              />
            ) : (
              <CreateForm user={user} onCreated={id => setCreatedId(id)} onClose={onClose} />
            )}
          </div>
        </div>
      </div>

      {duaModeActive && (
        <DuaMode
          requests={pendingRequests.map(r => ({
            id: r.id, requesterName: r.submitterName, isAnonymous: r.isPrivate,
            category: 'custom', customText: r.duaText, holyOnly: true,
            duasMadeCount: r.isMade ? 1 : 0, holyDuasCount: r.isMade ? 1 : 0,
            createdAt: r.createdAt,
          }))}
          isAtHolySite={true}
          onMakeDua={handleMakeDuaForCollection}
          onClose={() => setDuaModeActive(false)}
        />
      )}
    </>
  );
}
