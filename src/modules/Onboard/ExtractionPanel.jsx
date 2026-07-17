import React from 'react';
import { CheckCircle2, Rocket } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import PhotoUpload from './PhotoUpload';

function Field({ label, value }) {
  return (
    <div className="extraction-field">
      <span className="extraction-label">{label}</span>
      <span className={`extraction-value ${value ? 'filled' : 'pending'}`}>{value || 'pending'}</span>
    </div>
  );
}

export default function ExtractionPanel({
  extracted,
  catalog,
  photos,
  setPhotos,
  onGenerateCatalog,
  catalogLoading,
  catalogError,
}) {
  const { t } = useLanguage();
  const confidence = extracted?.confidence ?? 0;
  const complete = confidence >= 80;

  return (
    <div className="extraction-panel card">
      <div className="extraction-header">
        <h3>Extracted Profile</h3>
        {complete && (
          <span className="badge" style={{ background: 'rgba(45,212,167,0.15)', color: 'var(--green)' }}>
            <CheckCircle2 size={12} /> Profile Complete
          </span>
        )}
      </div>

      <Field label="Seller Name" value={extracted?.seller_name} />
      <Field label="Category" value={extracted?.category} />
      <Field label="Products" value={extracted?.products?.length ? extracted.products.join(', ') : ''} />
      <Field label="Price Range" value={extracted?.price_range} />
      <Field label="Language" value={extracted?.language} />
      <Field label="Location" value={extracted?.location} />

      <div className="extraction-confidence">
        <div className="extraction-confidence-bar">
          <div className="extraction-confidence-fill" style={{ width: `${confidence}%` }} />
        </div>
        <span className="mono">{confidence}% confidence</span>
      </div>

      {/* Photo upload unlocks once the conversation has given us enough
          profile signal — but the catalog itself is only ever generated
          from real photos, never from conversation text alone. */}
      {complete && !catalog && (
        <PhotoUpload
          photos={photos}
          setPhotos={setPhotos}
          onGenerate={onGenerateCatalog}
          loading={catalogLoading}
          error={catalogError}
        />
      )}

      {catalog && (
        <div className="catalog-preview">
          <h4>Generated Catalog Preview</h4>
          <div className="catalog-card">
            {catalog.coverImageUrl && (
              <img className="catalog-card-cover" src={catalog.coverImageUrl} alt={catalog.product_title || 'Product'} />
            )}
            <div className="catalog-card-title">{catalog.product_title}</div>
            <div className="catalog-card-price">{catalog.price}</div>
            <p className="catalog-card-desc">{catalog.description}</p>
            <div className="catalog-card-tags">
              {(catalog.tags || []).map((tag) => (
                <span key={tag} className="catalog-tag">
                  {tag}
                </span>
              ))}
            </div>
            {catalog.highlights?.length > 0 && (
              <ul className="catalog-card-highlights">
                {catalog.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="catalog-status-section">
            <Rocket size={16} color="var(--green)" />
            <div className="catalog-status-text">
              <span className="catalog-status-title">{t('onboard.readyStatusTitle')}</span>
              <span className="catalog-status-sub">{t('onboard.readyStatusSub')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
