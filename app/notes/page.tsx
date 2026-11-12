"use client";

import { useState, useEffect } from "react";
import { Save, Trash2, BookOpen, PenLine, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/Button/Button";
import Link from "next/link";
import { toast } from "../../lib/toast";
import { api } from "../../lib/api";
import { Editor } from "./components/Editor";
import styles from "./Notes.module.scss";

const MAX_CHARACTERS = 1000;

interface Note {
  id: string;
  content: string;
  date: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [contentHtml, setContentHtml] = useState("");
  const [contentText, setContentText] = useState("");

  const charCount = contentText.length;
  const canSave =
    contentText.trim().length > 0 && charCount <= MAX_CHARACTERS;

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const noteId = params.get("noteId");
      if (noteId) {
        const el = document.getElementById(`note-${noteId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const originalBorder = el.style.borderColor;
          const originalBoxShadow = el.style.boxShadow;

          el.style.transition = "all 0.5s ease";
          el.style.borderColor = "hsl(var(--primary))";
          el.style.boxShadow = "0 0 0 4px hsl(var(--primary) / 0.2)";

          setTimeout(() => {
            el.style.borderColor = originalBorder;
            el.style.boxShadow = originalBoxShadow;
          }, 3000);

          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    }
  }, [notes]);

  async function loadNotes() {
    try {
      const data = await api.get<Note[]>(`/api/notes`);
      setNotes(data);
    } catch {
      toast.error("Erro ao buscar notas");
    }
  }

  async function handleSaveNote() {
    if (!canSave) {
      toast.error(
        charCount > MAX_CHARACTERS
          ? `A nota pode ter no máximo ${MAX_CHARACTERS} caracteres.`
          : "A nota não pode estar vazia.",
      );
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/notes`, { content: contentHtml });
      toast.success("Nota salva com sucesso!");

      setContentHtml("");
      setContentText("");

      await loadNotes();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar nota.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteNote(id: string) {
    try {
      await api.delete(`/api/notes/${id}`);
      toast.success("Nota excluída!");
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast.error("Erro ao excluir nota.");
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
                <BookOpen className={styles.mainIcon} />
                <PenLine className={styles.pulseIcon} />
              </motion.span>
              <div>
                <h1 className={styles.title}>Anotações Rápidas</h1>
                <p className={styles.subtitle}>
                  Salve links, ideias ou notas com formatação.
                </p>
              </div>
            </div>
          </header>

          <div className={styles.mainContent}>
            <motion.article
              className={styles.editorCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              <Editor
                content={contentHtml}
                onChange={(html, text) => {
                  setContentHtml(html);
                  setContentText(text);
                }}
              />

              <div className={styles.editorFooter}>
                <span className={styles.charCount}>
                  {charCount}/{MAX_CHARACTERS} caracteres
                </span>
                <Button
                  onClick={handleSaveNote}
                  disabled={!canSave || loading}
                  className={styles.saveButton}
                  size="lg"
                >
                  <Save className={styles.btnIconSm} />
                  {loading ? "Salvando..." : "Salvar Nota"}
                </Button>
              </div>
            </motion.article>

            <motion.article
              className={styles.historyCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              <div className={styles.historyHeader}>
                <div className={styles.indicator} />
                <h2 className={styles.historyTitle}>Histórico</h2>
              </div>

              {notes.length === 0 ? (
                <motion.div
                  className={styles.emptyState}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className={styles.emptyIconBox}>
                    <BookOpen className={styles.emptyIcon} />
                  </div>
                  <p className={styles.emptyText}>
                    Nenhuma anotação encontrada.
                  </p>
                </motion.div>
              ) : (
                <div className={styles.notesList}>
                  <AnimatePresence mode="popLayout">
                    {notes.map((entry) => (
                      <motion.div
                        id={`note-${entry.id}`}
                        key={entry.id}
                        className={styles.noteItem}
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: -20 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      >
                        <div className={styles.noteBody}>
                          <time className={styles.noteTime}>
                            {new Date(entry.date).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </time>

                          <div
                            className={styles.noteHtml}
                            dangerouslySetInnerHTML={{ __html: entry.content }}
                          />
                        </div>

                        <Button
                          onClick={() => handleDeleteNote(entry.id)}
                          className={styles.deleteBtn}
                          title="Excluir nota"
                          aria-label="Excluir nota"
                        >
                          <Trash2 className={styles.btnIconSm} />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.article>
          </div>
        </div>
      </div>
    </motion.section>
  );
}