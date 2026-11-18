import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { searchExercises } from '../data/exerciseDatabase';
import './ExerciseNameInput.css';

interface Props {
  value: string;
  onChange: (name: string) => void;
  /** Enter with no suggestion highlighted (e.g. save the row). */
  onSubmit?: () => void;
  className?: string;
  autoFocus?: boolean;
}

const MAX_LIST_HEIGHT = 280;

/**
 * Text input with exercise-library suggestions. The list is rendered in a portal with fixed
 * positioning, so scroll containers (like the phone table wrapper) can't clip it, and it opens
 * upward when there isn't room below.
 */
export function ExerciseNameInput({ value, onChange, onSubmit, className, autoFocus }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [style, setStyle] = useState<CSSProperties>({});

  const suggestions = value.trim().length >= 2 ? searchExercises(value).filter((s) => s.name !== value).slice(0, 6) : [];
  const visible = open && suggestions.length > 0;

  const place = () => {
    const input = inputRef.current;
    if (!input) return;
    const r = input.getBoundingClientRect();
    const width = Math.min(Math.max(r.width, 240), window.innerWidth - 16);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;
    const wanted = Math.min(MAX_LIST_HEIGHT, suggestions.length * 54 + 10);
    const up = below < wanted && above > below;
    setStyle(
      up
        ? { left, width, bottom: window.innerHeight - r.top + 4, maxHeight: Math.min(MAX_LIST_HEIGHT, above) }
        : { left, width, top: r.bottom + 4, maxHeight: Math.min(MAX_LIST_HEIGHT, Math.max(below, 120)) },
    );
  };

  useLayoutEffect(() => {
    if (visible) place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, value, suggestions.length]);

  // Follow the input while the page or any scroll container moves
  useEffect(() => {
    if (!visible) return;
    const update = () => place();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const pick = (name: string) => {
    onChange(name);
    setOpen(false);
    setActive(-1);
    inputRef.current?.focus();
  };

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        className={className}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && suggestions.length) {
            e.preventDefault();
            setOpen(true);
            setActive((i) => (i + 1) % suggestions.length);
          } else if (e.key === 'ArrowUp' && suggestions.length) {
            e.preventDefault();
            setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            if (visible && active >= 0) pick(suggestions[active].name);
            else onSubmit?.();
          } else if (e.key === 'Escape' && visible) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
        placeholder="Egzersiz ara veya yaz"
        aria-label="Egzersiz adı"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={visible}
        aria-controls={listId}
        aria-activedescendant={visible && active >= 0 ? `${listId}-${active}` : undefined}
        autoFocus={autoFocus}
      />
      {visible &&
        createPortal(
          <ul id={listId} className="exercise-suggestions" role="listbox" style={style}>
            {suggestions.map((s, i) => (
              <li key={s.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className={i === active ? 'active' : ''}
                  onMouseDown={(ev) => ev.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(s.name)}
                >
                  <strong>{s.name}</strong>
                  <small>{s.muscleGroup}</small>
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  );
}

export default ExerciseNameInput;
