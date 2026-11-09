"use client";

import { motion, Variants } from "framer-motion";
import { CheckCircle2, Calendar, FileText, Sparkles } from "lucide-react";
import styles from "./Features.module.scss";

const features = [
  {
    icon: Calendar,
    title: "Eventos",
    description:
      "Calendário integrado para você nunca perder um compromisso importante.",
    colorClass: styles.iconTeal,
  },
  {
    icon: FileText,
    title: "Anotações",
    description: "Bloco de notas para melhor organização.",
    colorClass: styles.iconPink,
  },
  {
    icon: CheckCircle2,
    title: "Tarefas",
    description: "Gerencie seus afazeres com listas inteligentes e prazos visuais.",
    colorClass: styles.iconPurple,
  },
  {
    icon: Sparkles,
    title: "Hábitos",
    description: "Acompanhe sua evolução diária e construa uma rotina sólida.",
    colorClass: styles.iconIndigo,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  hover: {
    y: -5,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};

export const Features = () => {
  return (
    <section id="funcionalidades" className={styles.featuresSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Tudo que você precisa em um só lugar</h2>
          <p>
            Ferramentas modulares criadas para se adaptar ao seu fluxo de
            trabalho, não o contrário.
          </p>
        </div>

        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover="hover"
                className={styles.featureCard}
              >
                <div className={`${styles.iconWrapper} ${feature.colorClass}`}>
                  <Icon className={styles.icon} />
                </div>
                <h3 className={styles.title}>{feature.title}</h3>
                <p className={styles.description}>{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
