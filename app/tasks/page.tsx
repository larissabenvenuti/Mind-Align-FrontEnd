"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle2,
  ArrowLeft,
  ListTodo,
  Tag as TagIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "../../lib/toast";
import { api } from "../../lib/api";
import styles from "./Tasks.module.scss";
import Link from "next/link";
import { Input } from "../../components/ui/Input/Input";
import { Button } from "../../components/ui/Button/Button";
import type { Task, Tag } from "../../types";
import TaskList from "./components/TaskList";
import TaskTagManager from "./components/TaskTagManager";

const MAX_CHARACTERS = 80;

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTask, setNewTask] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showTagManager, setShowTagManager] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");

  useEffect(() => {
    loadTasks();
    loadTags();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const taskId = params.get("taskId");
      if (taskId) {
        const el = document.getElementById(`task-${taskId}`);
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
  }, [tasks]);

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await api.get<Task[]>(`/api/tasks`);
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erro ao carregar tarefas");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadTags() {
    try {
      const data = await api.get<Tag[]>("/api/tags");
      setTags(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar tags", err);
      setTags([]);
    }
  }

  async function handleAddTag() {
    if (!newTagName.trim()) return;

    try {
      const newTag = await api.post<Tag>("/api/tags", {
        name: newTagName.trim(),
        color: newTagColor,
      });
      setTags([...tags, newTag]);
      setNewTagName("");
      setNewTagColor("#6366f1");
      toast.success("Tag criada com sucesso!");
    } catch {
      toast.error("Erro ao criar tag");
    }
  }

  async function handleDeleteTag(tagId: string) {
    try {
      await api.delete(`/api/tags/${tagId}`);
      setTags((currentTags) => currentTags.filter((tag) => tag.id !== tagId));
      setSelectedTagIds((currentIds) =>
        currentIds.filter((id) => id !== tagId),
      );
      toast.success("Tag excluída com sucesso!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao excluir tag",
      );
    }
  }

  async function handleAddTask() {
    if (!newTask.trim()) return;

    try {
      await api.post(`/api/tasks`, {
        text: newTask.trim().slice(0, MAX_CHARACTERS),
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      });
      setNewTask("");
      setSelectedTagIds([]);
      await loadTasks();
      toast.success("Tarefa adicionada!");
    } catch {
      toast.error("Erro ao adicionar tarefa");
    }
  }

  async function handleToggleTask(id: string) {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );

    try {
      setUpdatingId(id);
      await api.patch(`/api/tasks/${id}/toggle`, {});
    } catch {
      await loadTasks();
      toast.error("Erro ao alternar tarefa");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteTask(id: string) {
    const previousTasks = [...tasks];
    setTasks((tasks) => tasks.filter((task) => task.id !== id));

    try {
      setUpdatingId(id);
      await api.delete(`/api/tasks/${id}`);
      toast.success("Tarefa excluída!");
    } catch {
      setTasks(previousTasks);
      toast.error("Erro ao excluir tarefa");
    } finally {
      setUpdatingId(null);
    }
  }

  function handleToggleTag(tagId: string) {
    setSelectedTagIds((currentIds) =>
      currentIds.includes(tagId)
        ? currentIds.filter((id) => id !== tagId)
        : [...currentIds, tagId],
    );
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercentage =
    tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

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
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ListTodo className={styles.mainIcon} />
                <CheckCircle2 className={styles.pulseIcon} />
              </motion.span>
              <div>
                <h1 className={styles.title}>Lista de Tarefas</h1>
                <p className={styles.subtitle}>
                  Organize suas prioridades diárias.
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
              <div className={styles.inputStack}>
                <div className={styles.inputWrapper}>
                  <Input
                    type="text"
                    value={newTask}
                    onChange={(e) =>
                      setNewTask(e.target.value.slice(0, MAX_CHARACTERS))
                    }
                    maxLength={MAX_CHARACTERS}
                    placeholder="O que você precisa fazer hoje?"
                    className={styles.textInput}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                    disabled={updatingId !== null}
                  />
                  <Button
                    onClick={() => setShowTagManager(!showTagManager)}
                    className={styles.tagButton}
                    title="Gerenciar tags"
                  >
                    <TagIcon size={18} />
                  </Button>
                  <Button
                    onClick={handleAddTask}
                    disabled={!newTask.trim() || updatingId !== null}
                    className={styles.addButton}
                    size="lg"
                  >
                    <Plus className={styles.addIcon} />
                    Adicionar
                  </Button>
                </div>

                {showTagManager && (
                  <TaskTagManager
                    tags={tags}
                    selectedTagIds={selectedTagIds}
                    newTagName={newTagName}
                    newTagColor={newTagColor}
                    onToggleTag={handleToggleTag}
                    onNewTagNameChange={setNewTagName}
                    onNewTagColorChange={setNewTagColor}
                    onCreateTag={handleAddTag}
                    onDeleteTag={handleDeleteTag}
                  />
                )}

                <div className={styles.progressRow}>
                  <span className={styles.charCount}>
                    {newTask.length}/{MAX_CHARACTERS} caracteres
                  </span>
                  <AnimatePresence>
                    {tasks.length > 0 && (
                      <motion.div
                        className={styles.progressData}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <span className={styles.progressText}>
                          {completedCount}/{tasks.length} concluídas
                        </span>
                        <div className={styles.progressBarBg}>
                          <motion.div
                            className={styles.progressBarFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{
                              type: "spring",
                              stiffness: 100,
                              damping: 20,
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.article>

            <TaskList
              tasks={tasks}
              loading={loading}
              updatingId={updatingId}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
