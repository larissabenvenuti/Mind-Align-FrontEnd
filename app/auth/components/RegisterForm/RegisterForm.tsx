"use client";

import { useState } from "react";
import { toast } from "../../../../lib/toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Check,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Label } from "@/components/ui/Label/Label";
import { useAuth } from "@/hooks/useAuth";
import { PasswordRequirement } from "../PasswordRequirement/PasswordRequirement";
import { getPasswordRequirements } from "../../../../lib/passwordPolicy";
import styles from "./register-form.module.scss";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const {
    register,
    setAuthData,
    loading,
  } = useAuth();

  const requirements = getPasswordRequirements(password);

  const pendingRequirements =
    requirements.filter(
      (requirement) => !requirement.met,
    );

  const allRequirementsMet =
    pendingRequirements.length === 0 &&
    password.length > 0;

  const passwordsMatch =
    password === confirmPassword &&
    confirmPassword.length > 0;

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(
        "Informe seu nome completo.",
      );
      return;
    }

    if (!email.trim()) {
      toast.error(
        "Informe seu e-mail.",
      );
      return;
    }

    if (!passwordsMatch) {
      toast.error(
        "As senhas não coincidem!",
      );
      return;
    }

    if (!allRequirementsMet) {
      toast.error(
        "A senha não atende aos requisitos mínimos!",
      );
      return;
    }

    try {
      const data = await register(
        name.trim(),
        email.trim().toLowerCase(),
        password,
      );

      setAuthData(
        data.user,
        data.token,
      );

      toast.success(
        "Conta criada! Bem-vindo ao MindAlign.",
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao cadastrar. Tente novamente.",
      );
    }
  };

  const strengthPercent = Math.round(
    (requirements.filter(
      (requirement) => requirement.met,
    ).length /
      requirements.length) *
      100,
  );

  return (
    <motion.form
      onSubmit={handleSubmit}
      autoComplete="off"
      className={styles.form}
      initial={{
        opacity: 0,
        x: 16,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        x: -16,
      }}
      transition={{
        duration: 0.28,
      }}
    >
      <div className={styles.inputGroup}>
        <Label htmlFor="register-name">
          Nome completo
        </Label>

        <Input
          type="text"
          id="register-name"
          placeholder="Seu nome completo"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          required
          autoComplete="name"
        />
      </div>

      <div className={styles.inputGroup}>
        <Label htmlFor="register-email">
          E-mail
        </Label>

        <Input
          type="email"
          id="register-email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
          autoComplete="email"
        />
      </div>

      <div className={styles.inputGroup}>
        <Label htmlFor="register-password">
          Senha
        </Label>

        <div className={styles.passwordWrapper}>
          <Input
            type={
              showPassword
                ? "text"
                : "password"
            }
            id="register-password"
            placeholder="Crie uma senha forte"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            autoComplete="new-password"
            className={styles.passwordInput}
          />

          <button
            type="button"
            className={styles.eyeButton}
            onClick={() =>
              setShowPassword(
                (value) => !value,
              )
            }
            tabIndex={-1}
            aria-label={
              showPassword
                ? "Ocultar senha"
                : "Mostrar senha"
            }
          >
            {showPassword ? (
              <EyeOff size={15} />
            ) : (
              <Eye size={15} />
            )}
          </button>
        </div>

        <AnimatePresence>
          {password && (
            <motion.div
              className={styles.strengthBar}
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
            >
              <div
                className={
                  styles.strengthTrack
                }
              >
                <motion.div
                  className={
                    styles.strengthFill
                  }
                  animate={{
                    width: `${strengthPercent}%`,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  data-strength={
                    strengthPercent <= 40
                      ? "weak"
                      : strengthPercent <= 79
                        ? "medium"
                        : "strong"
                  }
                />
              </div>

              <span
                className={
                  styles.strengthLabel
                }
              >
                {strengthPercent <= 40
                  ? "Fraca"
                  : strengthPercent <= 79
                    ? "Média"
                    : "Forte"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.inputGroup}>
        <Label htmlFor="register-confirm">
          Confirmar senha
        </Label>

        <div className={styles.passwordWrapper}>
          <Input
            type={
              showConfirm
                ? "text"
                : "password"
            }
            id="register-confirm"
            placeholder="Repita a senha"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value,
              )
            }
            required
            autoComplete="new-password"
            className={styles.passwordInput}
          />

          <button
            type="button"
            className={styles.eyeButton}
            onClick={() =>
              setShowConfirm(
                (value) => !value,
              )
            }
            tabIndex={-1}
            aria-label={
              showConfirm
                ? "Ocultar senha"
                : "Mostrar senha"
            }
          >
            {showConfirm ? (
              <EyeOff size={15} />
            ) : (
              <Eye size={15} />
            )}
          </button>
        </div>

        {confirmPassword && (
          <p
            className={
              passwordsMatch
                ? styles.matchSuccess
                : styles.matchError
            }
          >
            {passwordsMatch
              ? "✓ As senhas coincidem"
              : "✗ As senhas não coincidem"}
          </p>
        )}
      </div>

      <AnimatePresence>
        {password &&
          !allRequirementsMet && (
            <motion.div
              className={styles.reqBox}
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              layout
            >
              <p
                className={
                  styles.reqTitle
                }
              >
                Faltam:
              </p>

              <div
                className={styles.reqList}
              >
                {pendingRequirements.map(
                  (requirement) => (
                    <PasswordRequirement
                      key={requirement.key}
                      met={false}
                      text={
                        requirement.text
                      }
                    />
                  ),
                )}
              </div>
            </motion.div>
          )}

        {allRequirementsMet && (
          <motion.div
            className={styles.reqBoxMet}
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
            }}
          >
            <Check size={14} />

            <span>
              Senha forte! Todos os
              requisitos atendidos.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        disabled={loading}
        className={styles.submitButton}
      >
        {loading ? (
          <span
            className={styles.loadingDots}
          >
            <span />
            <span />
            <span />
          </span>
        ) : (
          <>
            <UserPlus size={15} />
            Criar conta
          </>
        )}
      </Button>
    </motion.form>
  );
}