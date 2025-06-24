import { shifts, settings, type Shift, type InsertShift, type Settings, type InsertSettings, type ShiftTimes } from "@shared/schema";

export interface IStorage {
  // Shift operations
  getShifts(month: number, year: number): Promise<Shift[]>;
  getShiftByDate(date: string): Promise<Shift | undefined>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: number, shift: Partial<InsertShift>): Promise<Shift>;
  deleteShift(id: number): Promise<void>;
  deleteShiftByDate(date: string): Promise<void>;
  
  // Settings operations
  getSettings(): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private shifts: Map<number, Shift>;
  private settings: Settings | undefined;
  private currentShiftId: number;
  private currentSettingsId: number;

  constructor() {
    this.shifts = new Map();
    this.currentShiftId = 1;
    this.currentSettingsId = 1;
    
    // Initialize default settings
    const defaultShiftTimes: ShiftTimes = {
      mattina: { start: "07:00", end: "14:00", hours: 7 },
      pomeriggio: { start: "14:00", end: "22:00", hours: 8 },
      notte: { start: "22:00", end: "07:00", hours: 9 },
      ricoveri: { start: "13:00", end: "19:00", hours: 6 }
    };
    
    this.settings = {
      id: 1,
      userId: 1,
      weeklyTargetHours: 36,
      shiftTimes: JSON.stringify(defaultShiftTimes)
    };
  }

  async getShifts(month: number, year: number): Promise<Shift[]> {
    return Array.from(this.shifts.values()).filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate.getMonth() === month - 1 && shiftDate.getFullYear() === year;
    });
  }

  async getShiftByDate(date: string): Promise<Shift | undefined> {
    return Array.from(this.shifts.values()).find(shift => shift.date === date);
  }

  async createShift(insertShift: InsertShift): Promise<Shift> {
    // Remove existing shift for this date if any
    await this.deleteShiftByDate(insertShift.date);
    
    const id = this.currentShiftId++;
    const shift: Shift = { ...insertShift, id, userId: 1 };
    this.shifts.set(id, shift);
    return shift;
  }

  async updateShift(id: number, updateData: Partial<InsertShift>): Promise<Shift> {
    const existingShift = this.shifts.get(id);
    if (!existingShift) {
      throw new Error('Shift not found');
    }
    
    const updatedShift: Shift = { ...existingShift, ...updateData };
    this.shifts.set(id, updatedShift);
    return updatedShift;
  }

  async deleteShift(id: number): Promise<void> {
    this.shifts.delete(id);
  }

  async deleteShiftByDate(date: string): Promise<void> {
    const shift = await this.getShiftByDate(date);
    if (shift) {
      this.shifts.delete(shift.id);
    }
  }

  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const id = this.currentSettingsId++;
    this.settings = { 
      ...insertSettings, 
      id, 
      userId: 1,
      weeklyTargetHours: insertSettings.weeklyTargetHours || 36
    };
    return this.settings;
  }

  async updateSettings(updateData: Partial<InsertSettings>): Promise<Settings> {
    if (!this.settings) {
      throw new Error('Settings not found');
    }
    
    this.settings = { 
      ...this.settings, 
      ...updateData,
      weeklyTargetHours: updateData.weeklyTargetHours ?? this.settings.weeklyTargetHours
    };
    return this.settings;
  }
}

export const storage = new MemStorage();
