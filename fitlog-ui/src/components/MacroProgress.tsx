import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import type { NutritionSummaryDto } from '../types/nutrition';
import { useSettings } from '../store/SettingsContext';
import { formatNumber } from '../utils/units';
import './MacroProgress.css';
import { useI18n } from '../i18n/I18nContext';

interface Props {
  summary: NutritionSummaryDto | null;
}

/** Today's intake against the user's daily targets (from Settings). */
export function MacroProgress({ summary }: Props) {
  const { t } = useI18n();
  const { settings } = useSettings();
  const rows = [
    { key: 'kcal', label: t("Kalori"), value: summary?.totalCalories ?? 0, target: settings.calorieTarget, unit: 'kcal' },
    { key: 'protein', label: t("Protein"), value: summary?.totalProtein ?? 0, target: settings.proteinTarget, unit: 'g' },
    { key: 'carb', label: t("Karbonhidrat"), value: summary?.totalCarbohydrates ?? 0, target: settings.carbTarget, unit: 'g' },
    { key: 'fat', label: t("Yağ"), value: summary?.totalFat ?? 0, target: settings.fatTarget, unit: 'g' },
  ].filter((r) => r.target && r.target > 0);

  if (rows.length === 0) {
    return (
      <div className="macro-progress empty">
        <Target size={18} aria-hidden="true" />
        <span>
          {t("Günlük kalori ve makro hedefi belirlersen ilerlemen burada görünür.")}{' '}
          <Link to="/settings">{t("Hedef belirle")}</Link>
        </span>
      </div>
    );
  }

  return (
    <div className="macro-progress">
      {rows.map((r) => {
        const pct = Math.round((r.value / r.target!) * 100);
        const remaining = Math.round(r.target! - r.value);
        const over = remaining < 0;
        return (
          <div key={r.key} className="macro-row-item">
            <div className="macro-row-head">
              <span className="macro-name">{r.label}</span>
              <span className="macro-values">
                <strong>{formatNumber(r.value)}</strong> / {formatNumber(r.target!)} {r.unit}
              </span>
            </div>
            <div
              className={`macro-bar ${r.key} ${over ? 'over' : ''}`}
              role="progressbar"
              aria-label={r.label}
              aria-valuenow={Math.round(r.value)}
              aria-valuemin={0}
              aria-valuemax={r.target!}
            >
              <span style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <span className={`macro-left ${over ? 'over' : ''}`}>
              {over ? `${formatNumber(-remaining)} ${r.unit} ${t('fazla')}` : `${formatNumber(remaining)} ${r.unit} ${t('kaldı')}`} · %{pct}
            </span>
          </div>
        );
      })}
    </div>
  );
}
