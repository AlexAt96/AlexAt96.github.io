import styles from "./ArchitectureUploadWizard.module.css";
import type { StatusTone } from "./architecture-upload.types";

export interface StatusDotProps {
  tone?: StatusTone;
  label?: string;
}

export function StatusDot({ tone = "neutral", label }: StatusDotProps) {
  return (
    <span
      className={`${styles.statusDot} ${styles[`tone-${tone}`]}`}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}

