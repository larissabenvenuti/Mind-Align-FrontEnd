"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../../../components/ui/Button/Button";
import { Input } from "../../../../../../components/ui/Input/Input";
import { Label } from "../../../../../../components/ui/Label/Label";
import {
  X,
  Calendar,
  AlertCircle,
  Edit,
  Trash2,
  Repeat,
  Bell,
  ArrowLeft,
} from "lucide-react";
import { toast } from "../../../../../../lib/toast";
import styles from "./bulk-edit-modal.module.scss";

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  initialMode?: "edit" | "delete";
  onUpdateSingle: (event: any) => void;
  onUpdateAll: (event: any) => void;
  onDeleteSingle: (id: string) => void;
  onDeleteAll: (title: string) => void;
  defaultReminder?: number; // Recebendo a configuração!
}

export function BulkEditModal({
  isOpen,
  onClose,
  event,
  initialMode,
  onUpdateSingle,
  onUpdateAll,
  onDeleteSingle,
  onDeleteAll,
  defaultReminder = 15,
}: BulkEditModalProps) {
  const [mode, setMode] = useState<"select" | "edit" | "delete">(
    initialMode ?? "select",
  );
  const [scope, setScope] = useState<"single" | "all">("single");

  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState(defaultReminder);

  const toLocalISOString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (event && isOpen) {
      setMode(initialMode ?? "select");
      setScope("single");
      setTitle(event.title || "");
      setStart(toLocalISOString(new Date(event.start)));
      setEnd(toLocalISOString(new Date(event.end)));
      // Respeita o atual ou joga o padrão de configuração
      setReminderMinutes(event.reminderMinutes ?? defaultReminder);
    }
  }, [event, isOpen, initialMode, defaultReminder]);

  const handleConfirm = () => {
    if (mode === "edit") {
      if (!title.trim()) {
        toast.error("O título não pode estar vazio");
        return;
      }

      const startDate = new Date(start);
      const endDate = new Date(end);

      if (startDate >= endDate) {
        toast.error("Data de início deve ser anterior ao término");
        return;
      }

      const updatedData = {
        ...event,
        title: title.trim(),
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        reminderMinutes: Number(reminderMinutes),
      };

      if (scope === "single") {
        onUpdateSingle(updatedData);
      } else {
        onUpdateAll(updatedData);
      }
    } else if (mode === "delete") {
      if (scope === "single") {
        onDeleteSingle(event.id);
      } else {
        onDeleteAll(event.title);
      }
    }
    onClose();
  };

  const handleClose = () => {
    setMode(initialMode ?? "select");
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !event) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          className={mode === "select" ? styles.modal : styles.modalScrollable}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="global-orb-top-right" />
          <div className="global-orb-bottom-left" />

          <Button onClick={handleClose} className={styles.closeBtn}>
            <X className={styles.iconBase} />
          </Button>

          {mode === "select" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key="select-mode"
                className={styles.selectModeContent}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.header}>
                  <div className={styles.iconWrapper}>
                    <Calendar className={styles.headerIcon} />
                  </div>
                  <div>
                    <h2 className={styles.titleSelect}>Evento Recorrente</h2>
                    <p className={styles.subtitleSelect}>
                      O que deseja fazer com "{event.title}"?
                    </p>
                  </div>
                </div>

                <div className={styles.optionsGrid}>
                  <Button
                    onClick={() => setMode("edit")}
                    className={`${styles.optionCard} ${styles.optionCardEdit}`}
                  >
                    <div className={styles.optionIconEdit}>
                      <Edit className={styles.iconMd} />
                    </div>
                    <div>
                      <span className={styles.optionTitle}>Editar</span>
                      <span className={styles.optionDesc}>
                        Alterar detalhes deste ou de todos
                      </span>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setMode("delete")}
                    className={`${styles.optionCard} ${styles.optionCardDelete}`}
                  >
                    <div className={styles.optionIconDelete}>
                      <Trash2 className={styles.iconMd} />
                    </div>
                    <div>
                      <span className={styles.optionTitle}>Excluir</span>
                      <span className={styles.optionDesc}>
                        Remover evento do calendário
                      </span>
                    </div>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className={styles.btnGhost}
                >
                  Cancelar
                </Button>
              </motion.div>
            </AnimatePresence>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="action-mode"
                className={styles.actionModeContent}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.actionHeader}>
                  <Button
                    onClick={() =>
                      initialMode ? handleClose() : setMode("select")
                    }
                    className={styles.backBtn}
                  >
                    <ArrowLeft className={styles.iconMd} />
                  </Button>
                  <div
                    className={`${styles.themeIconWrapper} ${mode === "delete" ? styles.themeDelete : styles.themeEdit}`}
                  >
                    {mode === "delete" ? (
                      <Trash2 className={styles.iconLg} />
                    ) : (
                      <Edit className={styles.iconLg} />
                    )}
                  </div>
                  <h2 className={styles.actionTitle}>
                    {mode === "delete" ? "Excluir Evento" : "Editar Evento"}
                  </h2>
                </div>

                <div className={styles.scopeBox}>
                  <span className={styles.scopeLabel}>
                    <Repeat className={styles.iconSm} /> Aplicar a:
                  </span>
                  <div className={styles.radioGroup}>
                    <label
                      className={`${styles.radioCard} ${scope === "single" ? styles.radioCardActive : styles.radioCardInactive}`}
                    >
                      <input
                        type="radio"
                        name="scope"
                        value="single"
                        checked={scope === "single"}
                        onChange={() => setScope("single")}
                        className={styles.hiddenRadio}
                      />
                      <span className={styles.radioText}>Apenas este</span>
                    </label>
                    <label
                      className={`${styles.radioCard} ${scope === "all" ? styles.radioCardActive : styles.radioCardInactive}`}
                    >
                      <input
                        type="radio"
                        name="scope"
                        value="all"
                        checked={scope === "all"}
                        onChange={() => setScope("all")}
                        className={styles.hiddenRadio}
                      />
                      <span className={styles.radioText}>Todos da série</span>
                    </label>
                  </div>
                  <p className={styles.scopeDesc}>
                    {scope === "single"
                      ? `Apenas o evento do dia ${new Date(event.start).toLocaleDateString()} será afetado.`
                      : "Todos os eventos futuros e passados com este título serão afetados."}
                  </p>
                </div>

                {mode === "edit" && (
                  <motion.div
                    className={styles.formSection}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.inputGroup}>
                      <Label htmlFor="edit-title">Título</Label>
                      <Input
                        id="edit-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.inputCustom}
                      />
                    </div>
                    <div className={styles.grid2}>
                      <div className={styles.inputGroup}>
                        <Label className={styles.textXs}>Início</Label>
                        <Input
                          type="datetime-local"
                          value={start}
                          onChange={(e) => setStart(e.target.value)}
                          className={`${styles.textXs} ${styles.inputCustom}`}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <Label className={styles.textXs}>Término</Label>
                        <Input
                          type="datetime-local"
                          value={end}
                          onChange={(e) => setEnd(e.target.value)}
                          className={`${styles.textXs} ${styles.inputCustom}`}
                        />
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <Label
                        htmlFor="edit-rem"
                        className={styles.labelWithIcon}
                      >
                        <Bell className={styles.iconXs} /> Lembrete
                      </Label>
                      <select
                        id="edit-rem"
                        value={reminderMinutes}
                        onChange={(e) =>
                          setReminderMinutes(Number(e.target.value))
                        }
                        className={styles.select}
                      >
                        <option value={0}>Sem lembrete</option>
                        <option value={5}>5 minutos antes</option>
                        <option value={15}>15 minutos antes</option>
                        <option value={30}>30 minutos antes</option>
                        <option value={60}>1 hora antes</option>
                        <option value={120}>2 horas antes</option>
                        <option value={1440}>1 dia antes</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {mode === "delete" && (
                  <motion.div
                    className={styles.warningBox}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <AlertCircle className={styles.warningIcon} />
                    <p className={styles.warningText}>
                      Tem certeza? Esta ação não pode ser desfeita.
                    </p>
                  </motion.div>
                )}

                <div className={styles.footer}>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className={styles.btnCancel}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className={`${styles.btnConfirm} ${mode === "delete" ? styles.btnConfirmDelete : styles.btnConfirmEdit}`}
                  >
                    Confirmar
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
