const DONATION_URL = 'https://ko-fi.com/pray4me';

export default function DonationModal({ onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 300, padding: '0 0 0 0',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="card fade-in"
        style={{
          width: '100%', maxWidth: 600,
          borderRadius: '20px 20px 0 0',
          padding: 0, overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--green-dark), var(--green-primary))',
          padding: '28px 24px 24px', textAlign: 'center', position: 'relative',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8, filter: 'drop-shadow(0 2px 8px rgba(200,169,81,0.5))' }}>🌙</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'white', fontSize: '1.3rem', marginBottom: 4 }}>
            Support Pray4Me
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.84rem', lineHeight: 1.5 }}>
            Keep this service running for the Ummah
          </p>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 16,
              background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
              width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
              fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{
            background: 'var(--gold-lighter)', border: '1px solid rgba(200,169,81,0.3)',
            borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 20,
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>💛</span>
            <p style={{ fontSize: '0.84rem', color: 'var(--charcoal-light)', lineHeight: 1.6 }}>
              Pray4Me is free for everyone. Your donation helps cover server costs and
              keeps this service available to Muslims around the world — <em>fi sabil illah</em>.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[
              { amount: '$2', label: 'Buy us a coffee ☕', note: 'Covers a day of server costs' },
              { amount: '$5', label: 'Small sadaqah 🌿', note: 'Keeps us running for a week' },
              { amount: '$10', label: 'Generous gift 🤲', note: 'A month of hosting covered' },
            ].map(({ amount, label, note }) => (
              <a
                key={amount}
                href={`${DONATION_URL}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', background: 'var(--warm-white)',
                  border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none', color: 'var(--charcoal)',
                  transition: 'border-color 0.18s, background 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.background = 'var(--gold-lighter)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--warm-white)'; }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
                  <div className="caption" style={{ marginTop: 2 }}>{note}</div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700,
                  color: 'var(--gold-dark)', background: 'var(--gold-lighter)',
                  padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(200,169,81,0.3)',
                }}>
                  {amount}
                </div>
              </a>
            ))}
          </div>

          <a
            href={DONATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <button className="btn btn-gold" style={{ marginBottom: 12 }}>
              💛  Donate Any Amount
            </button>
          </a>

          <p className="caption text-center" style={{ lineHeight: 1.5 }}>
            "Whoever helps ease a difficulty in this world, Allah will grant him ease
            on the Day of Judgement." — Sahih Muslim
          </p>
        </div>
      </div>
    </div>
  );
}
