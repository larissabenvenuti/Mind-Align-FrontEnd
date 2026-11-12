"use client";

import { Label } from "../../../components/ui/Label/Label";

import styles from "../Settings.module.scss";

interface NotificationToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function NotificationToggle({
  label,
  checked,
  onChange,
}: NotificationToggleProps) {
  return (
    <div className={styles.toggleGroup}>
      <Label className={styles.toggleLabel}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={styles.checkbox}
        />
        <span>{label}</span>
      </Label>
    </div>
  );
}
