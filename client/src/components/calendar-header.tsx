import { ChevronLeft, ChevronRight, Settings as SettingsIcon, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getMonthName, getWeekDates, calculateShiftHours } from "@/lib/calendar-utils";
import { type Shift, type Settings, type ShiftTimes } from "@shared/schema";

interface CalendarHeaderProps {
  currentDate: Date;
  shifts: Shift[];
  settings?: Settings;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onOpenSettings: () => void;
}

export default function CalendarHeader({
  currentDate,
  shifts,
  settings,
  onPreviousMonth,
  onNextMonth,
  onOpenSettings,
}: CalendarHeaderProps) {
  const monthName = getMonthName(currentDate.getMonth());
  const year = currentDate.getFullYear();
  
  // Calculate weekly and monthly hours
  const shiftTimes: ShiftTimes = settings?.shiftTimes 
    ? JSON.parse(settings.shiftTimes)
    : {
        mattina: { start: "07:00", end: "14:00", hours: 7 },
        pomeriggio: { start: "14:00", end: "22:00", hours: 8 },
        notte: { start: "22:00", end: "07:00", hours: 9 },
        ricoveri: { start: "13:00", end: "19:00", hours: 6 }
      };

  const weeklyTargetHours = settings?.weeklyTargetHours || 36;
  
  // Get current week dates
  const weekDates = getWeekDates(new Date());
  const weekShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    return weekDates.some(weekDate => 
      weekDate.toISOString().split('T')[0] === shift.date
    );
  });

  const weeklyHours = weekShifts.reduce((total, shift) => {
    return total + calculateShiftHours(shift.type as any, shiftTimes);
  }, 0);

  const monthlyHours = shifts.reduce((total, shift) => {
    return total + calculateShiftHours(shift.type as any, shiftTimes);
  }, 0);

  const weeklyProgress = Math.min((weeklyHours / weeklyTargetHours) * 100, 100);

  return (
    <div className="bg-[var(--ios-surface)] border-b border-[var(--ios-border)] px-4 py-4 safe-area-top">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onPreviousMonth}
          className="haptic-button text-[var(--ios-text)] hover:bg-[var(--ios-border)]"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl font-semibold text-center text-[var(--ios-text)]">
          {monthName} {year}
        </h1>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onNextMonth}
          className="haptic-button text-[var(--ios-text)] hover:bg-[var(--ios-border)]"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Hours Summary */}
      <div className="mt-4 bg-[var(--ios-bg)] rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm" style={{ color: 'var(--ios-text-secondary)' }}>
              Ore Questa Settimana
            </p>
            <p className="text-2xl font-bold">
              <span style={{ color: 'var(--shift-mattina)' }}>{weeklyHours}</span>
              <span style={{ color: 'var(--ios-text-secondary)' }}>/{weeklyTargetHours}</span>
            </p>
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--ios-text-secondary)' }}>
              Ore Totali Mese
            </p>
            <p className="text-xl font-semibold text-[var(--ios-text)]">{monthlyHours}h</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="haptic-button bg-[var(--ios-border)] hover:bg-[var(--ios-border)]/80 text-[var(--ios-text)]"
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
              className="haptic-button bg-[var(--ios-border)] hover:bg-[var(--ios-border)]/80 text-[var(--ios-text)]"
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 bg-[var(--ios-border)] rounded-full h-2 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300" 
            style={{ 
              width: `${weeklyProgress}%`,
              backgroundColor: 'var(--shift-mattina)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
