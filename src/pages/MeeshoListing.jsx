import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeller } from '../context/SellerContext';
import { ArrowLeft, CheckCircle2, Package, Tag, IndianRupee, Star } from 'lucide-react';

export default function MeeshoListing() {
  const { catalogOutput } = useSeller();
  const navigate = useNavigate();
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  async function handlePublish() {
    setPublishing(true);
    // Simulate a short network round-trip so the animation is visible.
    await new Promise((r) => setTimeout(r, 1200));
    setPublished(true);
    setPublishing(false);
  }

  // Guard: if no catalog exists (e.g., user navigated here directly), show a prompt.
  if (!catalogOutput) {
    return (
      <div className="meesho-page">
        <div className="meesho-empty">
          <Package size={48} color="#f43397" />
          <h2>No listing ready yet</h2>
          <p>Complete the Orbit Onboard flow to generate a catalog, then come back here.</p>
          <button className="meesho-back-btn" onClick={() => navigate('/onboard')}>
            Go to Orbit Onboard →
          </button>
        </div>
      </div>
    );
  }

  const { product_title, price, description, tags = [], highlights = [], coverImageUrl, category } = catalogOutput;

  return (
    <div className="meesho-page">
      {/* Meesho-flavored header */}
      <header className="meesho-header">
        <button className="meesho-back" onClick={() => navigate('/onboard')}>
          <ArrowLeft size={18} /> Back to Orbit
        </button>
        <div className="meesho-header-brand">
          <span className="meesho-logo-m">m</span>
          <span className="meesho-logo-text">eesho</span>
          <span className="meesho-seller-tag">Seller Portal</span>
        </div>
        <div className="meesho-header-right">
          <span className="meesho-badge-new">NEW LISTING</span>
        </div>
      </header>

      <div className="meesho-content">
        <div className="meesho-breadcrumb">
          Seller Portal &rsaquo; My Listings &rsaquo; <strong>Add New Product</strong>
        </div>

        {published ? (
          /* ── Success state ────────────────────────────────── */
          <div className="meesho-success">
            <div className="meesho-success-icon">
              <CheckCircle2 size={56} color="#4caf50" />
            </div>
            <h2 className="meesho-success-title">Your product is live! 🎉</h2>
            <p className="meesho-success-sub">
              <strong>{product_title}</strong> has been published to Meesho.<br />
              Buyers can now discover and order your product.
            </p>
            <div className="meesho-success-stats">
              <div className="meesho-stat">
                <span className="meesho-stat-value">0</span>
                <span className="meesho-stat-label">Orders</span>
              </div>
              <div className="meesho-stat">
                <span className="meesho-stat-value">0</span>
                <span className="meesho-stat-label">Views today</span>
              </div>
              <div className="meesho-stat">
                <span className="meesho-stat-value meesho-stat-price">{price || '—'}</span>
                <span className="meesho-stat-label">Listed price</span>
              </div>
            </div>
            <button className="meesho-publish-btn meesho-publish-btn--done" onClick={() => navigate('/onboard')}>
              ← Back to Orbit Onboard
            </button>
          </div>
        ) : (
          /* ── Preview + publish ────────────────────────────── */
          <div className="meesho-layout">
            {/* Left: product images */}
            <div className="meesho-images">
              {coverImageUrl ? (
                <img className="meesho-cover" src={coverImageUrl} alt={product_title || 'Product'} />
              ) : (
                <div className="meesho-cover-placeholder">
                  <Package size={52} color="#f43397" />
                  <span>No image</span>
                </div>
              )}
              <p className="meesho-image-hint">Cover image selected by AI from your uploaded photos</p>
            </div>

            {/* Right: listing details */}
            <div className="meesho-details">
              <div className="meesho-category-pill">
                <Tag size={11} /> {category || 'Apparel & Accessories'}
              </div>

              <h1 className="meesho-product-title">{product_title || 'Untitled Product'}</h1>

              <div className="meesho-price-row">
                <IndianRupee size={18} className="meesho-rupee" />
                <span className="meesho-price">{price?.replace(/[₹\s]/g, '') || '—'}</span>
                <span className="meesho-price-note">Free delivery</span>
              </div>

              <div className="meesho-rating-row">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={13} fill={s <= 4 ? '#f5b72f' : 'none'} color="#f5b72f" />
                ))}
                <span className="meesho-rating-label">New listing</span>
              </div>

              <div className="meesho-section-label">Description</div>
              <p className="meesho-description">{description}</p>

              {highlights.length > 0 && (
                <>
                  <div className="meesho-section-label">Highlights</div>
                  <ul className="meesho-highlights">
                    {highlights.map((h) => (
                      <li key={h}>
                        <CheckCircle2 size={13} color="#4caf50" /> {h}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {tags.length > 0 && (
                <div className="meesho-tags">
                  {tags.map((t) => (
                    <span key={t} className="meesho-tag">#{t}</span>
                  ))}
                </div>
              )}

              <div className="meesho-ai-note">
                ✦ Listing generated by Orbit Catalog Vision Agent from your product photos
              </div>

              <button
                className="meesho-publish-btn"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? (
                  <span className="meesho-publishing-dots">
                    Publishing<span>.</span><span>.</span><span>.</span>
                  </span>
                ) : (
                  '🚀 Publish Listing on Meesho'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
