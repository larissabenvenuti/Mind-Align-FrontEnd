"use client";

import { motion } from "framer-motion";
import { Check, Target, Trash2 } from "lucide-react";

import { Button } from "../../../components/ui/Button/Button";
import type { Habit } from "../../../types";
import { DAYS_OF_WEEK, getHabitProgress } from "../habitUtils";
import styles from "../Habits.module.scss";

interface HabitMobileListProps {
  habits: Habit[];
  updatingId: string | null;
  onToggleDay: (habitId: string, dayIndex: number) => void;
  onDeleteHabit: (habitId: string) => void;
}

export default function HabitMobileList({
  habits,
  updatingId,
  onToggleDay,
  onDeleteHabit,
}: HabitMobileListProps) {
  return (
    <div className={styles.mobileHabitList}>
      {habits.length === 0 ? (
        <div className={styles.mobileEmptyState}>
          <div className={styles.emptyIconBox}>
            <Target className={styles.emptyIcon} />
          </div>
          <p className={styles.emptyTitle}>
            Sua rotina começa com um hábito
          </p>
          <p className={styles.emptyText}>
            Adicione um hábito acima e marque seus dias para acompanhar seu
            progresso.
          </p>
        </div>
      ) : (
        habits.map((habit) => {
          const { completedDays, completionRate } = getHabitProgress(
            habit.weekData,
          );

          return (
            <motion.article
              id={`habit-${habit.id}`}
              key={habit.id}
              className={styles.mobileHabitCard}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <div className={styles.mobileHabitHeader}>
                <div className={styles.mobileHabitInfo}>
                  <h3>{habit.name}</h3>
                  <p>
                    {habit.currentStreak}{" "}
                    {habit.currentStreak === 1 ? "dia" : "dias"} de sequência
                  </p>
                </div>
                <Button
                  onClick={() => onDeleteHabit(habit.id)}
                  disabled={updatingId === habit.id}
                  className={styles.mobileDeleteBtn}
                  aria-label={`Excluir hábito ${habit.name}`}
                  title="Excluir hábito"
                >
                  <Trash2 className={styles.deleteIcon} />
                </Button>
              </div>

              <div className={styles.mobileHabitProgress}>
                <span>Esta semana</span>
                <strong>
                  {completedDays}/7 · {completionRate}%
                </strong>
              </div>
              <div
                className={styles.mobileProgressTrack}
                role="progressbar"
                aria-label={`Conclusão semanal de ${habit.name}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={completionRate}
              >
                <span style={{ width: `${completionRate}%` }} />
              </div>
              <div
                className={styles.mobileDayList}
                aria-label={`Progresso semanal de ${habit.name}`}
              >
                {habit.weekData.map((checked, dayIndex) => (
                  <Button
                    key={dayIndex}
                    onClick={() => onToggleDay(habit.id, dayIndex)}
                    disabled={updatingId === habit.id}
                    className={`${styles.mobileDayButton} ${
                      checked ? styles.mobileDayChecked : ""
                    }`}
                    aria-label={`${checked ? "Desmarcar" : "Marcar"} ${DAYS_OF_WEEK[dayIndex]} para ${habit.name}`}
                    aria-pressed={checked}
                  >
                    <span>{DAYS_OF_WEEK[dayIndex]}</span>
                    <Check className={styles.mobileDayCheck} />
                  </Button>
                ))}
              </div>
            </motion.article>
          );
        })
      )}
    </div>
  );
}
