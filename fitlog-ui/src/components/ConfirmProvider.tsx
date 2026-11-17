import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import './ConfirmProvider.css';

export interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** Red confirm button for destructive actions. */
  danger?: boolean;
  /** Optional checkbox, e.g. "also delete history". */
  checkbox?: { label: string; defaultChecked?: boolean };
}

export interface ConfirmResult {
  ok: boolean;
  checked: boolean;
}

type ToastKind = 'success' | 'error' | 'info';

interface Ctx {
  /** Resolves true when the user confirms. */
  confirm: (o: ConfirmOptions) => Promise<boolean>;
  /** Like confirm, but also returns the checkbox state. */
  ask: (o: ConfirmOptions) => Promise<ConfirmResult>;
  /** Small message in the corner (replaces alert()). */
  toast: (message: string, kind?: ToastKind) => void;
}

const ConfirmContext = createContext<Ctx | undefined>(undefined);

interface Pending extends ConfirmOptions {
  resolve: (r: ConfirmResult) => void;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [checked, setChecked] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string; kind: ToastKind }[]>([]);
  const confirmBtn = useRef<HTMLButtonElement>(null);
  const cancelBtn = useRef<HTMLButtonElement>(null);

  const ask = useCallback(
    (o: ConfirmOptions) =>
      new Promise<ConfirmResult>((resolve) => {
        setChecked(!!o.checkbox?.defaultChecked);
        setPending({ ...o, resolve });
      }),
    [],
  );
  const confirm = useCallback((o: ConfirmOptions) => ask(o).then((r) => r.ok), [ask]);

  const toast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const close = (ok: boolean) => {
    pending?.resolve({ ok, checked });
    setPending(null);
  };

  // Keyboard: Esc cancels; focus the safe button for destructive actions
  useEffect(() => {
    if (!pending) return;
    (pending.danger ? cancelBtn : confirmBtn).current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pending, checked]);

  return (
    <ConfirmContext.Provider value={{ confirm, ask, toast }}>
      {children}

      {pending && (
        <div className="confirm-overlay" onClick={() => close(false)}>
          <div
            className="confirm-card"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby={pending.message ? 'confirm-message' : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`confirm-icon ${pending.danger ? 'danger' : ''}`} aria-hidden="true">
              {pending.danger ? <AlertTriangle size={22} /> : <Info size={22} />}
            </div>
            <h2 id="confirm-title">{pending.title}</h2>
            {pending.message && (
              <div id="confirm-message" className="confirm-message">
                {pending.message}
              </div>
            )}
            {pending.checkbox && (
              <label className="confirm-check">
                <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                <span>{pending.checkbox.label}</span>
              </label>
            )}
            <div className="confirm-actions">
              <button ref={cancelBtn} type="button" className="btn-secondary" onClick={() => close(false)}>
                {pending.cancelText ?? 'Vazgeç'}
              </button>
              <button
                ref={confirmBtn}
                type="button"
                className={pending.danger ? 'btn-danger' : 'btn-primary'}
                onClick={() => close(true)}
              >
                {pending.confirmText ?? 'Tamam'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            {t.kind === 'success' ? <CheckCircle2 size={18} /> : t.kind === 'error' ? <XCircle size={18} /> : <Info size={18} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx;
}
