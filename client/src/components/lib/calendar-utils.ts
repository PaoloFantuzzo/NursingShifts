import { type ShiftTimes, type ShiftType } from "@shared/schema";

export function getMonthName(month: number): string {
  const months = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];
  return months[month];
}

export function getDayName(day: number): string {
  const days = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  return days[day];
}

export function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Get first day of week (Monday = 1, Sunday = 0)
  let firstDayOfWeek = firstDay.getDay();
  if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Convert Sunday to 7
  
  const days = [];
  
  // Add previous month days
  const prevMonth = new Date(year, month, 0);
  const daysInPrevMonth = prevMonth.getDate();
  for (let i = firstDayOfWeek - 2; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }
  
  // Add current month days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      day,
      isCurrentMonth: true,
      date: new Date(year, month, day),
    });
  }
  
  // Add next month days to complete the grid (42 days total = 6 weeks)
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month + 1, day),
    });
  }
  
  return days;
}

export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getWeekDates(date: Date): Date[] {
  const startOfWeek = new Date(date);
  const dayOfWeek = date.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as start of week
  startOfWeek.setDate(date.getDate() + diff);
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(startOfWeek);
    weekDate.setDate(startOfWeek.getDate() + i);
    weekDates.push(weekDate);
  }
  
  return weekDates;
}

export function calculateShiftHours(type: ShiftType, shiftTimes: ShiftTimes): number {
  return shiftTimes[type].hours;
}

export function getShiftDisplayName(type: ShiftType): string {
  const names = {
    mattina: "Turno Mattina",
    pomeriggio: "Turno Pomeriggio", 
    notte: "Turno Notte",
    ricoveri: "Turno Ricoveri"
  };
  return names[type];
}

export function getShiftTimeRange(type: ShiftType, shiftTimes: ShiftTimes): string {
  const config = shiftTimes[type];
  return `${config.start} - ${config.end} (${config.hours} ore)`;
}

export function getShiftColor(type: ShiftType): string {
  const colors = {
    mattina: "var(--shift-mattina)",
    pomeriggio: "var(--shift-pomeriggio)",
    notte: "var(--shift-notte)",
    ricoveri: "var(--shift-ricoveri)"
  };
  return colors[type];
}
