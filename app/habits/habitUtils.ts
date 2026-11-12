export const DAYS_OF_WEEK = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function getHabitProgress(weekData: boolean[]) {
  const completedDays = weekData.filter(Boolean).length;

  return {
    completedDays,
    completionRate: Math.round((completedDays / 7) * 100),
  };
}
