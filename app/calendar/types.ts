export interface CalendarEventInput {
  id?: string;
  title: string;
  start: string;
  end: string;
  reminderMinutes?: number;
  repeat?: string;
}

export interface CalendarEvent extends CalendarEventInput {
  id: string;
}
