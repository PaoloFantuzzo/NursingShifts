import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CalendarHeader from "@/components/calendar-header";
import CalendarGrid from "@/components/calendar-grid";
import ShiftSelectorModal from "@/components/shift-selector-modal";
import SettingsModal from "@/components/settings-modal";
import ShiftDetails from "@/components/shift-details";
import { type Shift, type Settings } from "@shared/schema";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedDayForDetails, setSelectedDayForDetails] = useState<Date | null>(null);

  const { data: shifts = [], refetch: refetchShifts } = useQuery<Shift[]>({
    queryKey: ['/api/shifts', currentDate.getFullYear(), currentDate.getMonth() + 1],
    queryFn: async () => {
      const response = await fetch(`/api/shifts/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shifts');
      }
      return await response.json();
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDayForDetails(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDayForDetails(null);
  };

  const handleDayLongPress = (date: Date) => {
    setSelectedDay(date);
    setShowShiftModal(true);
  };

  const handleDayShortPress = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    

    
    const hasShift = shifts.some(shift => shift.date === dateString);
    
    if (hasShift) {
      setSelectedDayForDetails(date);
    }
  };

  const handleShiftSaved = () => {
    setShowShiftModal(false);
    setSelectedDay(null);
    // Force immediate refetch
    setTimeout(() => {
      refetchShifts();
    }, 100);
  };

  const handleShiftDeleted = () => {
    setShowShiftModal(false);
    setSelectedDay(null);
    setSelectedDayForDetails(null);
    setTimeout(() => {
      refetchShifts();
    }, 100);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--ios-bg)' }}>
      <CalendarHeader
        currentDate={currentDate}
        shifts={shifts}
        settings={settings}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onOpenSettings={() => setShowSettingsModal(true)}
      />
      
      <CalendarGrid
        currentDate={currentDate}
        shifts={shifts}
        onDayLongPress={handleDayLongPress}
        onDayShortPress={handleDayShortPress}
      />
      
      {selectedDayForDetails && (
        <ShiftDetails
          date={selectedDayForDetails}
          shifts={shifts}
          settings={settings}
        />
      )}

      <ShiftSelectorModal
        isOpen={showShiftModal}
        selectedDay={selectedDay}
        settings={settings}
        onClose={() => setShowShiftModal(false)}
        onShiftSaved={handleShiftSaved}
        onShiftDeleted={handleShiftDeleted}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        settings={settings}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}
