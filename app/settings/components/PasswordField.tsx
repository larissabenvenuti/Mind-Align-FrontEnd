"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "../../../components/ui/Input/Input";
import { Label } from "../../../components/ui/Label/Label";

import styles from "../Settings.module.scss";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  description: string;
  children?: ReactNode;
}

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  description,
  children,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.inputGroup}>
      <Label htmlFor={id}>{label}</Label>
      <div className={styles.passwordWrapper}>
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.passwordInput}
          required
        />
        <button
          type="button"
          className={styles.eyeButton}
          onClick={() => setVisible((current) => !current)}
          tabIndex={-1}
          aria-label={`${visible ? "Ocultar" : "Mostrar"} ${description}`}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {children}
    </div>
  );
}
