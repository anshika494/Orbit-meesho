import React, { useCallback } from 'react';
import { Camera, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const MAX_PHOTOS = 6;

function readFileAsImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/.exec(dataUrl || '');
      if (!match) {
        reject(new Error('Could not read image file'));
        return;
      }
      resolve({
        id: `${file.name}_${file.lastModified}_${Math.random().toString(36).slice(2)}`,
        mediaType: match[1],
        base64: match[2],
        previewUrl: dataUrl,
      });
    };
    reader.onerror = () => reject(reader.error || new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

export default function PhotoUpload({ photos, setPhotos, onGenerate, loading, error }) {
  const { t } = useLanguage();

  const handleFiles = useCallback(
    async (fileList) => {
      const remainingSlots = MAX_PHOTOS - photos.length;
      if (remainingSlots <= 0) return;
      const files = Array.from(fileList)
        .filter((f) => f.type.startsWith('image/'))
        .slice(0, remainingSlots);

      const results = [];
      for (const file of files) {
        try {
          // eslint-disable-next-line no-await-in-loop
          results.push(await readFileAsImage(file));
        } catch (e) {
          /* skip files the browser can't read as an image */
        }
      }
      if (results.length) {
        setPhotos((prev) => [...prev, ...results].slice(0, MAX_PHOTOS));
      }
    },
    [photos.length, setPhotos]
  );

  const removePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="photo-upload">
      <h4 className="photo-upload-title">{t('onboard.uploadPhotosTitle')}</h4>
      <p className="photo-upload-sub">{t('onboard.uploadPhotosSub')}</p>

      {photos.length > 0 && (
        <div className="photo-upload-grid">
          {photos.map((p) => (
            <div className="photo-upload-thumb" key={p.id}>
              <img src={p.previewUrl} alt="" />
              <button
                type="button"
                className="photo-upload-remove"
                onClick={() => removePhoto(p.id)}
                aria-label={t('onboard.removePhoto')}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className={`photo-upload-choose ${photos.length >= MAX_PHOTOS ? 'disabled' : ''}`}>
        <Camera size={15} />
        {t('onboard.uploadPhotosButton')} ({photos.length}/{MAX_PHOTOS})
        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          disabled={photos.length >= MAX_PHOTOS}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </label>

      {error && <div className="photo-upload-error">{error}</div>}

      <button
        className="btn-primary photo-upload-generate"
        onClick={onGenerate}
        disabled={photos.length === 0 || loading}
      >
        {loading ? t('onboard.generatingListing') : t('onboard.generateListingButton')}
      </button>
    </div>
  );
}
