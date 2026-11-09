"use client";

import { Check, X } from "lucide-react";
import styles from "./password-requirement.module.scss";

interface PasswordRequirementProps {
  met: boolean;
  text: string;
}

export function PasswordRequirement({ met, text }: PasswordRequirementProps) {
  return (
    <div className={styles.requirementRow}>
      {met ? (
        <Check className={styles.iconSuccess} />
      ) : (
        <X className={styles.iconError} />
      )}
      <span className={met ? styles.textSuccess : styles.textError}>
        {text}
      </span>
    </div>
  );
}
