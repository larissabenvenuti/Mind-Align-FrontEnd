"use client";

import { motion } from "framer-motion";

import { Button } from "../../../components/ui/Button/Button";
import type { CalendarEvent } from "../types";
import styles from "../Calendar.module.scss";

interface NextEventCardProps {
  event: CalendarEvent | null;
  onViewEvent: (event: CalendarEvent) => void;
}

export default function NextEventCard({
  event,
  onViewEvent,
}: NextEventCardProps) {
  return (
    <motion.article
      className={styles.nextEventCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.05,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardIndicatorWrapper}>
          <div className={`${styles.indicator} ${styles.indicatorSuccess}`} />
          <h2 className={styles.cardTitle}>Próximo Evento</h2>
        </div>
      </div>

      <div className={styles.cardBody}>
        {event ? (
          <div className={styles.nextEventContent}>
            <h3 className={styles.nextEventTitle}>{event.title}</h3>
            <p className={styles.nextEventTime}>
              {new Date(event.start).toLocaleString("pt-BR", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
            <p className={styles.nextEventDuration}>
              Duração:{" "}
              {Math.round(
                (new Date(event.end).getTime() -
                  new Date(event.start).getTime()) /
                  60000,
              )}{" "}
              minutos
            </p>
            <Button
              onClick={() => onViewEvent(event)}
              className={styles.viewEventBtn}
            >
              Ver Detalhes
            </Button>
          </div>
        ) : (
          <div className={styles.emptyEventState}>
            <p>Nenhum evento agendado</p>
          </div>
        )}
      </div>
    </motion.article>
  );
}
