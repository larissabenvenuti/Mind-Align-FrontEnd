"use client";

import { Bell, BellOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../Button/Button";
import { useNotifications } from "../../../hooks/useNotifications";
import styles from "./notification-button.module.scss";

export function NotificationButton() {
  const { isSubscribed, isProcessing, toggleNotifications } =
    useNotifications();

  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }

  return (
    <Button
      variant={isSubscribed ? "outline" : "default"}
      size="sm"
      onClick={toggleNotifications} 
      disabled={isProcessing}
      title={isSubscribed ? "Desativar notificações" : "Ativar notificações"}
      className={isSubscribed ? styles.granted : styles.default}
    >
      <AnimatePresence mode="wait">
        {isSubscribed ? (
          <motion.div
            key="granted"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className={styles.content}
          >
            <Bell className={styles.iconActive} />
            <span className={styles.text}>Ativado</span>
          </motion.div>
        ) : (
          <motion.div
            key="denied"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className={styles.content}
          >
            <BellOff className={styles.icon} />
            <span className={styles.text}>Notificações</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
