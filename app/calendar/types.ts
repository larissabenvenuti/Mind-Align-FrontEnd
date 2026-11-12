export interface CalendarEventInput {
  id?: string;
  title: string;
  start: string;
  end: string;
  reminderMinutes?: number;
  repeat?: "weekly" | "monthly" | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  reminderMinutes: number;
  repeat: "weekly" | "monthly" | null;
  userId: string;
}
