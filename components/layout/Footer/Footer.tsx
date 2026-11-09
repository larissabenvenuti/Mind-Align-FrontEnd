"use client";

import { motion } from "framer-motion";
import styles from "./Footer.module.scss";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className={styles.footer}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>M</span>
            <span className={styles.logoText}>MindAlign</span>
          </div>
        </div>

        <div className={styles.right}>
          <p className={styles.text}>
            © {currentYear} MindAlign. Desenvolvido por{" "}
            <a 
              href="https://github.com/larissabenvenuti" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.link}
            >
              Larissa Benvenuti
            </a>
            .
          </p>
        </div>
      </div>
    </motion.footer>
  );
};