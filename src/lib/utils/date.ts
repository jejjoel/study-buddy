export function getRelativeDate(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export const isToday = (date: string) => date === getRelativeDate();
export const isTomorrow = (date: string) => date === getRelativeDate(1);
