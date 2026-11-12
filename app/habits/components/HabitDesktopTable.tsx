"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Award, Check, Flame, Target, Trash2, TrendingUp } from "lucide-react";

import { Button } from "../../../components/ui/Button/Button";
import type { Habit } from "../../../types";
import { DAYS_OF_WEEK, getHabitProgress } from "../habitUtils";
import styles from "../Habits.module.scss";

interface HabitDesktopTableProps {
  habits: Habit[];
  updatingId: string | null;
  onToggleDay: (habitId: string, dayIndex: number) => void;
  onDeleteHabit: (habitId: string) => void;
}

export default function HabitDesktopTable({
  habits,
  updatingId,
  onToggleDay,
  onDeleteHabit,
}: HabitDesktopTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={`${styles.table} ${styles.desktopTable}`}>
        <thead>
          <tr>
            <th className={styles.thHabit}>Hábito</th>
            {DAYS_OF_WEEK.map((day) => (
              <th key={day} className={styles.thDay}>
                {day}
              </th>
            ))}
            <th className={styles.thActions}>Ações</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {habits.length === 0 ? (
              <motion.tr
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <td
                  colSpan={DAYS_OF_WEEK.length + 2}
                  className={styles.emptyCell}
                >
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIconBox}>
                      <Target className={styles.emptyIcon} />
                    </div>
                    <p className={styles.emptyText}>
                      Nenhum hábito cadastrado ainda.
                    </p>
                  </div>
                </td>
              </motion.tr>
            ) : (
              habits.map((habit) => {
                const { completionRate } = getHabitProgress(habit.weekData);

                return (
                  <motion.tr
                    id={`desktop-habit-${habit.id}`}
                    key={habit.id}
                    className={styles.tableRow}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className={styles.tdHabitName}>
                      <div className={styles.habitInfo}>
                        <h3>{habit.name}</h3>
                        <div className={styles.habitStats}>
                          <span className={styles.statBadge} title="Streak atual">
                            <Flame size={14} />
                            {habit.currentStreak}{" "}
                            {habit.currentStreak === 1 ? "dia" : "dias"}
                          </span>
                          <span
                            className={styles.statBadge}
                            title="Maior sequência"
                          >
                            <Award size={14} />
                            Recorde: {habit.longestStreak}
                          </span>
                          <span
                            className={styles.statBadge}
                            title="Taxa de conclusão"
                          >
                            <TrendingUp size={14} />
                            {completionRate}%
                          </span>
                        </div>
                      </div>
                    </td>

                    {habit.weekData.map((checked, dayIndex) => (
                      <td key={dayIndex} className={styles.tdCheckbox}>
                        <Button
                          onClick={() => onToggleDay(habit.id, dayIndex)}
                          disabled={updatingId === habit.id}
                          className={`${styles.checkboxBtn} ${checked ? styles.checked : styles.unchecked} ${updatingId === habit.id ? styles.disabled : ""}`}
                          title={checked ? "Desmarcar" : "Marcar como feito"}
                        >
                          <motion.div
                            initial={false}
                            animate={{ scale: checked ? 1 : 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 20,
                            }}
                          >
                            <Check
                              className={styles.checkIcon}
                              strokeWidth={3}
                            />
                          </motion.div>
                        </Button>
                      </td>
                    ))}

                    <td className={styles.tdActions}>
                      <Button
                        onClick={() => onDeleteHabit(habit.id)}
                        disabled={updatingId === habit.id}
                        className={styles.deleteBtn}
                        title="Excluir hábito"
                      >
                        <Trash2 className={styles.deleteIcon} />
                      </Button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
