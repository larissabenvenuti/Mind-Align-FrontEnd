"use client";

import {
  startTransition,
  useEffect,
  useState,
} from "react";
import type { EventClickArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Sparkles,
  Plus,
  ArrowLeft,
} from "lucide-react";
import EventModal from "./components/EventModal/EventModal";
import EventDetailsModal from "./components/EventModal/components/EventDetailsModal/EventDetailsModal";
import { BulkEditModal } from "./components/EventModal/components/BulkEditModal/BulkEditModal";
import CalendarViewCard from "./components/CalendarViewCard";
import NextEventCard from "./components/NextEventCard";
import { API_BASE_URL, api } from "../../lib/api";
import { toast } from "../../lib/toast";
import { useNotifications } from "../../hooks/useNotifications";
import styles from "./Calendar.module.scss";
import { Button } from "@/components/ui/Button/Button";
import type { CalendarEvent, CalendarEventInput } from "./types";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkInitialMode, setBulkInitialMode] = useState<"edit" | "delete">(
    "edit",
  );
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const [defaultReminder, setDefaultReminder] = useState<number>(15);
  const { scheduleEventNotification } = useNotifications();

  const getNextEvent = () => {
    const now = new Date();
    const futureEvents = events
      .filter((e) => new Date(e.start) > now)
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
    return futureEvents[0] || null;
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const eventId = params.get("eventId");
      if (eventId) {
        const target = events.find((e) => e.id === eventId);
        if (target) {
          startTransition(() => {
            setSelectedEvent(target);
            setIsViewModalOpen(true);
          });
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    }
  }, [events]);

  async function loadEvents() {
    try {
      setIsLoading(true);
      const [eventsData, prefsData] = await Promise.all([
        api.get<CalendarEvent[]>(`/api/calendar`),
        api
          .get<{ reminderMinutesBefore?: number }>(
            `/api/notifications/preferences`,
          )
          .catch(() => ({ reminderMinutesBefore: 15 })),
      ]);

      setEvents(eventsData);
      setDefaultReminder(prefsData.reminderMinutesBefore || 15);
      eventsData.forEach((event) => scheduleEventNotification(event));
    } catch {
      toast.error("Erro ao carregar dados do calendário");
    } finally {
      setIsLoading(false);
    }
  }

  function handleDateClick(info: DateClickArg) {
    setCurrentDate(info.date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  }

  function handleEventClick(info: EventClickArg) {
    const clicked = events.find((e) => e.id === info.event.id);
    if (clicked) {
      setSelectedEvent(clicked);
      setIsViewModalOpen(true);
    }
  }

  function handleEditEventRequest(event: CalendarEvent) {
    setIsViewModalOpen(false);
    setSelectedEvent(event);
    const isRecurring =
      event.repeat || events.filter((e) => e.title === event.title).length > 1;
    if (isRecurring) {
      setBulkInitialMode("edit");
      setIsBulkModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  }

  async function handleSaveSimpleEvent(eventData: CalendarEventInput) {
    try {
      if (eventData.id) {
        await api.put(`/api/calendar/${eventData.id}`, eventData);
        toast.success("Evento atualizado!");
      } else {
        await api.post(`/api/calendar`, eventData);
        if (eventData.repeat) {
          const origStart = new Date(eventData.start);
          const origEnd = new Date(eventData.end);
          for (let i = 1; i <= 5; i++) {
            const startCopy = new Date(origStart);
            const endCopy = new Date(origEnd);
            if (eventData.repeat === "weekly") {
              startCopy.setDate(startCopy.getDate() + 7 * i);
              endCopy.setDate(endCopy.getDate() + 7 * i);
            } else if (eventData.repeat === "monthly") {
              startCopy.setMonth(startCopy.getMonth() + i);
              endCopy.setMonth(endCopy.getMonth() + i);
            }
            await api.post(`/api/calendar`, {
              ...eventData,
              start: startCopy.toISOString(),
              end: endCopy.toISOString(),
            });
          }
        }
        toast.success("Evento criado!");
      }

      await loadEvents();
      setIsModalOpen(false);
      setSelectedEvent(null);
      setCurrentDate(null);
    } catch {
      toast.error("Erro ao salvar evento");
    }
  }

  async function handleBulkUpdateSingle(
    updatedEvent: CalendarEventInput & { id: string },
  ) {
    try {
      await api.put(`/api/calendar/${updatedEvent.id}`, updatedEvent);

      await loadEvents();
      toast.success("Evento atualizado!");
      setIsBulkModalOpen(false);
      setSelectedEvent(null);
    } catch {
      toast.error("Erro ao atualizar evento.");
    }
  }

  async function handleBulkUpdateAll(updatedEvent: CalendarEventInput) {
    if (!selectedEvent) return;
    try {
      const oldTitle = selectedEvent.title;
      const newTitle = updatedEvent.title;
      const oldStart = new Date(selectedEvent.start).getTime();
      const newStart = new Date(updatedEvent.start).getTime();
      const response = await fetch(
        `${API_BASE_URL}/api/calendar/bulk/${encodeURIComponent(oldTitle)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newTitle,
            startOffset: newStart - oldStart,
            endOffset:
              new Date(updatedEvent.end).getTime() -
              new Date(selectedEvent.end).getTime(),
          }),
        },
      );
      if (!response.ok) throw new Error();

      await loadEvents();
      toast.success("Série atualizada!");
      setIsBulkModalOpen(false);
      setSelectedEvent(null);
    } catch {
      toast.error("Erro ao atualizar série.");
    }
  }

  async function handleDeleteSingle(id: string) {
    try {
      await api.delete(`/api/calendar/${id}`);

      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      toast.success("Evento excluído!");
      setIsViewModalOpen(false);
      setIsBulkModalOpen(false);
      setSelectedEvent(null);
    } catch {
      toast.error("Erro ao excluir evento");
    }
  }

  async function handleDeleteAll(title: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/calendar/bulk/${encodeURIComponent(title)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (!response.ok) throw new Error();

      await loadEvents();
      toast.success("Série excluída!");
      setIsBulkModalOpen(false);
      setIsViewModalOpen(false);
      setSelectedEvent(null);
    } catch {
      toast.error("Erro ao excluir série.");
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
          animate={{ rotate: [0, 14] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="global-orb-bottom"
          animate={{ rotate: [0, 14] }}
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
        <div className={styles.headerGroup}>
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
              <div className={styles.titleWrapper}>
                <motion.span
                  className={styles.iconBox}
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <CalendarIcon className={styles.mainIcon} />
                  <Sparkles className={styles.sparkleIcon} />
                </motion.span>
                <div>
                  <h1 className={styles.title}>Calendário</h1>
                  <p className={styles.subtitle}>
                    Organize seus eventos e rotina.
                  </p>
                </div>
              </div>

              <div className={styles.actions}>
                <Button
                  onClick={() => {
                    setCurrentDate(new Date());
                    setIsModalOpen(true);
                  }}
                  className={styles.btnNew}
                >
                  <Plus className={styles.plusIcon} />
                  <span className={styles.btnTextMobile}>Novo</span>
                  <span className={styles.btnTextDesktop}>Criar Evento</span>
                </Button>
              </div>
            </div>
          </header>

          <div className={styles.calendarGrid}>
            {!isLoading && (
              <NextEventCard
                event={getNextEvent()}
                onViewEvent={(event) => {
                  setSelectedEvent(event);
                  setIsViewModalOpen(true);
                }}
              />
            )}
            <CalendarViewCard
              view="month"
              events={events}
              isLoading={isLoading}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
            />
            <CalendarViewCard
              view="day"
              events={events}
              isLoading={isLoading}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
            />
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        onSave={handleSaveSimpleEvent}
        currentDate={currentDate}
        existingEvent={selectedEvent}
        defaultReminder={defaultReminder}
      />

      <EventDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedEvent(null);
        }}
        eventDetails={selectedEvent || {}}
        onSave={handleEditEventRequest}
        onDelete={(id) => {
          const event = events.find((e) => e.id === id);
          const isRecurring =
            event?.repeat ||
            events.filter((e) => e.title === event?.title).length > 1;
          if (isRecurring && event) {
            setIsViewModalOpen(false);
            setSelectedEvent(event);
            setBulkInitialMode("delete");
            setIsBulkModalOpen(true);
          } else {
            handleDeleteSingle(id);
          }
        }}
      />

      <BulkEditModal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        initialMode={bulkInitialMode}
        onUpdateSingle={handleBulkUpdateSingle}
        onUpdateAll={handleBulkUpdateAll}
        onDeleteSingle={handleDeleteSingle}
        onDeleteAll={handleDeleteAll}
        defaultReminder={defaultReminder}
      />
    </motion.section>
  );
}
