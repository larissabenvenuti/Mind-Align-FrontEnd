"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  CheckSquare,
  StickyNote,
  CalendarDays,
  ListChecks,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { api } from "../../../lib/api";
import styles from "./recent-activity-section.module.scss";

interface ActivityItem {
  id: string;
  type: "event" | "note" | "habit" | "task";
  content: string;
  date: string;
}

function getIcon(type: string) {
  switch (type) {
    case "event":
      return (
        <div className={`${styles.iconContainer} ${styles.iconEvent}`}>
          <CalendarDays className={styles.iconBase} />
        </div>
      );

    case "note":
      return (
        <div className={`${styles.iconContainer} ${styles.iconNote}`}>
          <StickyNote className={styles.iconBase} />
        </div>
      );

    case "habit":
      return (
        <div className={`${styles.iconContainer} ${styles.iconHabit}`}>
          <CheckSquare className={styles.iconBase} />
        </div>
      );

    case "task":
      return (
        <div className={`${styles.iconContainer} ${styles.iconTask}`}>
          <ListChecks className={styles.iconBase} />
        </div>
      );

    default:
      return (
        <div className={`${styles.iconContainer} ${styles.iconDefault}`}>
          <Activity className={styles.iconBase} />
        </div>
      );
  }
}

function getLabel(type: string) {
  switch (type) {
    case "event":
      return "Evento";
    case "note":
      return "Anotação";
    case "habit":
      return "Hábito";
    case "task":
      return "Tarefa";
    default:
      return "Atividade";
  }
}

export default function RecentActivitySection() {
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const loadActivity = () => {
    setLoading(true);
    setError(null);

    api
      .get<ActivityItem[]>("/api/activity")
      .then((data) => setRecentActivity(data))
      .catch(() => setError("Não foi possível carregar as atividades."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadActivity();
  }, []);

  const handleActivityClick = (type: string, id: string) => {
    switch (type) {
      case "event":
        router.push(`/calendar?eventId=${id}`);
        break;

      case "note":
        router.push(`/notes?noteId=${id}`);
        break;

      case "habit":
        router.push(`/habits?habitId=${id}`);
        break;

      case "task":
        router.push(`/tasks?taskId=${id}`);
        break;

      default:
        break;
    }
  };

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.titleIconBox}>
            <Activity className={styles.titleIcon} />
          </div>

          <div>
            <h2 className={styles.title}>Atividade recente</h2>
            <p className={styles.subtitle}>
              Acompanhe o que aconteceu no seu workspace.
            </p>
          </div>
        </div>

        {!loading && !error && recentActivity.length > 0 && (
          <span className={styles.activityCount}>
            {recentActivity.length}
          </span>
        )}
      </div>

      <div className={styles.listWrapper}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className={styles.stateContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={styles.spinner} />

              <div className={styles.stateTextGroup}>
                <p className={styles.stateTitle}>Carregando atividades</p>
                <p className={styles.stateDescription}>
                  Buscando suas últimas movimentações...
                </p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              className={styles.stateContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Activity className={styles.errorIcon} />

              <div className={styles.stateTextGroup}>
                <p className={styles.stateTitle}>Algo deu errado</p>
                <p className={styles.stateDescription}>{error}</p>
              </div>

              <button
                type="button"
                className={styles.retryButton}
                onClick={loadActivity}
              >
                <RefreshCw />
                Tentar novamente
              </button>
            </motion.div>
          ) : recentActivity.length === 0 ? (
            <motion.div
              key="empty"
              className={styles.stateContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={styles.emptyIconWrapper}>
                <Activity className={styles.emptyIcon} />
              </div>

              <div className={styles.stateTextGroup}>
                <p className={styles.stateTitle}>
                  Ainda não há atividades
                </p>

                <p className={styles.stateDescription}>
                  Suas próximas ações aparecerão aqui.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.ul
              key="list"
              className={styles.list}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {recentActivity.map((item, index) => (
                <motion.li
                  key={item.id + item.type}
                  className={styles.listItem}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.04,
                    type: "spring",
                    stiffness: 300,
                    damping: 24,
                  }}
                  onClick={() =>
                    handleActivityClick(item.type, item.id)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleActivityClick(item.type, item.id);
                    }
                  }}
                >
                  <div className={styles.itemIconWrapper}>
                    {getIcon(item.type)}
                  </div>

                  <div className={styles.itemContent}>
                    <div className={styles.itemTextGroup}>
                      <span className={styles.itemTypeLabel}>
                        {getLabel(item.type)}
                      </span>

                      <div
                        className={styles.tiptapPreview}
                        dangerouslySetInnerHTML={{
                          __html: item.content,
                        }}
                      />
                    </div>

                    <div className={styles.itemTime}>
                      <span className={styles.timeDot} />

                      {new Date(item.date).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className={styles.actionArrow}>
                    <ChevronRight className={styles.arrowIcon} />
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}