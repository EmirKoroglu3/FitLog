import { useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import { LEVEL_LABELS, MUSCLE_LABELS, muscleVolume, volumeLevel, type MuscleId } from '../utils/muscleMap';
import './MuscleMap.css';

interface Props {
  /** Exercises to count, e.g. every exercise of the selected program (one week). */
  entries: { name: string; sets: number }[];
  title?: string;
  subtitle?: string;
}

type Shape = { id: MuscleId; d: string };

// Right half of the body (x 100..160); the left half is the same shapes mirrored.
const FRONT: Shape[] = [
  { id: 'traps', d: 'M106,54 Q116,60 128,62 L112,64 Q106,60 106,54 Z' },
  { id: 'chest_upper', d: 'M102,66 Q114,64 124,68 Q131,74 133,82 L102,82 Z' },
  { id: 'chest_mid', d: 'M102,83 L133,83 Q134,92 130,98 L102,98 Z' },
  { id: 'chest_lower', d: 'M102,99 L130,99 Q125,110 113,112 Q106,112 102,110 Z' },
  { id: 'delt_front', d: 'M126,64 Q136,64 140,76 Q139,90 135,96 Q130,84 124,70 Z' },
  { id: 'delt_side', d: 'M130,62 Q146,63 150,78 Q151,90 147,98 Q143,80 130,62 Z' },
  { id: 'biceps', d: 'M140,100 Q149,98 152,108 Q153,124 149,136 Q143,138 141,130 Q139,115 140,100 Z' },
  { id: 'forearms', d: 'M146,142 Q154,140 156,150 Q158,172 157,192 L151,193 Q147,170 146,142 Z' },
  { id: 'abs', d: 'M102,116 L114,116 Q116,145 114,176 L102,178 Z' },
  { id: 'obliques', d: 'M116,114 L128,110 Q133,140 128,172 L116,178 Q118,145 116,114 Z' },
  { id: 'quads', d: 'M106,206 Q120,200 131,204 Q135,250 127,298 L111,298 Q103,250 106,206 Z' },
  { id: 'adductors', d: 'M101,208 L105,207 Q104,250 109,288 L101,290 Z' },
  { id: 'calves', d: 'M111,314 Q120,310 127,316 Q130,345 123,382 L114,382 Q108,345 111,314 Z' },
];

const BACK: Shape[] = [
  { id: 'traps', d: 'M100,50 Q110,56 130,63 Q118,72 108,84 L100,100 Z' },
  { id: 'delt_rear', d: 'M124,66 Q138,64 143,76 Q141,90 134,94 Q128,82 124,66 Z' },
  { id: 'delt_side', d: 'M132,62 Q147,63 151,78 Q151,90 147,98 Q145,78 132,62 Z' },
  { id: 'midback', d: 'M100,101 L108,85 Q118,74 126,74 Q126,94 120,110 L100,118 Z' },
  { id: 'lowerback', d: 'M101,126 L116,120 Q110,140 107,158 L111,176 L101,178 Z' },
  { id: 'lats', d: 'M127,78 Q137,88 138,104 Q135,130 120,152 L107,156 Q114,130 121,112 Q128,96 127,78 Z' },
  { id: 'triceps', d: 'M140,100 Q150,98 153,110 Q153,126 149,138 Q143,138 141,128 Q139,114 140,100 Z' },
  { id: 'forearms', d: 'M146,142 Q154,140 156,150 Q158,172 157,192 L151,193 Q147,170 146,142 Z' },
  { id: 'glute_med', d: 'M113,180 Q126,178 131,186 Q133,196 128,204 Q120,192 113,180 Z' },
  { id: 'glutes', d: 'M101,184 Q118,182 128,198 Q134,214 124,226 Q110,232 101,228 Z' },
  { id: 'hamstrings', d: 'M104,232 Q118,226 131,230 Q134,266 126,300 L110,300 Q102,266 104,232 Z' },
  { id: 'calves', d: 'M110,314 Q121,308 129,318 Q134,345 124,382 L113,382 Q104,345 110,314 Z' },
];

/** Right half of the body outline; mirrored for the left half. */
const SILHOUETTE =
  'M100,46 L106,46 L107,54 Q116,60 130,62 Q148,64 152,80 Q156,100 155,122 Q158,150 158,172 Q160,188 159,198 ' +
  'L150,198 Q148,176 146,160 Q143,142 141,130 L139,108 Q136,130 133,150 Q130,172 132,200 Q138,250 130,300 ' +
  'Q133,330 129,362 Q127,380 125,388 L111,388 Q110,370 110,350 Q106,330 109,304 Q102,262 102,214 L100,214 Z';

/** Body outline, head, hands and feet (never coloured), plus a few anatomy lines. */
function Skin({ back }: { back?: boolean }) {
  const half = (mirror: boolean) => (
    <g transform={mirror ? 'translate(200,0) scale(-1,1)' : undefined}>
      <path d={SILHOUETTE} />
      <ellipse cx="154" cy="203" rx="5" ry="7" />
      <ellipse cx="118" cy="393" rx="8" ry="5" />
    </g>
  );
  return (
    <g className="mm-skin">
      {half(false)}
      {half(true)}
      <circle cx="100" cy="29" r="16" />
      {back && <path className="mm-line" d="M100,100 L100,178" />}
    </g>
  );
}

/** Decorative lines drawn over the muscles (six-pack, knees). */
function Details({ back }: { back?: boolean }) {
  return back ? null : (
    <g className="mm-lines" aria-hidden="true">
      <path d="M100,116 L100,178 M88,132 L112,132 M87,148 L113,148 M87,163 L113,163" />
    </g>
  );
}

function Figure({
  shapes,
  label,
  back,
  sets,
  selected,
  onSelect,
}: {
  shapes: Shape[];
  label: string;
  back?: boolean;
  sets: Partial<Record<MuscleId, number>>;
  selected: MuscleId | null;
  onSelect: (id: MuscleId) => void;
}) {
  const half = (mirror: boolean) => (
    <g transform={mirror ? 'translate(200,0) scale(-1,1)' : undefined}>
      {shapes.map((s) => {
        const value = sets[s.id] ?? 0;
        return (
          <path
            key={s.id}
            d={s.d}
            className={`mm-region lvl${volumeLevel(value)} ${selected === s.id ? 'selected' : ''}`}
            onClick={() => onSelect(s.id)}
            onMouseEnter={() => onSelect(s.id)}
          >
            <title>{`${MUSCLE_LABELS[s.id]}: ${value ? value.toLocaleString('tr-TR', { maximumFractionDigits: 1 }) : 0} set/hafta`}</title>
          </path>
        );
      })}
    </g>
  );

  return (
    <figure className="mm-figure">
      <svg viewBox="40 6 120 396" role="img" aria-label={`${label} görünüm`}>
        <Skin back={back} />
        {half(false)}
        {half(true)}
        <Details back={back} />
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

const fmt = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 1 });

/** Front/back body map coloured by weekly sets per muscle. */
export function MuscleMap({ entries, title = 'Çalışan bölgeler', subtitle = 'Programdaki haftalık set sayısına göre' }: Props) {
  const volume = useMemo(() => muscleVolume(entries), [entries]);
  const [selected, setSelected] = useState<MuscleId | null>(null);

  const ranked = (Object.keys(MUSCLE_LABELS) as MuscleId[])
    .map((id) => ({ id, sets: volume.sets[id] ?? 0 }))
    .sort((a, b) => b.sets - a.sets);
  const missing = ranked.filter((r) => r.sets === 0).map((r) => MUSCLE_LABELS[r.id]);
  const sel = selected ? { id: selected, sets: volume.sets[selected] ?? 0, sources: volume.sources[selected] ?? [] } : null;

  return (
    <section className="muscle-map card" aria-label={title}>
      <header className="mm-head">
        <h3>
          <Activity size="1em" aria-hidden="true" /> {title}
        </h3>
        <p>{subtitle}</p>
      </header>

      <div className="mm-figures">
        <Figure shapes={FRONT} label="Ön" sets={volume.sets} selected={selected} onSelect={setSelected} />
        <Figure shapes={BACK} label="Arka" back sets={volume.sets} selected={selected} onSelect={setSelected} />
      </div>

      <ul className="mm-legend" aria-label="Renk açıklaması">
        {LEVEL_LABELS.map((label, i) => (
          <li key={label}>
            <span className={`mm-swatch lvl${i}`} aria-hidden="true" /> {label}
          </li>
        ))}
      </ul>

      <div className="mm-detail" aria-live="polite">
        {sel ? (
          <>
            <strong>
              {MUSCLE_LABELS[sel.id]}: {fmt(sel.sets)} set/hafta
            </strong>
            {sel.sources.length > 0 ? (
              <ul>
                {sel.sources
                  .slice()
                  .sort((a, b) => b.sets - a.sets)
                  .map((s, i) => (
                    <li key={`${s.name}-${i}`}>
                      {s.name} <span>{fmt(s.sets)}</span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>Bu bölgeyi çalıştıran hareket yok.</p>
            )}
          </>
        ) : (
          <p>Bir bölgeye dokun, kaç set aldığını ve hangi hareketlerden geldiğini gör.</p>
        )}
      </div>

      <details className="mm-list">
        <summary>Tüm bölgeler</summary>
        <ul>
          {ranked.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => setSelected(r.id)} className={selected === r.id ? 'active' : ''}>
                <span className={`mm-swatch lvl${volumeLevel(r.sets)}`} aria-hidden="true" />
                {MUSCLE_LABELS[r.id]}
                <span className="mm-sets">{fmt(r.sets)}</span>
              </button>
            </li>
          ))}
        </ul>
      </details>

      {missing.length > 0 && missing.length < ranked.length && (
        <p className="mm-note">Hiç çalışmayan: {missing.join(', ')}</p>
      )}
      {volume.unmatched.length > 0 && (
        <p className="mm-note">Tanınmayan hareket: {volume.unmatched.join(', ')}</p>
      )}
    </section>
  );
}

export default MuscleMap;
