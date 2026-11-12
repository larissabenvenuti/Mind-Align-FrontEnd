"use client";

import { useEffect, useState } from "react";

import { api } from "../../../lib/api";
import { toast } from "../../../lib/toast";
import { Button } from "../../../components/ui/Button/Button";
import { Label } from "../../../components/ui/Label/Label";
import NotificationToggle from "./NotificationToggle";

import styles from "../Settings.module.scss";

interface NotifPrefs {
  eventReminders: boolean;
  dailyTaskSummary: boolean;
  habitReminders: boolean;
  reminderMinutesBefore: number;
}

const defaultNotifPrefs: NotifPrefs = {
  eventReminders: true,
  dailyTaskSummary: true,
  habitReminders: true,
  reminderMinutesBefore: 15,
};

export default function NotificationSettings() {
  const [loading, setLoading] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(defaultNotifPrefs);

  useEffect(() => {
    const loadNotificationPrefs = async () => {
      try {
        setLoading(true);

        const data = await api.get<NotifPrefs>(
          "/api/notifications/preferences",
        );

        setNotifPrefs({
          eventReminders: data.eventReminders,
          dailyTaskSummary: data.dailyTaskSummary,
          habitReminders: data.habitReminders,
          reminderMinutesBefore: data.reminderMinutesBefore,
        });
      } catch {
        toast.error("Erro ao carregar preferências de notificação.");
      } finally {
        setLoading(false);
      }
    };

    loadNotificationPrefs();
  }, []);

  const handleUpdateNotifications = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      await api.put("/api/notifications/preferences", notifPrefs);

      toast.success("Preferências salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar preferências.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleUpdateNotifications}
      className={styles.formCard}
    >
      <h2 className={styles.cardTitle}>
        Preferências de Notificações Push
      </h2>

      <NotificationToggle
        label="Lembretes de Eventos do Calendário"
        checked={notifPrefs.eventReminders}
        onChange={(eventReminders) =>
          setNotifPrefs({ ...notifPrefs, eventReminders })
        }
      />
      <NotificationToggle
        label="Lembretes de Hábitos Diários"
        checked={notifPrefs.habitReminders}
        onChange={(habitReminders) =>
          setNotifPrefs({ ...notifPrefs, habitReminders })
        }
      />
      <NotificationToggle
        label="Resumo Diário de Tarefas"
        checked={notifPrefs.dailyTaskSummary}
        onChange={(dailyTaskSummary) =>
          setNotifPrefs({ ...notifPrefs, dailyTaskSummary })
        }
      />

      <div className={styles.inputGroup} style={{ marginTop: "1rem" }}>
        <Label htmlFor="remindBefore">
          Tempo Padrão de Lembrete (Eventos)
        </Label>
        <select
          id="remindBefore"
          value={notifPrefs.reminderMinutesBefore}
          onChange={(e) =>
            setNotifPrefs({
              ...notifPrefs,
              reminderMinutesBefore: Number(e.target.value),
            })
          }
          className={styles.select}
        >
          <option value={5}>5 minutos antes</option>
          <option value={15}>15 minutos antes</option>
          <option value={30}>30 minutos antes</option>
          <option value={60}>1 hora antes</option>
          <option value={1440}>1 dia antes</option>
        </select>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className={styles.submitBtn}
      >
        {loading ? "Salvando..." : "Salvar Preferências"}
      </Button>
    </form>
  );
}
