import { useMemo, useState } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useTheme } from '../store/ThemeContext';
import './TrendChart.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip);

/** Mark color validated (lightness band, chroma, ≥3:1 contrast) against both light and dark chart surfaces. */
const SERIES = '#ea580c';

export interface TrendPoint {
  label: string;
  value: number;
  /** Extra tooltip line, e.g. "80 kg × 8". */
  detail?: string;
}

interface Props {
  kind: 'line' | 'bar';
  points: TrendPoint[];
  /** Name of the series, used in the table and tooltip. */
  seriesLabel: string;
  formatValue: (v: number) => string;
  height?: number;
}

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function TrendChart({ kind, points, seriesLabel, formatValue, height = 260 }: Props) {
  const { resolved } = useTheme();
  const [showTable, setShowTable] = useState(false);

  // Re-read tokens whenever the theme changes
  const colors = useMemo(
    () => ({ surface: css('--surface'), grid: css('--border'), text: css('--text-2'), ink: css('--text') }),
    [resolved],
  );

  const data = {
    labels: points.map((p) => p.label),
    datasets: [
      {
        label: seriesLabel,
        data: points.map((p) => p.value),
        borderColor: SERIES,
        backgroundColor: kind === 'line' ? `${SERIES}1a` : SERIES, // ~10% wash for area
        fill: kind === 'line' ? 'origin' : undefined,
        borderWidth: kind === 'line' ? 2 : 0,
        tension: 0.25,
        pointRadius: points.length > 40 ? 0 : 4,
        pointHoverRadius: 6,
        pointBackgroundColor: SERIES,
        pointBorderColor: colors.surface, // 2px surface ring
        pointBorderWidth: 2,
        pointHitRadius: 14,
        borderRadius: kind === 'bar' ? { topLeft: 4, topRight: 4 } : undefined,
        borderSkipped: 'bottom' as const,
        maxBarThickness: 24,
      },
    ],
  };

  const options: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false }, // single series: the card title names it
      tooltip: {
        backgroundColor: colors.ink,
        titleColor: colors.surface,
        bodyColor: colors.surface,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => {
            const p = points[ctx.dataIndex];
            return [`${seriesLabel}: ${formatValue(Number(ctx.raw))}`, ...(p?.detail ? [p.detail] : [])];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: colors.grid },
        ticks: { color: colors.text, maxRotation: 0, autoSkipPadding: 12 },
      },
      y: {
        beginAtZero: kind === 'bar',
        grid: { color: colors.grid, lineWidth: 1 },
        border: { display: false },
        ticks: {
          color: colors.text,
          maxTicksLimit: 5,
          callback: (v) => formatValue(Number(v)),
        },
      },
    },
  };

  if (points.length === 0) return null;

  return (
    <div className="trend-chart">
      <button type="button" className="table-toggle" onClick={() => setShowTable((s) => !s)} aria-pressed={showTable}>
        {showTable ? 'Grafik' : 'Tablo'}
      </button>
      {showTable ? (
        <div className="trend-table-wrap">
          <table className="trend-table">
            <thead>
              <tr>
                <th scope="col">Tarih</th>
                <th scope="col">{seriesLabel}</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p, i) => (
                <tr key={i}>
                  <td>{p.label}</td>
                  <td>
                    {formatValue(p.value)}
                    {p.detail ? <span className="muted"> · {p.detail}</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ height }} role="img" aria-label={`${seriesLabel} grafiği, ${points.length} nokta`}>
          {kind === 'line' ? (
            <Line data={data} options={options as ChartOptions<'line'>} />
          ) : (
            <Bar data={data} options={options as ChartOptions<'bar'>} />
          )}
        </div>
      )}
    </div>
  );
}
