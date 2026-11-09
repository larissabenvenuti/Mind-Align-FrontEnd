"use client";

import { useState } from "react";
import { toast } from "../../../../lib/toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Label } from "@/components/ui/Label/Label";
import { useAuth } from "@/hooks/useAuth";
import styles from "./login-form.module.scss";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const { login, loading } = useAuth();

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }

    try {
      await login(
        email.trim().toLowerCase(),
        password,
      );

      toast.success(
        "Login realizado! Bem-vindo de volta ao MindAlign.",
      );
    } catch (err: any) {
      toast.error(
        err.message ||
          "E-mail ou senha incorretos.",
      );
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      autoComplete="off"
      className={styles.form}
      initial={{
        opacity: 0,
        x: -16,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        x: 16,
      }}
      transition={{
        duration: 0.28,
      }}
    >
      <div className={styles.inputGroup}>
        <Label htmlFor="login-email">
          E-mail
        </Label>

        <Input
          type="email"
          id="login-email"
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
        <div className={styles.labelRow}>
          <Label htmlFor="login-password">
            Senha
          </Label>

          <span className={styles.forgotLink}>
            Esqueceu a senha?
          </span>
        </div>

        <div className={styles.passwordWrapper}>
          <Input
            type={
              showPassword
                ? "text"
                : "password"
            }
            id="login-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            autoComplete="current-password"
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
      </div>

      <Button
        type="submit"
        disabled={loading}
        className={styles.submitButton}
      >
        {loading ? (
          <span className={styles.loadingDots}>
            <span />
            <span />
            <span />
          </span>
        ) : (
          <>
            <LogIn size={15} />
            Entrar
          </>
        )}
      </Button>
    </motion.form>
  );
}