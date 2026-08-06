"use client";

import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "./shared.module.css";

export function toneFor(value: string) {
  const lower = value.toLowerCase();
  if (/complete|approved|accepted|confirmed|passing|ready|working|reviewed|true|good|covered|saved|final/.test(lower)) return "good";
  if (/missing|blocked|issue|risk|changes|high|failed|rejected|gap|invalid/.test(lower)) return "risk";
  return "watch";
}

export function Badge({ children, tone }: { children: ReactNode; tone?: "good" | "watch" | "risk" | "neutral" }) {
  const resolvedTone = tone ?? toneFor(String(children));
  return <span className={`${styles.badge} ${styles[resolvedTone]}`}>{children}</span>;
}

export function Metric({ label, value, detail, tone }: { label: string; value: string | number; detail?: string; tone?: string }) {
  return <article className={styles.metric} data-tone={tone ?? "neutral"}>
    <span aria-hidden="true" />
    <small>{label}</small>
    <strong>{value}</strong>
    {detail && <p>{detail}</p>}
  </article>;
}

export function Panel({ title, eyebrow, action, children, className }: { title: string; eyebrow?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`${styles.panel} ${className ?? ""}`}>
    <header>
      <div>{eyebrow && <small>{eyebrow}</small>}<strong>{title}</strong></div>
      {action}
    </header>
    <div className={styles.panelBody}>{children}</div>
  </section>;
}

export function EmptyState({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return <div className={styles.emptyState} role="status">
    <i aria-hidden="true">◇</i>
    <strong>{title}</strong>
    <p>{copy}</p>
    {action}
  </div>;
}

export function InlineNotice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "success" | "warning" | "danger" }) {
  return <div className={styles.notice} data-tone={tone} role={tone === "danger" ? "alert" : "status"}>
    <i aria-hidden="true">{tone === "success" ? "✓" : tone === "danger" ? "!" : tone === "warning" ? "△" : "i"}</i>
    <span>{children}</span>
  </div>;
}

export function Segmented<T extends string>({ value, options, onChange, label, disabled }: { value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void; label: string; disabled?: boolean }) {
  return <div className={styles.segmented} role="group" aria-label={label}>
    {options.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value} disabled={disabled} onClick={() => onChange(option.value)}>{option.label}</button>)}
  </div>;
}

export function ActionButton({ variant = "secondary", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  return <button {...props} className={`${styles.action} ${styles[variant]} ${className ?? ""}`} />;
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return <div className={styles.progress} aria-label={`${label}: ${safeValue}%`}>
    <div><span>{label}</span><strong>{safeValue}%</strong></div>
    <i><b style={{ "--progress": `${safeValue}%` } as CSSProperties} /></i>
  </div>;
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadText(filename: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AccessibleModal({
  title,
  description,
  eyebrow,
  onClose,
  children,
  footer,
  className,
  bodyClassName,
  initialFocusSelector,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  initialFocusSelector?: string;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = initialFocusSelector
      ? dialog?.querySelector<HTMLElement>(initialFocusSelector)
      : dialog?.querySelector<HTMLElement>("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex='-1'])");
    focusable?.focus();

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex='-1'])"));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = previousOverflow;
      previousFocus.current?.focus();
    };
  }, [initialFocusSelector]);

  return <div className={styles.modalBackdrop} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div ref={dialogRef} className={`${styles.modal} ${className ?? ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}>
      <header><div>{eyebrow && <small className={styles.modalEyebrow}>{eyebrow}</small>}<h3 id={titleId}>{title}</h3>{description && <p id={descriptionId}>{description}</p>}</div><button type="button" aria-label="Close dialog" onClick={onClose}>×</button></header>
      <div className={`${styles.modalBody} ${bodyClassName ?? ""}`}>{children}</div>
      {footer && <footer>{footer}</footer>}
    </div>
  </div>;
}
