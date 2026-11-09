"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "./components/LoginForm/LoginForm";
import { RegisterForm } from "./components/RegisterForm/RegisterForm";
import { GoogleAuthSection } from "./components/GoogleAuthSection/GoogleAuthSection";
import styles from "./Auth.module.scss";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  const { booted, user } = useAuth();

  useEffect(() => {
    document.documentElement.classList.remove(
      "theme-pink",
      "theme-green",
      "theme-sun",
      "theme-dark",
      "theme-purple",
      "theme-red",
      "theme-blue",
      "theme-orange",
    );
  }, []);

  useEffect(() => {
    if (booted && user) {
      router.push("/dashboard");
    }
  }, [booted, user, router]);

  if (!booted) {
    return null;
  }

  return (
    <main className={styles.mainContainer}>
      <div className={styles.gridOverlay} />

      <motion.div
        className={styles.authCard}
        initial={{
          opacity: 0,
          scale: 0.96,
          filter: "blur(12px)",
        }}
        animate={{
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
        }}
        transition={{
          duration: 0.55,
          type: "spring",
          bounce: 0.25,
        }}
      >
        <div className={styles.bannerSection}>
          <div className={styles.bannerNoise} />

          <div className={styles.brandMark}>
            <span className={styles.brandLogo}>M</span>
            <span className={styles.brandName}>
              MindAlign
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={
                isLogin
                  ? "login-banner"
                  : "register-banner"
              }
              className={styles.bannerContent}
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -24,
              }}
              transition={{
                duration: 0.32,
              }}
            >
              <div className={styles.bannerBadge}>
                {isLogin
                  ? "✦ Bem-vindo de volta"
                  : "✦ Novo por aqui"}
              </div>

              <h2 className={styles.bannerTitle}>
                {isLogin ? (
                  <>
                    Sincronize
                    <br />
                    <span
                      className={
                        styles.bannerTitleAccent
                      }
                    >
                      sua mente.
                    </span>
                  </>
                ) : (
                  <>
                    Inicie sua
                    <br />
                    <span
                      className={
                        styles.bannerTitleAccent
                      }
                    >
                      jornada.
                    </span>
                  </>
                )}
              </h2>

              <p className={styles.bannerSubtitle}>
                {isLogin
                  ? "Ainda não tem acesso? Crie sua conta e comece a organizar sua vida."
                  : "Já possui credenciais? Faça login e retome de onde parou."}
              </p>

              <button
                onClick={() =>
                  setIsLogin((value) => !value)
                }
                className={styles.switchButton}
              >
                {isLogin
                  ? "Criar conta →"
                  : "← Fazer login"}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formWrapper}>
            <motion.div
              key={
                isLogin
                  ? "login-header"
                  : "register-header"
              }
              initial={{
                opacity: 0,
                x: -12,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.28,
              }}
              className={styles.formHeader}
            >
              <h2 className={styles.formTitle}>
                {isLogin
                  ? "Acesso ao Sistema"
                  : "Novo Registro"}
              </h2>

              <p className={styles.formSubtitle}>
                {isLogin
                  ? "Entre com suas credenciais para continuar"
                  : "Preencha os dados para criar sua conta"}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {isLogin ? (
                <LoginForm key="login-form" />
              ) : (
                <RegisterForm key="register-form" />
              )}
            </AnimatePresence>

            <GoogleAuthSection
              isLogin={isLogin}
            />

            <p className={styles.formFooter}>
              {isLogin
                ? "Não tem conta? "
                : "Já tem conta? "}

              <button
                className={styles.formFooterLink}
                onClick={() =>
                  setIsLogin((value) => !value)
                }
              >
                {isLogin ? "Cadastre-se" : "Entrar"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}