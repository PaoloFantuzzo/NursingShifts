import { getCalendarDays, formatDateForAPI } from "@/lib/calendar-utils";
import { isItalianHoliday, isWeekend } from "@/lib/italian-holidays";
import { useLongPress } from "@/hooks/use-long-press";
import { type Shift } from "@shared/schema";

interface CalendarGridProps {
  currentDate: Date;
  shifts: Shift[];
  onDayLongPress: (date: Date) => void;
  onDayShortPress: (date: Date) => void;
}

export default function CalendarGrid({
  currentDate,
  shifts,
  onDayLongPress,
  onDayShortPress,
}: CalendarGridProps) {
  const calendarDays = getCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  const dayHeaders = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  const getShiftForDate = (date: Date) => {
    const dateString = formatDateForAPI(date);
    return shifts.find(shift => shift.date === dateString);
  };

  const getDayTextColor = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return "var(--ios-text-secondary)";
    

    
    if (isWeekend(date) || isItalianHoliday(date)) return "var(--ios-red)";
    return "var(--ios-text)";
  };

  const CalendarDay = ({ day, date, isCurrentMonth }: { day: number; date: Date; isCurrentMonth: boolean }) => {
    const shift = getShiftForDate(date);
    const dateString = formatDateForAPI(date);
    

    
    const longPressHandlers = useLongPress({
      onLongPress: () => onDayLongPress(date),
      onShortPress: () => {
        onDayShortPress(date);
      },
    });

    return (
      <div
        className={`calendar-day bg-[var(--ios-surface)] rounded-lg flex items-center justify-center relative cursor-pointer ${
          !isCurrentMonth ? 'opacity-50' : ''
        }`}
        {...longPressHandlers}
      >
        <span style={{ color: getDayTextColor(date, isCurrentMonth) }}>
          {day}
        </span>
        {shift && (
          <div 
            className="shift-indicator"
            style={{ borderColor: `var(--shift-${shift.type})` }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayHeaders.map((day, index) => (
          <div 
            key={day} 
            className="text-center text-sm font-medium py-2"
            style={{ 
              color: index >= 5 ? 'var(--ios-red)' : 'var(--ios-text-secondary)' 
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayData, index) => (
          <CalendarDay
            key={index}
            day={dayData.day}
            date={dayData.date}
            isCurrentMonth={dayData.isCurrentMonth}
          />
        ))}
      </div>
    </div>
  );
}
