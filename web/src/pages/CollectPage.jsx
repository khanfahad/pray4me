import { useEffect, useState } from 'react';
import { FirebaseService } from '../services/firebase';
import Pray4MeLogo from '../components/Pray4MeLogo';

const MAX_DUA_LENGTH = 300;

export default function CollectPage({ collectionId, onBack }) {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [submitterName, setSubmitterName] = useState('');
  const [duaText, setDuaText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!collectionId) { setNotFound(true); setLoading(false); return; }
    FirebaseService.getPilgrimageCollection(collectionId).then(c => {
      if (!c) setNotFound(true);
      else setCollection(c);
      setLoading(false);
    });
  }, [collectionId]);

  const handleSubmit = async () => {
    if (!submitterName.trim()) { setError('Please enter your name.'); return; }
    if (!duaText.trim()) { setError('Please write your dua request.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await FirebaseService.submitDuaToCollection(collectionId, {
        submitterName: submitterName.trim(),
        duaText: duaText.trim(),
        isPrivate,
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(150deg, var(--green-dark), var(--green-primary))',
      }}>
        <div className="pulse"><Pray4MeLogo size={64} /></div>
      </div>
    );
  }

  if (notFound || !collection) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🕌</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)', marginBottom: 8 }}>Page Not Found</h2>
          <p style={{ color: 'var(--soft-gray)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 20 }}>
            This pilgrimage collection doesn't exist or has been closed.
          </p>
          {onBack && (
            <button className="btn btn-secondary" onClick={onBack}>← Back to Pray4Me</button>
          )}
        </div>
      </div>
    );
  }

  if (!collection.isActive) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🙏</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)', marginBottom: 8 }}>Collection Closed</h2>
          <p style={{ color: 'var(--soft-gray)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 8 }}>
            {collection.pilgrimName}'s collection is no longer accepting requests.
          </p>
          <p style={{ color: 'var(--soft-gray)', fontSize: '0.84rem', lineHeight: 1.6, marginBottom: 20 }}>
            May Allah accept their trip and all the duas made.
          </p>
          {onBack && (
            <button className="btn btn-secondary" onClick={onBack}>← Back to Pray4Me</button>
          )}
        </div>
      </div>
    );
  }

  const destLabel = {
    makkah: 'Makkah',
    madinah: 'Madinah',
    both: 'Makkah & Madinah',
    other: collection.destination,
  }[collection.destination] || collection.destination;

  const tripLabel = collection.isUmrah ? 'Umrah' : 'Hajj';

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(150deg, var(--green-dark) 0%, var(--green-primary) 60%, #388E3C 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24, textAlign: 'center',
      }}>
        <div className="pulse" style={{ marginBottom: 20 }}>
          <span style={{ fontSize: '4rem' }}>🤲</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'white', fontSize: '1.5rem', marginBottom: 12 }}>
          JazakAllahu Khayran
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 320, marginBottom: 16 }}>
          Your request has been sent to {collection.pilgrimName}.<br/>
          In sha Allah, they will make dua for you at {destLabel}.
        </p>
        <div className="arabic-text" style={{ fontSize: '1.2rem', color: 'rgba(200,169,81,0.9)', marginBottom: 24 }}>
          آمين يا رب العالمين
        </div>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}>
          "The dua of a Muslim for his brother in his absence is answered." — Sahih Muslim
        </p>
        {onBack && (
          <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: 24 }}>← Back to Pray4Me</button>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-dark), var(--green-primary))',
        padding: '32px 24px 28px', textAlign: 'center', position: 'relative',
      }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              position: 'absolute', top: 16, left: 16,
              background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
              borderRadius: 'var(--radius-xs)', padding: '6px 12px', cursor: 'pointer', fontSize: '0.82rem',
            }}
          >
            ← Back
          </button>
        )}
        <div style={{ marginBottom: 10 }}>
          <Pray4MeLogo size={56} />
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          Pilgrimage Dua Collection
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'white', fontSize: '1.6rem', marginBottom: 6 }}>
          {collection.pilgrimName}
        </h1>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', marginBottom: 4 }}>
          is going to {destLabel} for {tripLabel}
        </div>
        {collection.departureDate && (
          <div style={{ color: 'rgba(200,169,81,0.9)', fontSize: '0.82rem' }}>
            Departing {new Date(collection.departureDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        )}
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', marginTop: 12 }}>
          {collection.requestCount || 0} {collection.requestCount === 1 ? 'person has' : 'people have'} submitted requests
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 20px 40px' }}>
        <div style={{
          background: 'var(--gold-lighter)', border: '1px solid rgba(200,169,81,0.3)',
          borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 24,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🕌</span>
          <p style={{ fontSize: '0.84rem', color: 'var(--charcoal-light)', lineHeight: 1.6 }}>
            {collection.pilgrimName} is collecting duas to make on your behalf at the holy site. Submit your request and it will reach them before they depart, in sha Allah.
          </p>
        </div>

        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 700, display: 'block', marginBottom: 8, color: 'var(--charcoal)' }}>
              Your Name <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <input
              type="text"
              value={submitterName}
              onChange={e => setSubmitterName(e.target.value)}
              placeholder="e.g. Yusuf, Auntie Khadija..."
              maxLength={60}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 700, display: 'block', marginBottom: 8, color: 'var(--charcoal)' }}>
              Your Dua Request <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <textarea
              value={duaText}
              onChange={e => setDuaText(e.target.value)}
              placeholder="Write what you'd like them to make dua for... e.g. 'Please make dua for my father's health, his name is Ahmad.'"
              rows={5}
              maxLength={MAX_DUA_LENGTH + 10}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <span className="caption" style={{ color: duaText.length > MAX_DUA_LENGTH ? 'var(--red)' : undefined }}>
                {duaText.length}/{MAX_DUA_LENGTH}
              </span>
            </div>
          </div>

          <div className="toggle-wrapper" style={{ marginBottom: 20 }}>
            <button
              className={`toggle ${isPrivate ? 'active' : ''}`}
              onClick={() => setIsPrivate(!isPrivate)}
            />
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--charcoal)' }}>Keep my request private</div>
              <div className="caption">Only {collection.pilgrimName} will see the details</div>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 'var(--radius-xs)', padding: '10px 14px', marginBottom: 14, fontSize: '0.84rem', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting || !submitterName.trim() || !duaText.trim() || duaText.length > MAX_DUA_LENGTH}
          >
            {submitting ? 'Sending...' : '🤲  Send My Dua Request'}
          </button>
        </div>

        <p className="caption text-center" style={{ marginTop: 16, lineHeight: 1.5 }}>
          "Whoever relieves a Muslim of a burden from the burdens of the world,<br/>Allah will relieve him of a burden from the burdens of the Hereafter." — Sahih Muslim
        </p>
      </div>
    </div>
  );
}
