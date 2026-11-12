"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Circle, ListTodo, Trash2 } from "lucide-react";

import { Button } from "../../../components/ui/Button/Button";
import type { Task } from "../../../types";

import styles from "../Tasks.module.scss";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  updatingId: string | null;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskList({
  tasks,
  loading,
  updatingId,
  onToggleTask,
  onDeleteTask,
}: TaskListProps) {
  return (
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
            {tasks.map(({ id, text, completed, tags }) => (
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
                  onClick={() => onToggleTask(id)}
                  disabled={updatingId === id}
                  className={`${styles.toggleBtn} ${updatingId === id ? styles.btnDisabled : ""}`}
                  title={
                    completed ? "Marcar como pendente" : "Concluir tarefa"
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
                  {tags && tags.length > 0 && (
                    <div className={styles.taskTagsContainer}>
                      {tags.map((tag) => (
                        <span
                          key={tag.id}
                          className={styles.taskTag}
                          style={{
                            backgroundColor: `${tag.color}20`,
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
                  onClick={() => onDeleteTask(id)}
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
  );
}
