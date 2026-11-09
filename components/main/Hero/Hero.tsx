"use client";

import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Rocket,
  CheckCircle2,
  Calendar,
  ListTodo,
  Activity,
} from "lucide-react";
import Link from "next/link";
import styles from "./Hero.module.scss";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 24,
    },
  },
};

export const Hero = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.glowOrb} />

      <div className={styles.container}>
        <div className={styles.grid}>
          <motion.div
            className={styles.contentLeft}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className={styles.badge}>
              <Rocket className={styles.badgeIcon} />
              <span className={styles.badgeText}>
                Sua plataforma de organização
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className={styles.title}>
              Organize sua vida com
              <span className={styles.gradientText}>MindAlign</span>
            </motion.h1>

            <motion.p variants={itemVariants} className={styles.description}>
              Um espaço visual para organizar tarefas, hábitos, eventos e
              ideias em um só lugar, com foco no que realmente importa.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className={styles.buttonGroup}
            >
              <Link href="/auth" className={styles.primaryButton}>
                <span>Começar agora</span>
                <ArrowRight className={styles.arrowIcon} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.contentRight}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              type: "spring",
              bounce: 0.2,
              delay: 0.25,
            }}
          >
            <div className={styles.bentoMockup}>
              <div className={styles.mockHeader}>
                <div>
                  <span className={styles.mockEyebrow}>Seu espaço</span>
                  <h3 className={styles.mockTitle}>Meu Workspace</h3>
                  <span className={styles.mockDate}>
                    Quarta-feira, 25 de fevereiro
                  </span>
                </div>

                <div className={styles.dots} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className={styles.mockProgress}>
                <div className={styles.progressInfo}>
                  <CheckCircle2 className={styles.progressIcon} />
                  <span>Progresso do dia</span>
                </div>

                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: "75%" }}
                  />
                </div>

                <span className={styles.progressText}>75%</span>
              </div>

              <div className={styles.mockGrid}>
                <div className={styles.mockCard}>
                  <div className={styles.cardIconWrapper}>
                    <Calendar className={styles.cardIconPink} />
                  </div>

                  <div>
                    <h4>Reunião Sync</h4>
                    <p>14:00 - 15:00</p>
                  </div>
                </div>

                <div className={styles.mockCard}>
                  <div className={styles.cardIconWrapper}>
                    <ListTodo className={styles.cardIconPurple} />
                  </div>

                  <div>
                    <h4>Refatorar UI</h4>
                    <p>Prioridade alta</p>
                  </div>
                </div>
              </div>

              <div className={styles.mockGraph}>
                <div className={styles.graphHeader}>
                  <span>Atividade</span>
                  <span>Hoje</span>
                </div>

                <div className={styles.graphBars}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <Activity className={styles.graphIcon} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};