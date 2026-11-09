"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  Calendar,
  BookOpen,
  Target,
  ListTodo,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import ThemeSidebarSelector from "../../components/layout/ThemeSelector/ThemeSelector";
import RecentActivitySection from "./components/RecentActivitySection";
import styles from "./Dashboard.module.scss";
import { Button } from "@/components/ui/Button/Button";

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <motion.section
      className={styles.pageContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="global-background-orbs">
        <motion.div
          className="global-orb-top"
          animate={{ y: [-20, 20] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="global-orb-bottom"
          animate={{ y: [-20, 20] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      </div>

      <div className={styles.spacer} />

      <div className={styles.layoutWrapper}>
        <AnimatePresence>
          {!sidebarOpen && (
            <Button
              onClick={() => setSidebarOpen(true)}
              className={styles.openSidebarBtn}
              aria-label="Abrir personalização"
            >
              <ChevronRight className={styles.iconSm} />
            </Button>
          )}
        </AnimatePresence>

        <motion.aside
          className={`${styles.sidebar} ${
            sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
          }`}
          initial={false}
          animate={{
            x: sidebarOpen ? 0 : "-100%",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          <Button
            onClick={() => setSidebarOpen(false)}
            className={styles.closeSidebarBtn}
            aria-label="Fechar menu"
          >
            <ChevronLeft className={styles.iconSm} />
          </Button>

          <div className={styles.sidebarContent}>
            <ThemeSidebarSelector />
          </div>
        </motion.aside>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <motion.main
          className={`${styles.mainContent} ${
            sidebarOpen ? styles.mainContentShifted : ""
          }`}
        >
          <div className={styles.contentContainer}>
            <header className={styles.header}>
              <div className={styles.titleGroup}>
                <motion.h1
                  className={styles.title}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  Olá, {user?.name || "Usuário"}
                </motion.h1>

                <motion.span
                  className={styles.waveEmoji}
                  animate={{
                    rotate: [0, 14, -8, 14, -4, 10, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeInOut",
                  }}
                >
                  👋
                </motion.span>
              </div>

              <motion.p
                className={styles.subtitle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Que bom ter você no MindAlign. Utilize os atalhos abaixo para
                acessar seus módulos.
              </motion.p>
            </header>

            <motion.div
              variants={containerVariants}
              className={styles.shortcutsGrid}
              initial="hidden"
              animate="visible"
            >
              <Link
                href="/calendar"
                className={`${styles.shortcutLink} ${styles.calendarLink}`}
                passHref
              >
                <motion.article
                  variants={itemVariants}
                  className={`${styles.shortcutCard} ${styles.cardCalendar}`}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={styles.cardBgIcon}>
                    <Calendar className={styles.iconHuge} />
                  </div>

                  <div className={styles.cardIconBox}>
                    <Calendar className={styles.iconMd} />
                  </div>

                  <h3 className={styles.cardTitle}>Calendário</h3>

                  <p className={styles.cardDesc}>
                    Gerencie seus eventos e agenda.
                  </p>
                  <span className={styles.cardAction}>
                    Acessar calendário
                    <ChevronRight aria-hidden="true" />
                  </span>
                </motion.article>
              </Link>

              <Link href="/notes" className={styles.shortcutLink} passHref>
                <motion.article
                  variants={itemVariants}
                  className={`${styles.shortcutCard} ${styles.cardNotes}`}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={styles.cardBgIcon}>
                    <BookOpen className={styles.iconHuge} />
                  </div>

                  <div className={styles.cardIconBox}>
                    <BookOpen className={styles.iconMd} />
                  </div>

                  <h3 className={styles.cardTitle}>Anotações</h3>

                  <p className={styles.cardDesc}>
                    Guarde suas ideias e textos.
                  </p>
                  <span className={styles.cardAction}>
                    Abrir anotações
                    <ChevronRight aria-hidden="true" />
                  </span>
                </motion.article>
              </Link>

              <Link href="/habits" className={styles.shortcutLink} passHref>
                <motion.article
                  variants={itemVariants}
                  className={`${styles.shortcutCard} ${styles.cardHabits}`}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={styles.cardBgIcon}>
                    <Target className={styles.iconHuge} />
                  </div>

                  <div className={styles.cardIconBox}>
                    <Target className={styles.iconMd} />
                  </div>

                  <h3 className={styles.cardTitle}>Hábitos</h3>

                  <p className={styles.cardDesc}>
                    Monitore sua rotina diária.
                  </p>
                  <span className={styles.cardAction}>
                    Ver hábitos
                    <ChevronRight aria-hidden="true" />
                  </span>
                </motion.article>
              </Link>

              <Link href="/tasks" className={styles.shortcutLink} passHref>
                <motion.article
                  variants={itemVariants}
                  className={`${styles.shortcutCard} ${styles.cardTasks}`}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={styles.cardBgIcon}>
                    <ListTodo className={styles.iconHuge} />
                  </div>

                  <div className={styles.cardIconBox}>
                    <ListTodo className={styles.iconMd} />
                  </div>

                  <h3 className={styles.cardTitle}>Tarefas</h3>

                  <p className={styles.cardDesc}>
                    Liste seus afazeres e pendências.
                  </p>
                  <span className={styles.cardAction}>
                    Ver tarefas
                    <ChevronRight aria-hidden="true" />
                  </span>
                </motion.article>
              </Link>
            </motion.div>

            <motion.div
              className={styles.activitySectionWrapper}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.4,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              <RecentActivitySection />
            </motion.div>
          </div>
        </motion.main>
      </div>
    </motion.section>
  );
}