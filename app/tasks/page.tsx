"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ListTodo,
  Tag as TagIcon,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "../../lib/toast";
import { api } from "../../lib/api";
import styles from "./Tasks.module.scss";
import Link from "next/link";
import { Input } from "../../components/ui/Input/Input";
import { Button } from "../../components/ui/Button/Button";
import { Task, Tag } from "../../types";

const MAX_CHARACTERS = 80;

const PRESET_COLORS = [
  "#6366f1", // Índigo
  "#ec4899", // Rosa
  "#3b82f6", // Azul
  "#10b981", // Esmeralda
  "#f59e0b", // Âmbar
  "#8b5cf6", // Roxo
  "#ef4444", // Vermelho
  "#14b8a6", // Ciano
];

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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      setTasks(previousTasks);
      toast.error("Erro ao excluir tarefa");
    } finally {
      setUpdatingId(null);
    }
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
                  <motion.div
                    className={styles.tagManager}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className={styles.tagManagerSection}>
                      <div className={styles.tagSectionHeading}>
                        <div>
                          <h3>Adicionar tags à tarefa</h3>
                          <p>Selecione uma ou mais categorias para organizar esta tarefa.</p>
                        </div>
                        <span className={styles.selectionCount}>
                          {selectedTagIds.length} selecionada
                          {selectedTagIds.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className={styles.tagList}>
                        {tags.length === 0 ? (
                          <p className={styles.noTags}>
                            Nenhuma tag criada ainda
                          </p>
                        ) : (
                          tags.map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() =>
                                setSelectedTagIds(
                                  selectedTagIds.includes(tag.id)
                                    ? selectedTagIds.filter(
                                        (id) => id !== tag.id,
                                      )
                                    : [...selectedTagIds, tag.id],
                                )
                              }
                              className={`${styles.tagOption} ${selectedTagIds.includes(tag.id) ? styles.tagOptionSelected : ""}`}
                              aria-pressed={selectedTagIds.includes(tag.id)}
                              title={`${
                                selectedTagIds.includes(tag.id)
                                  ? "Remover"
                                  : "Adicionar"
                              } tag ${tag.name}`}
                              style={{
                                borderColor: tag.color,
                                backgroundColor: selectedTagIds.includes(tag.id)
                                  ? `${tag.color}18`
                                  : "transparent",
                                color: selectedTagIds.includes(tag.id)
                                  ? tag.color
                                  : "inherit",
                              }}
                            >
                              <span
                                className={styles.tagOptionDot}
                                style={{ backgroundColor: tag.color }}
                              />
                              {tag.name}
                              {selectedTagIds.includes(tag.id) && (
                                <Check
                                  className={styles.tagOptionCheck}
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    <div className={styles.tagManagerSection}>
                      <h3>Criar nova tag</h3>
                      <div className={styles.createTagForm}>
                        <Input
                          type="text"
                          placeholder="Nome da tag"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          className={styles.tagInput}
                        />

                        <div className={styles.colorPickerContainer}>
                          <div className={styles.colorPickerHeading}>
                            <span>Cor da tag</span>
                            <span
                              className={styles.selectedColorPreview}
                              style={{ backgroundColor: newTagColor }}
                            />
                          </div>
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`${styles.colorSwatch} ${newTagColor === color ? styles.colorSwatchActive : ""}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setNewTagColor(color)}
                              title={`Selecionar cor ${color}`}
                              aria-label={`Selecionar cor ${color}`}
                              aria-pressed={newTagColor === color}
                            />
                          ))}
                        </div>

                        <Button
                          onClick={handleAddTag}
                          disabled={!newTagName.trim()}
                          className={styles.createTagBtn}
                        >
                          <Plus size={16} /> Criar
                        </Button>
                      </div>
                    </div>

                    {tags.length > 0 && (
                      <div className={styles.tagManagerSection}>
                        <h3>Tags Existentes</h3>
                        <div className={styles.existingTags}>
                          {tags.map((tag) => (
                            <div key={tag.id} className={styles.existingTag}>
                              <span
                                className={styles.tagDot}
                                style={{ backgroundColor: tag.color }}
                              />
                              <span>{tag.name}</span>
                              <button
                                onClick={() => handleDeleteTag(tag.id)}
                                className={styles.deleteTagBtn}
                                title="Excluir tag"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
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

            <motion.article
              className={styles.listCard}
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
                  <p>Carregando tarefas...</p>
                </div>
              ) : tasks.length === 0 ? (
                <motion.div
                  className={styles.emptyState}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className={styles.emptyIconBox}>
                    <ListTodo className={styles.emptyIcon} />
                  </div>
                  <p className={styles.emptyTitle}>Nenhuma tarefa pendente!</p>
                  <p className={styles.emptySubtitle}>
                    Adicione uma nova tarefa acima para começar o dia.
                  </p>
                </motion.div>
              ) : (
                <motion.div layout className={styles.listContainer}>
                  <AnimatePresence mode="popLayout">
                    {tasks.map(({ id, text, completed, tags: taskTags }) => (
                      <motion.div
                        id={`task-${id}`}
                        key={id}
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: -20 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                        className={`${styles.taskRow} ${completed ? styles.taskRowCompleted : styles.taskRowPending}`}
                      >
                        <Button
                          onClick={() => handleToggleTask(id)}
                          disabled={updatingId === id}
                          className={`${styles.toggleBtn} ${updatingId === id ? styles.btnDisabled : ""}`}
                          title={
                            completed
                              ? "Marcar como pendente"
                              : "Concluir tarefa"
                          }
                        >
                          <motion.div
                            initial={false}
                            animate={{ rotate: completed ? 360 : 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                            }}
                          >
                            {completed ? (
                              <CheckCircle2 className={styles.iconCompleted} />
                            ) : (
                              <Circle className={styles.iconPending} />
                            )}
                          </motion.div>
                        </Button>

                        <div className={styles.taskContent}>
                          <span
                            className={`${styles.taskText} ${completed ? styles.textCompleted : styles.textPending}`}
                          >
                            {text}
                          </span>
                          {taskTags && taskTags.length > 0 && (
                            <div className={styles.taskTagsContainer}>
                              {taskTags.map((tag) => (
                                <span
                                  key={tag.id}
                                  className={styles.taskTag}
                                  style={{
                                    backgroundColor: tag.color + "20",
                                    borderColor: tag.color,
                                    color: tag.color,
                                  }}
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => handleDeleteTask(id)}
                          disabled={updatingId === id}
                          className={styles.deleteBtn}
                          title="Excluir tarefa"
                        >
                          <Trash2 className={styles.deleteIcon} />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.article>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
