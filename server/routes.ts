import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMoodLogSchema, 
  insertMedicationSchema, 
  insertMedicationLogSchema, 
  insertCommunityPostSchema, 
  insertCommunityReplySchema,
  loginSchema,
  registerSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.login(credentials);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const user = await storage.register(userData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User endpoints
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.updateUser(userId, req.body);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Mood logs
  app.get("/api/mood-logs/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const moodLogs = await storage.getMoodLogsByUser(userId, limit);
      res.json(moodLogs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/mood-logs", async (req, res) => {
    try {
      const validatedData = insertMoodLogSchema.parse(req.body);
      const moodLog = await storage.createMoodLog(validatedData);
      res.status(201).json(moodLog);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Medications
  app.get("/api/medications", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const medications = await storage.getMedicationsByUser(userId);
      res.json(medications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/medications", async (req, res) => {
    try {
      const validatedData = insertMedicationSchema.parse({
        ...req.body,
        userId: 1, // Demo user
      });
      const medication = await storage.createMedication(validatedData);
      res.status(201).json(medication);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Medication logs
  app.post("/api/medication-logs", async (req, res) => {
    try {
      const validatedData = insertMedicationLogSchema.parse({
        ...req.body,
        userId: 1, // Demo user
      });
      const medicationLog = await storage.createMedicationLog(validatedData);
      res.status(201).json(medicationLog);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Resources
  app.get("/api/resources", async (req, res) => {
    try {
      const category = req.query.category as string;
      const resources = category 
        ? await storage.getResourcesByCategory(category)
        : await storage.getAllResources();
      res.json(resources);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Community posts
  app.get("/api/community/posts", async (req, res) => {
    try {
      const posts = await storage.getAllCommunityPosts();
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/community/posts", async (req, res) => {
    try {
      const validatedData = insertCommunityPostSchema.parse({
        ...req.body,
        userId: 1, // Demo user
      });
      const post = await storage.createCommunityPost(validatedData);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Community replies
  app.get("/api/community/posts/:postId/replies", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const replies = await storage.getRepliesByPost(postId);
      res.json(replies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/community/posts/:postId/replies", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const validatedData = insertCommunityReplySchema.parse({
        ...req.body,
        postId,
        userId: 1, // Demo user
      });
      const reply = await storage.createCommunityReply(validatedData);
      res.status(201).json(reply);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Professionals
  app.get("/api/professionals", async (req, res) => {
    try {
      const professionals = await storage.getAllProfessionals();
      res.json(professionals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
