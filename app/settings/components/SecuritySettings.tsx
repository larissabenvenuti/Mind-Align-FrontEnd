"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { api } from "../../../lib/api";
import { toast } from "../../../lib/toast";
import { Button } from "../../../components/ui/Button/Button";
import { Input } from "../../../components/ui/Input/Input";
import { Label } from "../../../components/ui/Label/Label";
import { PasswordRequirement } from "../../auth/components/PasswordRequirement/PasswordRequirement";

import styles from "../Settings.module.scss";

export default function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword.length > 0;
  const passwordRequirements = [
    { key: "length", text: "Mínimo de 8 caracteres", met: newPassword.length >= 8 },
    { key: "uppercase", text: "Uma letra maiúscula", met: /[A-Z]/.test(newPassword) },
    { key: "lowercase", text: "Uma letra minúscula", met: /[a-z]/.test(newPassword) },
    { key: "number", text: "Um número", met: /\d/.test(newPassword) },
    {
      key: "special",
      text: "Um caractere especial (!@#$%...)",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    },
  ];

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("As senhas novas não coincidem.");
      return;
    }

    if (passwordRequirements.some((requirement) => !requirement.met)) {
      toast.error("A nova senha não atende a todos os requisitos.");
      return;
    }

    setLoading(true);

    try {
      await api.put("/api/user/password", {
        currentPassword,
        newPassword,
      });

      toast.success("Senha atualizada com sucesso!");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao atualizar senha",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleUpdatePassword}
      className={styles.formCard}
    >
      <h2 className={styles.cardTitle}>Alterar Senha</h2>

      <div className={styles.securityHint}>
        Crie uma senha forte que atenda aos requisitos abaixo.
      </div>

      <div className={styles.inputGroup}>
        <Label htmlFor="currentPassword">Senha Atual</Label>
        <div className={styles.passwordWrapper}>
          <Input
            id="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={styles.passwordInput}
            required
          />
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowCurrentPassword((value) => !value)}
            tabIndex={-1}
            aria-label={
              showCurrentPassword ? "Ocultar senha atual" : "Mostrar senha atual"
            }
          >
            {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <Label htmlFor="newPassword">Nova Senha</Label>
        <div className={styles.passwordWrapper}>
          <Input
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={styles.passwordInput}
            required
          />
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowNewPassword((value) => !value)}
            tabIndex={-1}
            aria-label={
              showNewPassword ? "Ocultar nova senha" : "Mostrar nova senha"
            }
          >
            {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {newPassword && (
          <div className={styles.passwordRequirements}>
            <p className={styles.passwordRequirementsTitle}>
              A senha precisa conter:
            </p>
            {passwordRequirements.map((requirement) => (
              <PasswordRequirement
                key={requirement.key}
                met={requirement.met}
                text={requirement.text}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.inputGroup}>
        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
        <div className={styles.passwordWrapper}>
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.passwordInput}
            required
          />
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowConfirmPassword((value) => !value)}
            tabIndex={-1}
            aria-label={
              showConfirmPassword
                ? "Ocultar confirmação de senha"
                : "Mostrar confirmação de senha"
            }
          >
            {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {confirmPassword && (
          <p className={passwordsMatch ? styles.matchSuccess : styles.matchError}>
            {passwordsMatch
              ? "✓ As senhas coincidem"
              : "✗ As senhas não coincidem"}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className={styles.submitBtn}
      >
        {loading ? "Atualizando..." : "Atualizar Senha"}
      </Button>
    </form>
  );
}
