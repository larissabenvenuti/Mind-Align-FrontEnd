export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  booted: boolean;
}
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  reminderMinutes?: number;
  repeat?: 'weekly' | 'monthly';
}
export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
}
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string | null;
  createdAt: string;
  userId: string;
  tags: Tag[];
}
export interface Note {
  id: string;
  content: string;
  date: string;
  userId: string;
}
export interface Habit {
  id: string;
  name: string;
  weekData: boolean[];
  currentStreak: number;
  longestStreak: number;
  lastResetDate: string;
  createdAt: string;
  userId: string;
}
export interface ActivityItem {
  id: string;
  type: "event" | "note" | "habit" | "task";
  content: string;
  date: string;
}
export interface ApiError {
  error: string;
  message?: string;
}