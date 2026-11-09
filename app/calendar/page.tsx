"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt-br";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Sparkles,
  Plus,
  ArrowLeft,
} from "lucide-react";
import EventModal from "./components/EventModal/EventModal";
import EventDetailsModal from "./components/EventModal/components/EventDetailsModal/EventDetailsModal";
import { BulkEditModal } from "./components/EventModal/components/BulkEditModal/BulkEditModal";
import { API_BASE_URL, api } from "../../lib/api";
import { toast } from "../../lib/toast";
import { useNotifications } from "../../hooks/useNotifications";
import styles from "./Calendar.module.scss";
import { Button } from "@/components/ui/Button/Button";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  reminderMinutes?: number;
  repeat?: string;
}

const CalendarSkeleton = () => (
  <motion.div
    className={styles.skeletonContainer}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className={styles.skeletonTitle} />
    <div className={styles.skeletonGrid}>
      {[...Array(35)].map((_, i) => (
        <motion.div
          key={i}
          className={styles.skeletonCell}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.02,
          }}
        />
      ))}
    </div>
  </motion.div>
);

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
          setSelectedEvent(target);
          setIsViewModalOpen(true);
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
          .get<any>(`/api/notifications/preferences`)
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

  function handleDateClick(info: any) {
    setCurrentDate(info.date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  }

  function handleEventClick(info: any) {
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

  async function handleSaveSimpleEvent(eventData: any) {
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

  async function handleBulkUpdateSingle(updatedEvent: any) {
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

  async function handleBulkUpdateAll(updatedEvent: any) {
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
              <motion.article
                className={styles.nextEventCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.05,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardIndicatorWrapper}>
                    <div
                      className={`${styles.indicator} ${styles.indicatorSuccess}`}
                    />
                    <h2 className={styles.cardTitle}>Próximo Evento</h2>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  {getNextEvent() ? (
                    <div className={styles.nextEventContent}>
                      <h3 className={styles.nextEventTitle}>
                        {getNextEvent()!.title}
                      </h3>
                      <p className={styles.nextEventTime}>
                        {new Date(getNextEvent()!.start).toLocaleString(
                          "pt-BR",
                          {
                            dateStyle: "long",
                            timeStyle: "short",
                          },
                        )}
                      </p>
                      <p className={styles.nextEventDuration}>
                        Duração:{" "}
                        {Math.round(
                          (new Date(getNextEvent()!.end).getTime() -
                            new Date(getNextEvent()!.start).getTime()) /
                            60000,
                        )}{" "}
                        minutos
                      </p>
                      <Button
                        onClick={() => {
                          setSelectedEvent(getNextEvent());
                          setIsViewModalOpen(true);
                        }}
                        className={styles.viewEventBtn}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  ) : (
                    <div className={styles.emptyEventState}>
                      <p>Nenhum evento agendado</p>
                    </div>
                  )}
                </div>
              </motion.article>
            )}

            <motion.article
              className={styles.calendarCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIndicatorWrapper}>
                  <div
                    className={`${styles.indicator} ${styles.indicatorPrimary}`}
                  />
                  <h2 className={styles.cardTitle}>Visão Mensal</h2>
                </div>
              </div>

              <div className={styles.cardBody}>
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <CalendarSkeleton key="skeleton-month" />
                  ) : (
                    <motion.div
                      key="calendar-month"
                      className={styles.fcWrapper}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        locale={ptLocale}
                        headerToolbar={{
                          left: "prev,next",
                          center: "title",
                          right: "today",
                        }}
                        events={events}
                        editable={false}
                        selectable
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        height="auto"
                        contentHeight="auto"
                        dayHeaderFormat={{ weekday: "short" }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.article>

            <motion.article
              className={styles.calendarCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIndicatorWrapper}>
                  <div
                    className={`${styles.indicator} ${styles.indicatorSecondary}`}
                  />
                  <h2 className={styles.cardTitle}>Visão Diária</h2>
                </div>
              </div>

              <div className={styles.cardBody}>
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <CalendarSkeleton key="skeleton-day" />
                  ) : (
                    <motion.div
                      key="calendar-day"
                      className={styles.fcWrapper}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FullCalendar
                        plugins={[timeGridPlugin, interactionPlugin]}
                        initialView="timeGridDay"
                        locale={ptLocale}
                        headerToolbar={{
                          left: "prev,next",
                          center: "title",
                          right: "today",
                        }}
                        events={events}
                        editable={false}
                        selectable
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        height="auto"
                        contentHeight="auto"
                        allDaySlot={false}
                        slotMinTime="06:00:00"
                        slotMaxTime="23:00:00"
                        dayHeaderFormat={{ weekday: "long", day: "numeric" }}
                        slotLabelFormat={{
                          hour: "2-digit",
                          minute: "2-digit",
                          omitZeroMinute: false,
                          meridiem: false,
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.article>
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
