import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShiftSchema, insertSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get shifts for a specific month/year
  app.get("/api/shifts/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid year or month" });
      }
      
      const shifts = await storage.getShifts(month, year);
      res.json(shifts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shifts" });
    }
  });

  // Get shift for a specific date
  app.get("/api/shifts/date/:date", async (req, res) => {
    try {
      const shift = await storage.getShiftByDate(req.params.date);
      res.json(shift || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shift" });
    }
  });

  // Create or update a shift
  app.post("/api/shifts", async (req, res) => {
    try {
      const validatedData = insertShiftSchema.parse(req.body);
      const shift = await storage.createShift(validatedData);
      res.json(shift);
    } catch (error) {
      res.status(400).json({ message: "Invalid shift data" });
    }
  });

  // Delete a shift by date
  app.delete("/api/shifts/date/:date", async (req, res) => {
    try {
      await storage.deleteShiftByDate(req.params.date);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete shift" });
    }
  });

  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Update settings
  app.put("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(validatedData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
