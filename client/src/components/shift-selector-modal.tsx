import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Trash2, X, ChevronRight, Check } from "lucide-react";
import { getShiftDisplayName, getShiftTimeRange } from "@/lib/calendar-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Settings, type ShiftType, type ShiftTimes } from "@shared/schema";

interface ShiftSelectorModalProps {
  isOpen: boolean;
  selectedDay: Date | null;
  settings?: Settings;
  onClose: () => void;
  onShiftSaved: () => void;
  onShiftDeleted: () => void;
}

const shiftTypes: ShiftType[] = ['mattina', 'pomeriggio', 'notte', 'ricoveri'];

export default function ShiftSelectorModal({
  isOpen,
  selectedDay,
  settings,
  onClose,
  onShiftSaved,
  onShiftDeleted,
}: ShiftSelectorModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType | null>(null);

  // Reset selection when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setSelectedShiftType(null);
    }
  }, [isOpen]);

  const shiftTimes: ShiftTimes = settings?.shiftTimes 
    ? JSON.parse(settings.shiftTimes)
    : {
        mattina: { start: "07:00", end: "14:00", hours: 7 },
        pomeriggio: { start: "14:00", end: "22:00", hours: 8 },
        notte: { start: "22:00", end: "07:00", hours: 9 },
        ricoveri: { start: "13:00", end: "19:00", hours: 6 }
      };

  const createShiftMutation = useMutation({
    mutationFn: async (data: { date: string; type: ShiftType }) => {
      return await apiRequest('POST', '/api/shifts', data);
    },
    onSuccess: () => {
      toast({
        title: "Turno salvato",
        description: "Il turno è stato assegnato con successo.",
      });
      // Force complete refresh of shift data
      queryClient.invalidateQueries({ 
        queryKey: ['/api/shifts'],
        refetchType: 'all'
      });
      setSelectedShiftType(null);
      onShiftSaved();
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile salvare il turno.",
        variant: "destructive",
      });
    },
  });

  const deleteShiftMutation = useMutation({
    mutationFn: async (date: string) => {
      return await apiRequest('DELETE', `/api/shifts/date/${date}`);
    },
    onSuccess: () => {
      toast({
        title: "Turno rimosso",
        description: "Il turno è stato rimosso con successo.",
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/shifts'],
        refetchType: 'all'
      });
      setSelectedShiftType(null);
      onShiftDeleted();
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile rimuovere il turno.",
        variant: "destructive",
      });
    },
  });

  if (!isOpen || !selectedDay) return null;

  const dayName = selectedDay.toLocaleDateString('it-IT', { 
    day: 'numeric', 
    month: 'long' 
  });

  const handleSelectShift = (type: ShiftType) => {
    setSelectedShiftType(type);
  };

  const handleConfirmShift = () => {
    if (!selectedShiftType) return;
    const year = selectedDay.getFullYear();
    const month = String(selectedDay.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDay.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    createShiftMutation.mutate({ date: dateString, type: selectedShiftType });
  };

  const handleDeleteShift = () => {
    const year = selectedDay.getFullYear();
    const month = String(selectedDay.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDay.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    deleteShiftMutation.mutate(dateString);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-end justify-center z-50">
      <div className="bg-[var(--ios-surface)] rounded-t-3xl w-full max-w-md mx-4 mb-4 p-6 transform transition-transform">
        <div className="w-12 h-1 bg-[var(--ios-border)] rounded-full mx-auto mb-6" />
        
        <h2 className="text-xl font-bold text-center mb-6 text-[var(--ios-text)]">
          Seleziona Turno - {dayName}
        </h2>

        <div className="space-y-4">
          {shiftTypes.map((type) => (
            <Button
              key={type}
              variant="ghost"
              className={`w-full flex items-center p-4 rounded-xl haptic-button justify-start text-[var(--ios-text)] transition-all ${
                selectedShiftType === type 
                  ? 'bg-[var(--shift-' + type + ')]/20 border-2' 
                  : 'bg-[var(--ios-bg)] hover:bg-[var(--ios-bg)]/80'
              }`}
              style={selectedShiftType === type ? { borderColor: `var(--shift-${type})` } : {}}
              onClick={() => handleSelectShift(type)}
              disabled={createShiftMutation.isPending}
            >
              <div 
                className="w-6 h-6 rounded-full mr-4 flex-shrink-0"
                style={{ backgroundColor: `var(--shift-${type})` }}
              />
              <div className="text-left flex-1">
                <p className="font-semibold">{getShiftDisplayName(type)}</p>
                <p className="text-sm" style={{ color: 'var(--ios-text-secondary)' }}>
                  {getShiftTimeRange(type, shiftTimes)}
                </p>
              </div>
              {selectedShiftType === type ? (
                <Check className="h-4 w-4" style={{ color: `var(--shift-${type})` }} />
              ) : (
                <ChevronRight className="h-4 w-4" style={{ color: 'var(--ios-text-secondary)' }} />
              )}
            </Button>
          ))}
        </div>

        <div className="space-y-3 mt-8">
          {selectedShiftType && (
            <Button
              onClick={handleConfirmShift}
              disabled={createShiftMutation.isPending}
              className="w-full py-4 rounded-xl font-semibold haptic-button text-white"
              style={{ backgroundColor: `var(--shift-${selectedShiftType})` }}
            >
              <Check className="h-4 w-4 mr-2" />
              Conferma {getShiftDisplayName(selectedShiftType)}
            </Button>
          )}
          
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1 py-4 bg-[var(--ios-border)] rounded-xl font-semibold haptic-button text-[var(--ios-text)] hover:bg-[var(--ios-border)]/80"
              onClick={handleDeleteShift}
              disabled={deleteShiftMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Rimuovi
            </Button>
            <Button
              variant="ghost"
              className="flex-1 py-4 rounded-xl font-semibold haptic-button text-white hover:bg-red-600/80"
              style={{ backgroundColor: 'var(--ios-red)' }}
              onClick={() => {
                setSelectedShiftType(null);
                onClose();
              }}
            >
              Annulla
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
