"use client";

import { useState } from "react";

import { api } from "../../../lib/api";
import { toast } from "../../../lib/toast";
import { Button } from "../../../components/ui/Button/Button";
import { PasswordRequirement } from "../../auth/components/PasswordRequirement/PasswordRequirement";
import PasswordField from "./PasswordField";

import styles from "../Settings.module.scss";

export default function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword.length > 0;
  const passwordRequirements = [
    {
      key: "length",
      text: "Mínimo de 8 caracteres",
      met: newPassword.length >= 8,
    },
    {
      key: "uppercase",
      text: "Uma letra maiúscula",
      met: /[A-Z]/.test(newPassword),
    },
    {
      key: "lowercase",
      text: "Uma letra minúscula",
      met: /[a-z]/.test(newPassword),
    },
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

      <PasswordField
        id="currentPassword"
        label="Senha Atual"
        description="senha atual"
        value={currentPassword}
        onChange={setCurrentPassword}
      />

      <PasswordField
        id="newPassword"
        label="Nova Senha"
        description="nova senha"
        value={newPassword}
        onChange={setNewPassword}
      >
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
      </PasswordField>

      <PasswordField
        id="confirmPassword"
        label="Confirmar Nova Senha"
        description="confirmação de senha"
        value={confirmPassword}
        onChange={setConfirmPassword}
      >
        {confirmPassword && (
          <p className={passwordsMatch ? styles.matchSuccess : styles.matchError}>
            {passwordsMatch
              ? "✓ As senhas coincidem"
              : "✗ As senhas não coincidem"}
          </p>
        )}
      </PasswordField>

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
