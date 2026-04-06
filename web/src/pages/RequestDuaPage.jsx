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
  const [showSuggested, setShowSuggested] = useState(false);
  const [selectedSuggested, setSelectedSuggested] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setSelectedCategory(null);
    setCustomText('');
    setIsAnonymous(false);
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
        category: selectedCategory.id,
        customText: customText.trim() || null,
        suggestedDua: selectedSuggested?.translation || null,
        duasMadeCount: 0,
        lastDuaMadeAt: null,
        createdAt: Date.now(),
        isActive: true,
      };
      await FirebaseService.createDuaRequest(request);
      await refreshUser();
      toast.success('Your dua request has been submitted. May Allah answer it.', { duration: 4000 });
      resetForm();
    } catch (err) {
      toast.error('Failed to submit. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="page-content">
      <div className="islamic-header">
        <div className="icon">🤲</div>
        <h1>Request a Dua</h1>
        <p className="subtitle">Ask the Ummah to pray for you</p>
      </div>

      <div className="container" style={{ marginTop: 16 }}>
        {!selectedCategory ? (
          /* Category Picker */
          <>
            <h2 className="subheading" style={{ fontSize: '1rem', marginBottom: 16 }}>
              What would you like dua for?
            </h2>
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
          /* Request Form */
          <div className="fade-in">
            <button
              className="btn btn-sm btn-secondary"
              onClick={resetForm}
              style={{ width: 'auto', marginBottom: 16 }}
            >
              ← Back
            </button>

            {/* Selected category */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: '1.3rem' }}>{selectedCategory.icon}</span>
              <span className="subheading" style={{ color: 'var(--charcoal)', fontSize: '1rem' }}>
                {selectedCategory.name}
              </span>
            </div>

            {/* Default text */}
            {selectedCategory.id !== 'custom' && !selectedSuggested && selectedCategory.defaultText && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="caption" style={{ marginBottom: 4 }}>Default request:</div>
                <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--charcoal)' }}>
                  {selectedCategory.defaultText}
                </p>
              </div>
            )}

            {/* Suggested Duas */}
            {selectedCategory.suggestedDuas.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <button
                  onClick={() => setShowSuggested(!showSuggested)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', width: '100%',
                    display: 'flex', alignItems: 'center', gap: 8, padding: 0,
                    color: 'var(--green-primary)', fontSize: '0.9rem'
                  }}
                >
                  <span>💡</span>
                  <span>Suggest a Dua from Quran/Sunnah</span>
                  <span style={{ marginLeft: 'auto' }}>{showSuggested ? '▲' : '▼'}</span>
                </button>

                {showSuggested && (
                  <div style={{ marginTop: 12 }}>
                    {selectedCategory.suggestedDuas.map((dua, i) => (
                      <div
                        key={i}
                        className={`suggested-dua ${selectedSuggested === dua ? 'selected' : ''}`}
                        onClick={() => setSelectedSuggested(selectedSuggested === dua ? null : dua)}
                      >
                        <p className="arabic-text">{dua.arabic}</p>
                        <p style={{ fontSize: '0.85rem', margin: '8px 0', color: 'var(--charcoal)' }}>
                          {dua.translation}
                        </p>
                        <p className="source">— {dua.source}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Custom text */}
            {(selectedCategory.id === 'custom' || !selectedSuggested) && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                  {selectedCategory.id === 'custom' ? 'Write your dua request' : 'Or add a specific note (optional)'}
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Keep it brief — one minute to read..."
                  rows={3}
                  maxLength={MAX_CUSTOM_LENGTH + 10}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span className="caption">Keep it brief — one minute to read</span>
                  <span className="caption" style={{ color: customText.length > MAX_CUSTOM_LENGTH ? 'var(--red)' : undefined }}>
                    {customText.length}/{MAX_CUSTOM_LENGTH}
                  </span>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="islamic-divider" style={{ margin: '16px 0' }}>
              <div className="line"></div>
              <div className="diamond">◆</div>
              <div className="line"></div>
            </div>

            {/* Anonymous Toggle */}
            <div style={{ marginBottom: 20 }}>
              <div className="toggle-wrapper">
                <button
                  className={`toggle ${isAnonymous ? 'active' : ''}`}
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  aria-label="Toggle anonymous"
                />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Stay Anonymous</div>
                  <div className="caption">Your name will be hidden from those making dua</div>
                </div>
              </div>
              {!isAnonymous && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--green-primary)', fontSize: '0.8rem' }}>
                  <span>✓</span>
                  <span>Sharing your name lets others make a more personal dua for you</span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              className="btn btn-primary"
              disabled={!isValid() || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting...' : 'Submit Dua Request'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
