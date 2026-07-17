import React, { useState, useCallback, useRef } from 'react';
import ChatInterface from './ChatInterface';
import ExtractionPanel from './ExtractionPanel';
import { useSeller } from '../../context/SellerContext';
import { useLanguage } from '../../context/LanguageContext';
import { runCatalogVisionAgent } from '../../agents/catalogVisionAgent';

export default function Onboard() {
  const { pushLog, setExtractedProfile, setCatalogOutput, updateSeller, extractedProfile, catalogOutput } =
    useSeller();
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(null);
  const photoPromptShownRef = useRef(false);

  const handleExtracted = useCallback(
    (extracted) => {
      setExtractedProfile(extracted);
      if ((extracted?.confidence ?? 0) >= 80) {
        updateSeller({ onboardComplete: true });
        // Explain, once, why she's being asked for photos instead of the
        // listing just appearing — otherwise the extra step feels
        // unexplained. This is a fixed app message (not model-generated),
        // so the wording is exact and only ever shown a single time. A
        // ref (not state) guards this, since state updaters must stay
        // pure and shouldn't trigger side effects like setMessages.
        if (!photoPromptShownRef.current) {
          photoPromptShownRef.current = true;
          setMessages((prev) => [...prev, { role: 'assistant', content: t('onboard.photoExplainerMessage') }]);
        }
      }
    },
    [setExtractedProfile, updateSeller, t]
  );

  const handleGenerateCatalog = useCallback(async () => {
    if (!photos.length) return;
    setCatalogError(null);
    setCatalogLoading(true);
    try {
      const listing = await runCatalogVisionAgent(photos, extractedProfile, pushLog);
      // Keep the cover photo's preview alongside the listing so the UI can
      // show the actual uploaded image, not a placeholder.
      const coverPhoto = photos[listing.cover_image_index] || photos[0];
      setCatalogOutput({ ...listing, coverImageUrl: coverPhoto?.previewUrl ?? null });
    } catch (err) {
      pushLog('SYSTEM', `Catalog Vision Agent error: ${err.message}`);
      setCatalogError(err.message);
    } finally {
      setCatalogLoading(false);
    }
  }, [photos, extractedProfile, pushLog, setCatalogOutput]);

  return (
    <div className="onboard-module">
      <div className="onboard-header">
        <h2>{t('onboard.title')}</h2>
        <p>{t('onboard.subtitle')}</p>
      </div>
      <div className="onboard-layout">
        <ChatInterface
          messages={messages}
          setMessages={setMessages}
          onExtracted={handleExtracted}
          onLog={pushLog}
        />
        <ExtractionPanel
          extracted={extractedProfile}
          catalog={catalogOutput}
          photos={photos}
          setPhotos={setPhotos}
          onGenerateCatalog={handleGenerateCatalog}
          catalogLoading={catalogLoading}
          catalogError={catalogError}
        />
      </div>
    </div>
  );
}
