"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Repeat, Bell, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import styles from "./event-details-modal.module.scss";

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventDetails: any;
  onSave: (event: any) => void;
  onDelete: (id: string) => void;
}

export default function EventDetailsModal({
  isOpen,
  onClose,
  eventDetails,
  onSave,
  onDelete,
}: EventDetailsModalProps) {
  // Trava o scroll da página quando o modal abre
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !eventDetails) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Fechar modal"
          >
            <X className={styles.iconBase} />
          </Button>

          <header className={styles.header}>
            <div className={styles.iconWrapper}>
              <CalendarIcon className={styles.headerIcon} />
            </div>
            <div>
              <h2 className={styles.title}>{eventDetails.title}</h2>
              <span className={styles.badge}>Evento Programado</span>
            </div>
          </header>

          <div className={styles.body}>
            <div className={styles.infoRow}>
              <Clock className={styles.clockIcon} />
              <div className={styles.timeGroup}>
                <span className={styles.label}>
                  {new Date(eventDetails.start).toLocaleDateString("pt-BR")}
                </span>
                <span className={styles.value}>
                  {new Date(eventDetails.start).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" - "}
                  {new Date(eventDetails.end).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.infoBox}>
                <div className={styles.boxHeader}>
                  <Bell className={styles.bellIcon} /> Lembrete
                </div>
                <span className={styles.boxValue}>
                  {eventDetails.reminderMinutes
                    ? `${eventDetails.reminderMinutes} min antes`
                    : "Sem lembrete"}
                </span>
              </div>
              <div className={styles.infoBox}>
                <div className={styles.boxHeader}>
                  <Repeat className={styles.repeatIcon} /> Repetição
                </div>
                <span className={styles.boxValueCapitalize}>
                  {eventDetails.repeat === "weekly"
                    ? "Semanal"
                    : eventDetails.repeat === "monthly"
                      ? "Mensal"
                      : "Não repete"}
                </span>
              </div>
            </div>
          </div>

          <footer className={styles.footer}>
            <Button
              variant="outline"
              className={styles.btnDelete}
              onClick={() => onDelete(eventDetails.id)}
            >
              Excluir
            </Button>
            <Button
              className={styles.btnEdit}
              onClick={() => onSave(eventDetails)}
            >
              Editar
            </Button>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
