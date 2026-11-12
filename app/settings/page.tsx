"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bell, Lock, Settings as SettingsIcon, User } from "lucide-react";
import Link from "next/link";

import NotificationSettings from "./components/NotificationSettings";
import ProfileSettings from "./components/ProfileSettings";
import SecuritySettings from "./components/SecuritySettings";
import styles from "./Settings.module.scss";

type TabType = "profile" | "security" | "notifications";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  return (
    <motion.section
      className={styles.pageContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="global-background-orbs">
        <motion.div className="global-orb-top" />
        <motion.div className="global-orb-bottom" />
      </div>

      <div className={styles.spacer} />

      <div className={styles.content}>
        <div className={styles.wrapper}>
          <header className={styles.header}>
            <Link href="/dashboard">
              <motion.div
                className={styles.backLink}
                whileHover={{ x: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArrowLeft className={styles.backIcon} />
                Voltar ao Dashboard
              </motion.div>
            </Link>

            <div className={styles.titleSection}>
              <motion.span className={styles.iconBox}>
                <SettingsIcon className={styles.mainIcon} />
              </motion.span>

              <div>
                <h1 className={styles.title}>Configurações</h1>
                <p className={styles.subtitle}>
                  Gerencie sua conta, segurança e notificações.
                </p>
              </div>
            </div>
          </header>

          <div className={styles.settingsLayout}>
            <aside className={styles.tabsSidebar}>
              <button
                className={`${styles.tabBtn} ${
                  activeTab === "profile" ? styles.tabActive : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <User className={styles.tabIcon} />
                Perfil
              </button>

              <button
                className={`${styles.tabBtn} ${
                  activeTab === "security" ? styles.tabActive : ""
                }`}
                onClick={() => setActiveTab("security")}
              >
                <Lock className={styles.tabIcon} />
                Segurança
              </button>

              <button
                className={`${styles.tabBtn} ${
                  activeTab === "notifications" ? styles.tabActive : ""
                }`}
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className={styles.tabIcon} />
                Notificações
              </button>
            </aside>

            <main className={styles.tabContent}>
              <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProfileSettings />
                  </motion.div>
                )}
                {activeTab === "security" && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SecuritySettings />
                  </motion.div>
                )}
                {activeTab === "notifications" && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <NotificationSettings />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
