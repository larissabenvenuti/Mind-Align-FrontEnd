// types/index.ts

// 1. Autenticação
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

// 2. Calendário
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  reminderMinutes?: number;
  repeat?: 'weekly' | 'monthly';
}

// 3. Tags
export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
}

// 4. Tarefas
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string | null;
  createdAt: string;
  userId: string;
  tags: Tag[];
}

// 5. Notas
export interface Note {
  id: string;
  content: string;
  date: string;
  userId: string;
}

// 6. Hábitos
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

// 6. Atividade Recente (usado no Dashboard)
export interface ActivityItem {
  id: string;
  type: "event" | "note" | "habit" | "task";
  content: string;
  date: string;
}

// 7. Erros da API (compartilhado por todos os serviços)
export interface ApiError {
  error: string;
  message?: string;
}