"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import ptLocale from "@fullcalendar/core/locales/pt-br";
import { AnimatePresence, motion } from "framer-motion";

import type { CalendarEvent } from "../types";
import styles from "../Calendar.module.scss";

interface CalendarViewCardProps {
  view: "month" | "day";
  events: CalendarEvent[];
  isLoading: boolean;
  onDateClick: (info: DateClickArg) => void;
  onEventClick: (info: EventClickArg) => void;
}

function CalendarSkeleton() {
  return (
    <motion.div
      className={styles.skeletonContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonGrid}>
        {[...Array(35)].map((_, index) => (
          <motion.div
            key={index}
            className={styles.skeletonCell}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: index * 0.02,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function CalendarViewCard({
  view,
  events,
  isLoading,
  onDateClick,
  onEventClick,
}: CalendarViewCardProps) {
  const isDayView = view === "day";

  return (
    <motion.article
      className={styles.calendarCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: isDayView ? 0.2 : 0.1,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardIndicatorWrapper}>
          <div
            className={`${styles.indicator} ${
              isDayView ? styles.indicatorSecondary : styles.indicatorPrimary
            }`}
          />
          <h2 className={styles.cardTitle}>
            {isDayView ? "Visão Diária" : "Visão Mensal"}
          </h2>
        </div>
      </div>

      <div className={styles.cardBody}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <CalendarSkeleton key={`skeleton-${view}`} />
          ) : (
            <motion.div
              key={`calendar-${view}`}
              className={styles.fcWrapper}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <FullCalendar
                plugins={
                  isDayView
                    ? [timeGridPlugin, interactionPlugin]
                    : [dayGridPlugin, interactionPlugin]
                }
                initialView={isDayView ? "timeGridDay" : "dayGridMonth"}
                locale={ptLocale}
                headerToolbar={{
                  left: "prev,next",
                  center: "title",
                  right: "today",
                }}
                events={events}
                editable={false}
                selectable
                dateClick={onDateClick}
                eventClick={onEventClick}
                height="auto"
                contentHeight="auto"
                allDaySlot={isDayView ? false : undefined}
                slotMinTime={isDayView ? "06:00:00" : undefined}
                slotMaxTime={isDayView ? "23:00:00" : undefined}
                dayHeaderFormat={
                  isDayView
                    ? { weekday: "long", day: "numeric" }
                    : { weekday: "short" }
                }
                slotLabelFormat={
                  isDayView
                    ? {
                        hour: "2-digit",
                        minute: "2-digit",
                        omitZeroMinute: false,
                        meridiem: false,
                      }
                    : undefined
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
