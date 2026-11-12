"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Hourglass, Plus, Target } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "../../components/ui/Button/Button";
import { Input } from "../../components/ui/Input/Input";
import { api } from "../../lib/api";
import { toast } from "../../lib/toast";
import type { Habit } from "../../types";
import HabitDesktopTable from "./components/HabitDesktopTable";
import HabitMobileList from "./components/HabitMobileList";
import styles from "./Habits.module.scss";

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
    } catch {
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
    } catch {
      toast.error("Não foi possível adicionar o hábito");
    }
  }

  async function handleToggleCheckbox(habitId: string, dayIdx: number) {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id === habitId) {
          const newWeekData = [...habit.weekData];
          newWeekData[dayIdx] = !newWeekData[dayIdx];

          let currentStreak = habit.currentStreak;
          if (newWeekData[dayIdx]) {
            currentStreak += 1;
          } else {
            currentStreak = Math.max(0, currentStreak - 1);
          }
          const longestStreak = Math.max(currentStreak, habit.longestStreak);

          return { ...habit, weekData: newWeekData, currentStreak, longestStreak };
        }
        return habit;
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
        prevHabits.map((habit) => {
          if (habit.id === habitId) {
            return {
              ...habit,
              currentStreak: response.currentStreak,
              longestStreak: response.longestStreak,
            };
          }
          return habit;
        }),
      );
    } catch {
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
      setHabits((currentHabits) =>
        currentHabits.filter((habit) => habit.id !== habitId),
      );
      toast.success("Hábito removido com sucesso");
    } catch {
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
                <HabitDesktopTable
                  habits={habits}
                  updatingId={updatingId}
                  onToggleDay={handleToggleCheckbox}
                  onDeleteHabit={handleDeleteHabit}
                />
              )}
              {!loading && (
                <HabitMobileList
                  habits={habits}
                  updatingId={updatingId}
                  onToggleDay={handleToggleCheckbox}
                  onDeleteHabit={handleDeleteHabit}
                />
              )}
            </motion.article>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
