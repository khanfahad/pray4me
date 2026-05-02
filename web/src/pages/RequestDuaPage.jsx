import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebase';
import { DUA_CATEGORIES } from '../services/data';
import toast from 'react-hot-toast';

const MAX_CUSTOM_LENGTH = 200;

export default function RequestDuaPage() {
  const { user, refreshUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customText, setCustomText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [holyOnly, setHolyOnly] = useState(false);
  const [showSuggested, setShowSuggested] = useState(false);
  const [selectedSuggested, setSelectedSuggested] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setSelectedCategory(null);
    setCustomText('');
    setIsAnonymous(false);
    setHolyOnly(false);
    setShowSuggested(false);
    setSelectedSuggested(null);
  };

  const isValid = () => {
    if (!selectedCategory) return false;
    if (selectedCategory.id === 'custom') {
      return customText.trim().length > 0 && customText.length <= MAX_CUSTOM_LENGTH;
    }
    return customText.length <= MAX_CUSTOM_LENGTH;
  };

  const handleSubmit = async () => {
    if (!isValid() || !user) return;
    setSubmitting(true);
    try {
      const request = {
        requesterId: user.id,
        requesterName: user.displayName,
        isAnonymous,
        holyOnly,
        category: selectedCategory.id,
        customText: customText.trim() || null,
        suggestedDua: selectedSuggested?.translation || null,
        duasMadeCount: 0,
        holyDuasCount: 0,
        lastDuaMadeAt: null,
        createdAt: Date.now(),
        isActive: true,
      };
      await FirebaseService.createDuaRequest(request);
      await refreshUser();
      toast.success('Your dua request has been submitted. May Allah answer it.', { duration: 4000, icon: '🤲' });
      resetForm();
    } catch (err) {
      toast.error('Failed to submit. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="page-content">
      <div className="islamic-header">
        <div className="header-content">
          <div className="icon">🤲</div>
          <h1>Request a Dua</h1>
          <p className="subtitle">Ask the Ummah to pray for you</p>
        </div>
      </div>
      <div className="header-accent" />

      <div className="container" style={{ marginTop: 20 }}>
        {!selectedCategory ? (
          <>
            <div style={{ marginBottom: 20 }}>
              <h2 className="subheading" style={{ fontSize: '1rem', color: 'var(--charcoal)', marginBottom: 4 }}>
                What would you like dua for?
              </h2>
              <p className="caption">Choose a category to get started</p>
            </div>
            <div className="category-grid">
              {DUA_CATEGORIES.map(cat => (
                <button key={cat.id} className="category-card" onClick={() => setSelectedCategory(cat)}>
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-name">{cat.name}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="fade-in">
            <button
              className="btn btn-secondary btn-sm"
              onClick={resetForm}
              style={{ marginBottom: 20 }}
            >
              ← Back to Categories
            </button>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{selectedCategory.icon}</span>
              <div>
                <div className="subheading" style={{ color: 'var(--charcoal)', fontSize: '1rem' }}>
                  {selectedCategory.name}
                </div>
                {selectedCategory.defaultText && selectedCategory.id !== 'custom' && (
                  <p className="caption" style={{ marginTop: 2, fontStyle: 'italic' }}>"{selectedCategory.defaultText}"</p>
                )}
              </div>
            </div>

            {selectedCategory.suggestedDuas.length > 0 && (
              <div className="card" style={{ marginBottom: 18 }}>
                <button
                  onClick={() => setShowSuggested(!showSuggested)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', width: '100%',
                    display: 'flex', alignItems: 'center', gap: 10, padding: 0,
                    color: 'var(--green-primary)', fontSize: '0.88rem', fontWeight: 600,
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>💡</span>
                  <span>Use a Dua from Quran & Sunnah</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.7 }}>{showSuggested ? '▲' : '▼'}</span>
                </button>

                {showSuggested && (
                  <div style={{ marginTop: 14 }}>
                    {selectedCategory.suggestedDuas.map((dua, i) => (
                      <div
                        key={i}
                        className={`suggested-dua ${selectedSuggested === dua ? 'selected' : ''}`}
                        onClick={() => setSelectedSuggested(selectedSuggested === dua ? null : dua)}
                      >
                        <p className="arabic-text" style={{ fontSize: '1.1rem', marginBottom: 8 }}>{dua.arabic}</p>
                        <p style={{ fontSize: '0.84rem', margin: '6px 0', color: 'var(--charcoal-light)', fontStyle: 'italic', lineHeight: 1.6 }}>
                          {dua.translation}
                        </p>
                        <p className="source">— {dua.source}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(selectedCategory.id === 'custom' || !selectedSuggested) && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: 8, color: 'var(--charcoal)' }}>
                  {selectedCategory.id === 'custom' ? 'Write your dua request' : 'Add a personal note (optional)'}
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Keep it brief — those making dua should be able to read it in under a minute..."
                  rows={4}
                  maxLength={MAX_CUSTOM_LENGTH + 10}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span className="caption">Keep it concise and sincere</span>
                  <span className="caption" style={{ color: customText.length > MAX_CUSTOM_LENGTH ? 'var(--red)' : undefined }}>
                    {customText.length}/{MAX_CUSTOM_LENGTH}
                  </span>
                </div>
              </div>
            )}

            <div className="islamic-divider" style={{ margin: '20px 0' }}>
              <div className="line"></div><div className="diamond">◆</div><div className="line"></div>
            </div>

            {/* Who can make dua */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: 10 }}>
                Who can make dua for you?
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => setHolyOnly(false)}
                  className={`dua-scope-option ${!holyOnly ? 'selected' : ''}`}
                >
                  <span className="scope-icon">🌍</span>
                  <div className="scope-text">
                    <div className="scope-title">Anyone, anywhere on earth</div>
                    <div className="scope-desc">More duas — from home, masjid, or holy sites</div>
                  </div>
                  <span className={`scope-check ${!holyOnly ? 'visible' : ''}`}>✓</span>
                </button>

                <button
                  onClick={() => setHolyOnly(true)}
                  className={`dua-scope-option ${holyOnly ? 'selected' : ''}`}
                >
                  <span className="scope-icon">🕌</span>
                  <div className="scope-text">
                    <div className="scope-title">Holy sites only</div>
                    <div className="scope-desc">Duas exclusively from Makkah, Madinah & more</div>
                  </div>
                  <span className={`scope-check ${holyOnly ? 'visible' : ''}`}>✓</span>
                </button>
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div style={{ marginBottom: 22 }}>
              <div className="toggle-wrapper">
                <button
                  className={`toggle ${isAnonymous ? 'active' : ''}`}
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  aria-label="Toggle anonymous"
                />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--charcoal)' }}>Stay Anonymous</div>
                  <div className="caption">Your name will be hidden from those making dua</div>
                </div>
              </div>
              {!isAnonymous && (
                <div className="info-banner green" style={{ marginTop: 10 }}>
                  <span className="banner-icon">✓</span>
                  <span className="banner-text">Sharing your name allows others to make a more personal dua for you</span>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary"
              disabled={!isValid() || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting...' : '🤲  Submit Dua Request'}
            </button>

            <p className="caption text-center" style={{ marginTop: 12 }}>
              {holyOnly
                ? '🕌 Your request will only be visible to Muslims at holy sites'
                : '🌍 Your request will be visible to Muslims everywhere'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
