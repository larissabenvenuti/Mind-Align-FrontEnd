"use client";

import { motion } from "framer-motion";
import {
  Palette,
  Sun,
  Moon,
  Check,
  Monitor,
  Leaf,
  Flame,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import styles from "./theme-selector.module.scss";
import { Button } from "@/components/ui/Button/Button";

const THEMES = [
  {
    id: "default",
    label: "Vermelho/Bordô",
    styleClass: styles.colorDefault,
    icon: <Flame />,
  },
  {
    id: "theme-purple",
    label: "Roxo",
    styleClass: styles.colorPurple,
    icon: <Sparkles />,
  },
  {
    id: "theme-blue",
    label: "Azul",
    styleClass: styles.colorBlue,
    icon: <Monitor />,
  },
  {
    id: "theme-green",
    label: "Verde",
    styleClass: styles.colorGreen,
    icon: <Leaf />,
  },
  {
    id: "theme-orange",
    label: "Laranja",
    styleClass: styles.colorOrange,
    icon: <Sun />,
  },
  {
    id: "theme-pink",
    label: "Rosa",
    styleClass: styles.colorPink,
    icon: <Palette />,
  },
  {
    id: "theme-dark",
    label: "Modo Escuro",
    styleClass: styles.colorDark,
    icon: <Moon />,
  },
];

export default function ThemeSelector() {
  const { user, updateUserTheme } = useAuth();
  const activeTheme = user?.theme || "default";

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.headerIcon}>
            <Palette />
          </div>

          <div>
            <h2 className={styles.title}>Personalização</h2>
            <p className={styles.subtitle}>
              Escolha a aparência do MindAlign
            </p>
          </div>
        </div>
      </div>

      <div className={styles.list}>
        {THEMES.map(({ id, label, icon, styleClass }) => {
          const isActive = activeTheme === id;

          return (
            <Button
              key={id}
              onClick={() => updateUserTheme(id)}
              aria-pressed={isActive}
              aria-label={`Selecionar tema ${label}`}
              className={`${styles.themeButton} ${
                isActive ? styles.btnActive : ""
              }`}
            >
              <div className={styles.btnContent}>
                <div className={`${styles.circleIcon} ${styleClass}`}>
                  {icon}
                </div>

                <span className={styles.label}>{label}</span>
              </div>

              {isActive && (
                <motion.div
                  layoutId="activeThemeIndicator"
                  className={styles.checkWrapper}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                >
                  <Check size={12} strokeWidth={3} />
                </motion.div>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}