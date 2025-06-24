import { getShiftDisplayName, getShiftTimeRange } from "@/lib/calendar-utils";
import { type Shift, type Settings, type ShiftTimes } from "@shared/schema";

interface ShiftDetailsProps {
  date: Date;
  shifts: Shift[];
  settings?: Settings;
}

export default function ShiftDetails({ date, shifts, settings }: ShiftDetailsProps) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  const shift = shifts.find(s => s.date === dateString);

  if (!shift) return null;

  const shiftTimes: ShiftTimes = settings?.shiftTimes 
    ? JSON.parse(settings.shiftTimes)
    : {
        mattina: { start: "07:00", end: "14:00", hours: 7 },
        pomeriggio: { start: "14:00", end: "22:00", hours: 8 },
        notte: { start: "22:00", end: "07:00", hours: 9 },
        ricoveri: { start: "13:00", end: "19:00", hours: 6 }
      };

  const dayName = date.toLocaleDateString('it-IT', { 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="px-4 pb-4">
      <div className="bg-[var(--ios-surface)] rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-2 text-[var(--ios-text)]">
          Giorno {dayName}
        </h3>
        <div className="flex items-center">
          <div 
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: `var(--shift-${shift.type})` }}
          />
          <div>
            <p className="font-medium text-[var(--ios-text)]">
              {getShiftDisplayName(shift.type as any)}
            </p>
            <p className="text-sm" style={{ color: 'var(--ios-text-secondary)' }}>
              {getShiftTimeRange(shift.type as any, shiftTimes)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
