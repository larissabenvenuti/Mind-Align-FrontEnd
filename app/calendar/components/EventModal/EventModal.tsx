"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../components/ui/Button/Button";
import { Input } from "../../../../components/ui/Input/Input";
import { Label } from "../../../../components/ui/Label/Label";
import { X, Calendar, Clock, Repeat, Bell } from "lucide-react";
import styles from "./event-modal.module.scss";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: any) => void;
  currentDate?: Date | null;
  existingEvent?: any;
  defaultReminder?: number; // Recebendo a configuração!
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  currentDate,
  existingEvent,
  defaultReminder = 15,
}: EventModalProps) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [repeat, setRepeat] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState(defaultReminder);

  const toLocalISOString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (isOpen) {
      if (existingEvent) {
        setTitle(existingEvent.title || "");
        setStart(toLocalISOString(new Date(existingEvent.start)));
        setEnd(toLocalISOString(new Date(existingEvent.end)));
        setRepeat(existingEvent.repeat || "");
        // Se já existe um valor no evento usa ele, senão usa o default
        setReminderMinutes(existingEvent.reminderMinutes ?? defaultReminder);
      } else if (currentDate) {
        const now = new Date(currentDate);
        if (now.getHours() === 0 && now.getMinutes() === 0) {
          const timeNow = new Date();
          now.setHours(timeNow.getHours(), timeNow.getMinutes());
        }

        const oneHourLater = new Date(now);
        oneHourLater.setHours(oneHourLater.getHours() + 1);

        setStart(toLocalISOString(now));
        setEnd(toLocalISOString(oneHourLater));
        setTitle("");
        setRepeat("");
        // Ao abrir vazio, usa o padrão do Settings!
        setReminderMinutes(defaultReminder);
      }
    }
  }, [isOpen, currentDate, existingEvent, defaultReminder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate >= endDate) {
      alert("A data de término deve ser maior que a de início.");
      return;
    }

    onSave({
      id: existingEvent?.id,
      title: title.trim(),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      repeat: repeat || undefined,
      reminderMinutes: Number(reminderMinutes),
    });
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="global-orb-top-right" />
            <div className="global-orb-bottom-left" />

            <Button
              onClick={onClose}
              className={styles.closeBtn}
              aria-label="Fechar modal"
            >
              <X className={styles.iconBase} />
            </Button>

            <div className={styles.header}>
              <span className={styles.iconWrapper}>
                <Calendar className={styles.headerIcon} />
              </span>
              <h2 className={styles.title}>
                {existingEvent ? "Editar Evento" : "Novo Evento"}
              </h2>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <Label htmlFor="title" className={styles.label}>
                  Título do evento
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Reunião de Projeto"
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.grid2}>
                <div className={styles.inputGroup}>
                  <Label htmlFor="start" className={styles.labelWithIcon}>
                    <Clock className={styles.smallIcon} /> Início
                  </Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <Label htmlFor="end" className={styles.labelWithIcon}>
                    <Clock className={styles.smallIcon} /> Término
                  </Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.inputGroup}>
                  <Label htmlFor="reminder" className={styles.labelWithIcon}>
                    <Bell className={styles.bellIcon} /> Lembrete
                  </Label>
                  <select
                    id="reminder"
                    value={reminderMinutes}
                    onChange={(e) => setReminderMinutes(Number(e.target.value))}
                    className={styles.select}
                  >
                    <option value={0}>Sem lembrete</option>
                    <option value={5}>5 minutos antes</option>
                    <option value={15}>15 minutos antes</option>
                    <option value={30}>30 minutos antes</option>
                    <option value={60}>1 hora antes</option>
                    <option value={1440}>1 dia antes</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <Label htmlFor="repeat" className={styles.labelWithIcon}>
                    <Repeat className={styles.repeatIcon} /> Repetição
                  </Label>
                  <select
                    id="repeat"
                    value={repeat}
                    onChange={(e) => setRepeat(e.target.value)}
                    disabled={!!existingEvent}
                    className={styles.select}
                  >
                    <option value="">Não repetir</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>
              </div>

              <div className={styles.footer}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className={styles.btnCancel}
                >
                  Cancelar
                </Button>
                <Button type="submit" className={styles.btnSubmit}>
                  {existingEvent ? "Salvar alterações" : "Criar evento"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
