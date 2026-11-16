import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Pill } from 'lucide-react';
import supplementService from '../services/supplementService';
import { supplementIntakeApi } from '../services/trackingService';
import type { SupplementDto } from '../types/supplement';
import { toLocalDateInput } from '../utils/dateTime';
import './SupplementChecklist.css';
import { useI18n } from '../i18n/I18nContext';

interface Props {
  /** Compact card for the dashboard (links to the supplements page). */
  compact?: boolean;
  /** Bump to reload, e.g. after the supplement list changed. */
  refreshKey?: number;
}

/** Today's "taken?" checklist for the user's supplements. */
export function SupplementChecklist({ compact = false, refreshKey = 0 }: Props) {
  const { t } = useI18n();
  const today = toLocalDateInput();
  const [supplements, setSupplements] = useState<SupplementDto[]>([]);
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([supplementService.getSupplements(), supplementIntakeApi.forDate(today)])
      .then(([s, intakes]) => {
        setSupplements(s);
        setTaken(new Set(intakes.map((i) => i.supplementId)));
      })
      .catch(() => setError(true))
      .finally(() => setLoaded(true));
  }, [today, refreshKey]);

  const toggle = async (id: string) => {
    const wasTaken = taken.has(id);
    const next = new Set(taken);
    wasTaken ? next.delete(id) : next.add(id);
    setTaken(next);
    try {
      if (wasTaken) await supplementIntakeApi.unmark(id, today);
      else await supplementIntakeApi.mark(id, today);
    } catch {
      setTaken(taken); // roll back
      setError(true);
    }
  };

  if (!loaded || supplements.length === 0) return null;

  const done = supplements.filter((s) => taken.has(s.id)).length;

  return (
    <section className={`supplement-checklist card ${compact ? 'compact' : ''}`} aria-label={t("Bugünün takviyeleri")}>
      <div className="checklist-head">
        <h2>
          <Pill size="1em" aria-hidden="true" /> {t("Bugünün takviyeleri")}
        </h2>
        <span className={`checklist-count ${done === supplements.length ? 'all' : ''}`}>
          {done}/{supplements.length} {t('alındı')}
        </span>
      </div>
      {error && <p className="checklist-error">Kaydedilemedi, tekrar dene.</p>}
      <ul>
        {supplements.map((s) => {
          const isTaken = taken.has(s.id);
          return (
            <li key={s.id}>
              <button type="button" className={`check-row ${isTaken ? 'taken' : ''}`} onClick={() => toggle(s.id)} aria-pressed={isTaken}>
                <span className="check-box" aria-hidden="true">
                  {isTaken && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="check-name">{s.name}</span>
                <span className="check-meta">{[s.dosage, s.timing].filter(Boolean).join(' · ')}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {compact && (
        <Link to="/supplements" className="checklist-link">
          {t("Takviyeleri yönet")}
        </Link>
      )}
    </section>
  );
}
