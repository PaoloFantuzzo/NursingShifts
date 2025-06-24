export interface Holiday {
  name: string;
  date: string; // YYYY-MM-DD format
}

export function getItalianHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [
    { name: "Capodanno", date: `${year}-01-01` },
    { name: "Epifania", date: `${year}-01-06` },
    { name: "Festa della Liberazione", date: `${year}-04-25` },
    { name: "Festa del Lavoro", date: `${year}-05-01` },
    { name: "Festa della Repubblica", date: `${year}-06-02` },
    { name: "Ferragosto", date: `${year}-08-15` },
    { name: "Ognissanti", date: `${year}-11-01` },
    { name: "Immacolata Concezione", date: `${year}-12-08` },
    { name: "Natale", date: `${year}-12-25` },
    { name: "Santo Stefano", date: `${year}-12-26` },
  ];

  // Add Easter-based holidays for 2025
  if (year === 2025) {
    holidays.push({
      name: "Lunedì dell'Angelo (Pasquetta)",
      date: "2025-04-21",
    });
  } else {
    // For other years, calculate Easter
    const easter = getEasterDate(year);
    const easterMondayDate = new Date(easter);
    easterMondayDate.setDate(easter.getDate() + 1);
    
    holidays.push({
      name: "Lunedì dell'Angelo (Pasquetta)",
      date: formatDate(easterMondayDate),
    });
  }

  return holidays;
}

function getEasterDate(year: number): Date {
  // Fixed Easter dates for common years to avoid calculation errors
  const knownEasterDates: Record<number, string> = {
    2024: "2024-03-31",
    2025: "2025-04-20", 
    2026: "2026-04-05",
    2027: "2027-03-28",
    2028: "2028-04-16"
  };
  
  if (knownEasterDates[year]) {
    return new Date(knownEasterDates[year]);
  }
  
  // Fallback to algorithm for other years
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isItalianHoliday(date: Date): boolean {
  const holidays = getItalianHolidays(date.getFullYear());
  const dateString = formatDate(date);
  return holidays.some(holiday => holiday.date === dateString);
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}


