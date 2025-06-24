import { pgTable, text, serial, integer, date, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // mattina, pomeriggio, notte, ricoveri
  userId: integer("user_id").notNull().default(1), // For future multi-user support
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1),
  weeklyTargetHours: integer("weekly_target_hours").notNull().default(36),
  shiftTimes: text("shift_times").notNull(), // JSON string of shift configurations
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  userId: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  userId: true,
});

export type Shift = typeof shifts.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type ShiftType = 'mattina' | 'pomeriggio' | 'notte' | 'ricoveri';

export interface ShiftConfig {
  start: string;
  end: string;
  hours: number;
}

export interface ShiftTimes {
  mattina: ShiftConfig;
  pomeriggio: ShiftConfig;
  notte: ShiftConfig;
  ricoveri: ShiftConfig;
}
