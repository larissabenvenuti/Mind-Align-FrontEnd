"use client";

import { toast } from "../../../../lib/toast";
import { GoogleButton } from "@/components/ui/GoogleButton/GoogleButton";
import { useAuth } from "@/hooks/useAuth";
import styles from "./google-auth-section.module.scss";

interface GoogleAuthSectionProps {
  isLogin: boolean;
}

export function GoogleAuthSection({
  isLogin,
}: GoogleAuthSectionProps) {
  const { loginWithGoogle } = useAuth();

  const handleGoogleSuccess = async (
    token: string,
  ) => {
    try {
      await loginWithGoogle(token);

      toast.success(
        isLogin
          ? "Login Google realizado!"
          : "Conta criada com Google!",
      );
    } catch (err: any) {
      toast.error(
        err.message ||
          "Erro ao autenticar com Google.",
      );
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.divider}>
        <div
          className={
            styles.dividerLineWrapper
          }
        >
          <span
            className={styles.dividerLine}
          />
        </div>

        <div
          className={
            styles.dividerTextWrapper
          }
        >
          <span
            className={styles.dividerText}
          >
            Ou continue com
          </span>
        </div>
      </div>

      <GoogleButton
        onSuccess={handleGoogleSuccess}
      />
    </div>
  );
}