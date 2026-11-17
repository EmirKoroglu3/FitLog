import { useEffect, useRef, useState } from 'react';
import { Camera, Columns2, Trash2, Upload } from 'lucide-react';
import { bodyApi, type ProgressPhoto } from '../services/trackingService';
import { toLocalDateInput } from '../utils/dateTime';
import './ProgressPhotos.css';
import { useConfirm } from './ConfirmProvider';

const POSES: Record<ProgressPhoto['pose'], string> = { front: 'Ön', side: 'Yan', back: 'Arka' };
const MAX_SIDE = 1080;

/** Downscales an image file to a JPEG data URL (keeps uploads small for the database). */
async function resizeToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.82);
}

const formatDate = (d: string) =>
  new Date(`${d}T00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

export function ProgressPhotos() {
  const { confirm } = useConfirm();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [pose, setPose] = useState<ProgressPhoto['pose']>('front');
  const [date, setDate] = useState(toLocalDateInput());
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef(urls);
  urlsRef.current = urls;

  useEffect(() => {
    bodyApi.photos().then(setPhotos).catch(() => setError('Fotoğraflar yüklenemedi.'));
    return () => Object.values(urlsRef.current).forEach(URL.revokeObjectURL);
  }, []);

  // Images need the auth header, so fetch them as blobs
  useEffect(() => {
    photos
      .filter((p) => !urls[p.id])
      .forEach((p) =>
        bodyApi
          .photoUrl(p.id)
          .then((url) => setUrls((u) => ({ ...u, [p.id]: url })))
          .catch(() => {}),
      );
  }, [photos]);

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Lütfen bir görsel seç.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await resizeToDataUrl(file);
      const saved = await bodyApi.uploadPhoto({ date, pose, dataUrl });
      setPhotos((p) => [saved, ...p].sort((a, b) => b.date.localeCompare(a.date)));
    } catch {
      setError('Fotoğraf yüklenemedi (en fazla ~1 MB, JPEG/PNG/WebP).');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async (id: string) => {
    if (!(await confirm({ title: 'Fotoğraf silinsin mi?', message: 'Bu işlem geri alınamaz.', confirmText: 'Sil', danger: true }))) return;
    await bodyApi.deletePhoto(id);
    setPhotos((p) => p.filter((x) => x.id !== id));
    setCompare((c) => c.filter((x) => x !== id));
  };

  const toggleCompare = (id: string) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c.slice(-1), id]));

  const compared = compare.map((id) => photos.find((p) => p.id === id)).filter(Boolean) as ProgressPhoto[];

  return (
    <div className="progress-photos">
      <div className="card photo-upload">
        <h3>
          <Camera size="1em" aria-hidden="true" /> Gelişim fotoğrafı ekle
        </h3>
        <p className="muted">Fotoğraflar sadece sana görünür. Aynı ışık ve pozda çekersen karşılaştırma daha anlamlı olur.</p>
        <div className="upload-row">
          <label>
            Tarih
            <input type="date" value={date} max={toLocalDateInput()} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Poz
            <select value={pose} onChange={(e) => setPose(e.target.value as ProgressPhoto['pose'])}>
              {Object.entries(POSES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <button className="btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload size={16} aria-hidden="true" /> {uploading ? 'Yükleniyor…' : 'Fotoğraf Seç'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
        {error && <p className="error-text" role="alert">{error}</p>}
      </div>

      {compared.length === 2 && (
        <div className="card compare">
          <h3>
            <Columns2 size="1em" aria-hidden="true" /> Karşılaştırma
          </h3>
          <div className="compare-grid">
            {compared
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((p) => (
                <figure key={p.id}>
                  {urls[p.id] && <img src={urls[p.id]} alt={`${POSES[p.pose]} poz, ${formatDate(p.date)}`} />}
                  <figcaption>{formatDate(p.date)}</figcaption>
                </figure>
              ))}
          </div>
        </div>
      )}

      {photos.length === 0 ? (
        <p className="empty-photos">Henüz fotoğraf yok. İlk fotoğrafını ekleyerek başla.</p>
      ) : (
        <>
          <p className="muted">Karşılaştırmak için iki fotoğraf seç.</p>
          <div className="photo-grid">
            {photos.map((p) => (
              <figure key={p.id} className={compare.includes(p.id) ? 'selected' : ''}>
                <button type="button" className="photo-btn" onClick={() => toggleCompare(p.id)} aria-pressed={compare.includes(p.id)}>
                  {urls[p.id] ? <img src={urls[p.id]} alt={`${POSES[p.pose]} poz, ${formatDate(p.date)}`} /> : <span className="photo-placeholder" />}
                </button>
                <figcaption>
                  <span>
                    {formatDate(p.date)} · {POSES[p.pose]}
                  </span>
                  <button type="button" className="btn-icon btn-delete" onClick={() => remove(p.id)} aria-label="Fotoğrafı sil">
                    <Trash2 size={16} />
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
