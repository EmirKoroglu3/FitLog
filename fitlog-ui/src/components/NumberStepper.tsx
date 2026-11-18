import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import './NumberStepper.css';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Amount the − / + buttons change the value by. */
  step?: number;
  /** Allow decimals (e.g. 62.5 kg). */
  decimal?: boolean;
  label: string;
}

const fmt = (n: number) => String(Math.round(n * 100) / 100);

/**
 * − [value] + control. The number can also be typed: tapping selects it so the new value
 * replaces the old one, the box may be empty while typing, and it is clamped on blur.
 */
export function NumberStepper({ value, onChange, min = 0, max = 9999, step = 1, decimal = false, label }: Props) {
  const [text, setText] = useState(fmt(value));

  // Follow outside changes (buttons, reset) unless the user is mid-typing the same number
  useEffect(() => {
    setText((t) => (Number(t.replace(',', '.')) === value ? t : fmt(value)));
  }, [value]);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const commit = (raw: string) => {
    const n = Number(raw.replace(',', '.'));
    const next = raw.trim() === '' || Number.isNaN(n) ? min : clamp(decimal ? n : Math.round(n));
    setText(fmt(next));
    onChange(next);
  };
  const bump = (delta: number) => {
    const next = clamp(Math.round((value + delta) * 100) / 100);
    setText(fmt(next));
    onChange(next);
  };

  return (
    <div className="number-stepper">
      <button type="button" onClick={() => bump(-step)} disabled={value <= min} aria-label={`${label} azalt`}>
        <Minus size={16} aria-hidden="true" />
      </button>
      <input
        type="text"
        inputMode={decimal ? 'decimal' : 'numeric'}
        value={text}
        onChange={(e) => {
          const raw = e.target.value.replace(decimal ? /[^0-9.,]/g : /[^0-9]/g, '');
          setText(raw);
          const n = Number(raw.replace(',', '.'));
          if (raw !== '' && !Number.isNaN(n)) onChange(clamp(decimal ? n : Math.round(n)));
        }}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') { e.preventDefault(); bump(step); }
          if (e.key === 'ArrowDown') { e.preventDefault(); bump(-step); }
        }}
        aria-label={label}
      />
      <button type="button" onClick={() => bump(step)} disabled={value >= max} aria-label={`${label} artır`}>
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export default NumberStepper;
