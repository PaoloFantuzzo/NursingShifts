import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save, Plus, Minus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Settings, type ShiftTimes } from "@shared/schema";

interface SettingsModalProps {
  isOpen: boolean;
  settings?: Settings;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, settings, onClose }: SettingsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const defaultShiftTimes: ShiftTimes = {
    mattina: { start: "07:00", end: "14:00", hours: 7 },
    pomeriggio: { start: "14:00", end: "22:00", hours: 8 },
    notte: { start: "22:00", end: "07:00", hours: 9 },
    ricoveri: { start: "13:00", end: "19:00", hours: 6 }
  };

  const [weeklyTargetHours, setWeeklyTargetHours] = useState(settings?.weeklyTargetHours || 36);
  const [shiftTimes, setShiftTimes] = useState<ShiftTimes>(
    settings?.shiftTimes ? JSON.parse(settings.shiftTimes) : defaultShiftTimes
  );

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { weeklyTargetHours: number; shiftTimes: string }) => {
      return await apiRequest('PUT', '/api/settings', data);
    },
    onSuccess: () => {
      toast({
        title: "Impostazioni salvate",
        description: "Le impostazioni sono state aggiornate con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile salvare le impostazioni.",
        variant: "destructive",
      });
    },
  });

  if (!isOpen) return null;

  const calculateHours = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    let hours = endHour - startHour + (endMin - startMin) / 60;
    
    // Handle overnight shifts
    if (hours <= 0) {
      hours += 24;
    }
    
    return Math.round(hours * 10) / 10; // Round to 1 decimal place
  };

  const updateShiftTime = (shiftType: keyof ShiftTimes, field: 'start' | 'end', value: string) => {
    const newShiftTimes = { ...shiftTimes };
    newShiftTimes[shiftType][field] = value;
    newShiftTimes[shiftType].hours = calculateHours(
      newShiftTimes[shiftType].start,
      newShiftTimes[shiftType].end
    );
    setShiftTimes(newShiftTimes);
  };

  const handleSave = () => {
    updateSettingsMutation.mutate({
      weeklyTargetHours,
      shiftTimes: JSON.stringify(shiftTimes),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50">
      <div className="bg-[var(--ios-surface)] rounded-3xl w-full max-w-md mx-4 p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--ios-text)]">Impostazioni</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[var(--ios-text)] hover:bg-[var(--ios-border)]"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Weekly Hours Target */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-[var(--ios-text)]">Monte Ore Settimanale</h3>
          <div className="bg-[var(--ios-bg)] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--ios-text)]">Ore Target</span>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setWeeklyTargetHours(Math.max(1, weeklyTargetHours - 1))}
                  className="text-[var(--ios-text-secondary)] hover:bg-[var(--ios-border)]"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-4 font-semibold text-[var(--ios-text)]">{weeklyTargetHours}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setWeeklyTargetHours(weeklyTargetHours + 1)}
                  className="text-[var(--ios-text-secondary)] hover:bg-[var(--ios-border)]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Shift Configuration */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-[var(--ios-text)]">Configurazione Turni</h3>
          
          {Object.entries(shiftTimes).map(([shiftType, config]) => (
            <div key={shiftType} className="bg-[var(--ios-bg)] rounded-xl p-4 mb-3">
              <div className="flex items-center mb-3">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: `var(--shift-${shiftType})` }}
                />
                <span className="font-medium text-[var(--ios-text)]">
                  {shiftType === 'mattina' && 'Turno Mattina'}
                  {shiftType === 'pomeriggio' && 'Turno Pomeriggio'}
                  {shiftType === 'notte' && 'Turno Notte'}
                  {shiftType === 'ricoveri' && 'Turno Ricoveri'}
                </span>
                <span className="ml-auto text-sm" style={{ color: 'var(--ios-text-secondary)' }}>
                  {config.hours}h
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label 
                    htmlFor={`${shiftType}-start`} 
                    className="text-sm"
                    style={{ color: 'var(--ios-text-secondary)' }}
                  >
                    Inizio
                  </Label>
                  <Input
                    id={`${shiftType}-start`}
                    type="time"
                    value={config.start}
                    onChange={(e) => updateShiftTime(shiftType as keyof ShiftTimes, 'start', e.target.value)}
                    className="mt-1 bg-[var(--ios-surface)] border-[var(--ios-border)] text-[var(--ios-text)]"
                  />
                </div>
                <div>
                  <Label 
                    htmlFor={`${shiftType}-end`} 
                    className="text-sm"
                    style={{ color: 'var(--ios-text-secondary)' }}
                  >
                    Fine
                  </Label>
                  <Input
                    id={`${shiftType}-end`}
                    type="time"
                    value={config.end}
                    onChange={(e) => updateShiftTime(shiftType as keyof ShiftTimes, 'end', e.target.value)}
                    className="mt-1 bg-[var(--ios-surface)] border-[var(--ios-border)] text-[var(--ios-text)]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="w-full py-4 rounded-xl font-semibold haptic-button text-white"
          style={{ backgroundColor: 'var(--shift-mattina)' }}
        >
          <Save className="h-4 w-4 mr-2" />
          Salva Impostazioni
        </Button>
      </div>
    </div>
  );
}
