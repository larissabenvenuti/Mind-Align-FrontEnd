"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../ui/Button/Button";
import { LogOut, Bell, BellOff, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { useNotifications } from "../../../hooks/useNotifications";
import styles from "./Header.module.scss";

export const Header = () => {
  const { user, logout } = useAuth();
  const { isSubscribed, isProcessing, toggleNotifications } =
    useNotifications();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const previousScrollY = useRef(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < previousScrollY.current;

      setIsVisible(currentScrollY < 48 || scrollingUp || showUserMenu);
      previousScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showUserMenu]);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    router.push("/");
  };

  const userInitial = user?.name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <motion.header
      className={`${styles.header} ${pathname === "/auth" ? styles.headerAuth : ""}`}
      initial={false}
      animate={{ y: isVisible ? 0 : "-100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 36 }}
    >
      <div className={styles.container}>
        <nav className={styles.nav}>
          <Link
            href={user ? "/dashboard" : "/"}
            passHref
            style={{ textDecoration: "none" }}
          >
            <motion.div
              className={styles.logoSection}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.avatarWrapper}>
                <div className={styles.avatar}>
                  <span className={styles.avatarLetter}>M</span>
                </div>

                <motion.div
                  className={styles.pulseDot}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              <div className={styles.brandText}>
                <h1 className={styles.brandTitle}>MindAlign</h1>
              </div>
            </motion.div>
          </Link>

          <div className={styles.actionsSection}>
            {user && isClient && "Notification" in window && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={isSubscribed ? "ghost" : "outline"}
                  size="sm"
                  onClick={toggleNotifications}
                  disabled={isProcessing}
                  aria-label={
                    isSubscribed
                      ? "Desativar notificações"
                      : "Ativar notificações"
                  }
                  className={`${styles.notificationBtn} ${
                    isSubscribed ? styles.btnSubscribed : ""
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isSubscribed ? (
                      <motion.div key="sub" className={styles.iconRow}>
                        <Bell className={styles.iconSmall} />
                      </motion.div>
                    ) : (
                      <motion.div key="unsub" className={styles.iconRow}>
                        <BellOff className={styles.iconSmall} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            )}

            {user ? (
              <div className={styles.userMenuWrapper}>
                <Button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={styles.userButton}
                  aria-label="Abrir menu da conta"
                  aria-expanded={showUserMenu}
                >
                  <div className={styles.userAvatar}>
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={`Foto de ${user.name || "usuário"}`}
                      />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                  </div>
                </Button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <motion.div
                        className={styles.backdrop}
                        onClick={() => setShowUserMenu(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />

                      <motion.div
                        className={styles.dropdown}
                        initial={{
                          opacity: 0,
                          scale: 0.9,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.9,
                          y: 10,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      >
                        <div className={styles.dropdownHeader}>
                          <p className={styles.dropdownName}>
                            {user.name || "Usuário"}
                          </p>

                          <p className={styles.dropdownEmail}>{user.email}</p>
                        </div>

                        <div className={styles.dropdownBody}>
                          <Link
                            href="/settings"
                            className={styles.dropdownItem}
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className={styles.iconSmall} />
                            <span>Configurações</span>
                          </Link>

                          <button
                            type="button"
                            onClick={handleLogout}
                            className={`${styles.dropdownItem} ${styles.textDestructive}`}
                          >
                            <LogOut className={styles.iconSmall} />
                            <span>Sair da conta</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : pathname !== "/auth" ? (
              <Link href="/auth" className={styles.signInButton}>
                Entrar
              </Link>
            ) : null}
          </div>
        </nav>
      </div>
    </motion.header>
  );
};
