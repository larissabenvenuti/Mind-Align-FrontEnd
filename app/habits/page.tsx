"use client";

import { useEffect, useState } from "react";
import {
  Trash2,
  Plus,
  Target,
  ArrowLeft,
  Check,
  Hourglass,
  Flame,
  Award,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/Button/Button";
import { Input } from "../../components/ui/Input/Input";
import Link from "next/link";
import { api } from "../../lib/api";
import { toast } from "../../lib/toast";
import { Habit } from "../../types";
import styles from "./Habits.module.scss";

const daysOfWeek = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitName, setHabitName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    if (habits.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const habitId = params.get("habitId");
      if (habitId) {
        const isMobile = window.matchMedia("(max-width: 639px)").matches;
        const el = document.getElementById(
          isMobile ? `habit-${habitId}` : `desktop-habit-${habitId}`,
        );
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const originalBorder = el.style.borderColor;
          const originalBg = el.style.backgroundColor;

          el.style.transition = "all 0.5s ease";
          el.style.borderColor = "hsl(var(--primary))";
          el.style.backgroundColor = "hsl(var(--primary) / 0.05)";

          setTimeout(() => {
            el.style.borderColor = originalBorder;
            el.style.backgroundColor = originalBg;
          }, 3000);

          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    }
  }, [habits]);

  async function loadHabits() {
    try {
      setLoading(true);
      const data = await api.get<Habit[]>("/api/habits");
      setHabits(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Não foi possível carregar os hábitos");
      setHabits([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddHabit() {
    if (!habitName.trim()) return;

    try {
      await api.post<Habit>("/api/habits", { name: habitName });
      setHabitName("");
      await loadHabits();
      toast.success("Hábito adicionado com sucesso");
    } catch (err) {
      toast.error("Não foi possível adicionar o hábito");
    }
  }

  async function handleToggleCheckbox(habitId: string, dayIdx: number) {
    setHabits((prevHabits) =>
      prevHabits.map((h) => {
        if (h.id === habitId) {
          const newWeekData = [...h.weekData];
          newWeekData[dayIdx] = !newWeekData[dayIdx];

          let currentStreak = h.currentStreak;
          if (newWeekData[dayIdx]) {
            currentStreak += 1;
          } else {
            currentStreak = Math.max(0, currentStreak - 1);
          }
          const longestStreak = Math.max(currentStreak, h.longestStreak);

          return { ...h, weekData: newWeekData, currentStreak, longestStreak };
        }
        return h;
      }),
    );

    try {
      setUpdatingId(habitId);
      const response = await api.patch<{
        success: boolean;
        currentStreak: number;
        longestStreak: number;
      }>(`/api/habits/${habitId}/toggle`, { day: dayIdx });

      setHabits((prevHabits) =>
        prevHabits.map((h) => {
          if (h.id === habitId) {
            return {
              ...h,
              currentStreak: response.currentStreak,
              longestStreak: response.longestStreak,
            };
          }
          return h;
        }),
      );
    } catch (err) {
      await loadHabits();
      toast.error("Não foi possível atualizar o hábito");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteHabit(habitId: string) {
    try {
      setUpdatingId(habitId);
      await api.delete<void>(`/api/habits/${habitId}`);
      setHabits((habits) => habits.filter((h) => h.id !== habitId));
      toast.success("Hábito removido com sucesso");
    } catch (err) {
      toast.error("Não foi possível remover o hábito");
    } finally {
      setUpdatingId(null);
    }
  }

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
          animate={{ y: [-10, 10, -10], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="global-orb-bottom"
          animate={{ y: [10, -10, 10], scale: [1, 1.05, 1] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className={styles.spacer} />

      <div className={styles.content}>
        <div className={styles.wrapper}>
          <header className={styles.header}>
            <Link href="/dashboard" passHref>
              <motion.div
                className={styles.backLink}
                whileHover={{ x: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArrowLeft className={styles.backIcon} />
                Voltar ao Dashboard
              </motion.div>
            </Link>

            <div className={styles.titleSection}>
              <motion.span
                className={styles.iconBox}
                whileHover={{ rotate: -5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Target className={styles.mainIcon} />
                <Hourglass className={styles.pulseIcon} />
              </motion.span>
              <div>
                <h1 className={styles.title}>Rastreamento de Hábitos</h1>
                <p className={styles.subtitle}>
                  Construa disciplina acompanhando sua rotina semanal.
                </p>
              </div>
            </div>
          </header>

          <div className={styles.mainContent}>
            <motion.article
              className={styles.inputCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              <div className={styles.inputWrapper}>
                <Input
                  type="text"
                  placeholder="Qual novo hábito você quer iniciar?"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  className={styles.textInput}
                  onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
                  disabled={updatingId !== null}
                />
                <Button
                  onClick={handleAddHabit}
                  disabled={!habitName.trim() || updatingId !== null}
                  className={styles.addButton}
                  size="lg"
                >
                  <Plus className={styles.addIcon} />
                  Adicionar Hábito
                </Button>
              </div>
            </motion.article>

            <motion.article
              className={styles.tableCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              {loading ? (
                <div className={styles.loadingState}>
                  <motion.div
                    className={styles.spinner}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <p>Carregando sua rotina...</p>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={`${styles.table} ${styles.desktopTable}`}>
                    <thead>
                      <tr>
                        <th className={styles.thHabit}>Hábito</th>
                        {daysOfWeek.map((day) => (
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
                              colSpan={daysOfWeek.length + 2}
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
                            const completedDays =
                              habit.weekData.filter(Boolean).length;
                            const completionRate = Math.round(
                              (completedDays / 7) * 100,
                            );

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
                                      <span
                                        className={styles.statBadge}
                                        title="Streak atual"
                                      >
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

                                {habit.weekData.map((checked, dayIdx) => (
                                  <td
                                    key={dayIdx}
                                    className={styles.tdCheckbox}
                                  >
                                    <Button
                                      onClick={() =>
                                        handleToggleCheckbox(habit.id, dayIdx)
                                      }
                                      disabled={updatingId === habit.id}
                                      className={`${styles.checkboxBtn} ${checked ? styles.checked : styles.unchecked} ${updatingId === habit.id ? styles.disabled : ""}`}
                                      title={
                                        checked
                                          ? "Desmarcar"
                                          : "Marcar como feito"
                                      }
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
                                    onClick={() => handleDeleteHabit(habit.id)}
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
              )}
              {!loading && (
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
                        Adicione um hábito acima e marque seus dias para acompanhar seu progresso.
                      </p>
                    </div>
                  ) : (
                    habits.map((habit) => {
                      const completedDays =
                        habit.weekData.filter(Boolean).length;
                      const completionRate = Math.round(
                        (completedDays / 7) * 100,
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
                              onClick={() => handleDeleteHabit(habit.id)}
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
                            {habit.weekData.map((checked, dayIdx) => (
                              <Button
                                key={dayIdx}
                                onClick={() =>
                                  handleToggleCheckbox(habit.id, dayIdx)
                                }
                                disabled={updatingId === habit.id}
                                className={`${styles.mobileDayButton} ${
                                  checked ? styles.mobileDayChecked : ""
                                }`}
                                aria-label={`${checked ? "Desmarcar" : "Marcar"} ${daysOfWeek[dayIdx]} para ${habit.name}`}
                                aria-pressed={checked}
                              >
                                <span>{daysOfWeek[dayIdx]}</span>
                                <Check className={styles.mobileDayCheck} />
                              </Button>
                            ))}
                          </div>
                        </motion.article>
                      );
                    })
                  )}
                </div>
              )}
            </motion.article>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
