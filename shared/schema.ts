import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  addictionTypes: text("addiction_types").array().default([]),
  recoveryStartDate: timestamp("recovery_start_date"),
  emergencyContacts: text("emergency_contacts").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const moodLogs = pgTable("mood_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mood: integer("mood").notNull(), // 1-10 scale
  cravingLevel: text("craving_level").notNull(), // none, mild, moderate, strong
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(), // daily, twice_daily, etc.
  nextDose: timestamp("next_dose"),
  isActive: boolean("is_active").default(true),
});

export const medicationLogs = pgTable("medication_logs", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").notNull(),
  userId: integer("user_id").notNull(),
  taken: boolean("taken").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // article, video, audio
  content: text("content").notNull(),
  description: text("description"),
  duration: text("duration"), // for videos/audio
  category: text("category").notNull(), // triggers, mindfulness, etc.
  isActive: boolean("is_active").default(true),
});

export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(true),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const communityReplies = pgTable("community_replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(true),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // counselor, therapist, support_group
  contact: text("contact").notNull(),
  availability: text("availability"),
  specialization: text("specialization"),
  isActive: boolean("is_active").default(true),
});

// Insert schemas
export const registerSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  addictionTypes: true,
  recoveryStartDate: true,
}).extend({
  email: z.string().email(),
  password: z.string().min(8),
  addictionTypes: z.array(z.string()).min(1, "Please select at least one addiction type"),
  recoveryStartDate: z.date(),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const insertMoodLogSchema = createInsertSchema(moodLogs).pick({
  userId: true,
  mood: true,
  cravingLevel: true,
  notes: true,
}).extend({
  mood: z.number().min(1).max(10),
  cravingLevel: z.enum(["none", "mild", "moderate", "strong"]),
});

export const insertMedicationSchema = createInsertSchema(medications).pick({
  userId: true,
  name: true,
  dosage: true,
  frequency: true,
  nextDose: true,
});

export const insertMedicationLogSchema = createInsertSchema(medicationLogs).pick({
  medicationId: true,
  userId: true,
  taken: true,
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  title: true,
  type: true,
  content: true,
  description: true,
  duration: true,
  category: true,
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).pick({
  userId: true,
  title: true,
  content: true,
  isAnonymous: true,
});

export const insertCommunityReplySchema = createInsertSchema(communityReplies).pick({
  postId: true,
  userId: true,
  content: true,
  isAnonymous: true,
});

export const insertProfessionalSchema = createInsertSchema(professionals).pick({
  name: true,
  type: true,
  contact: true,
  availability: true,
  specialization: true,
});

// Types
export type RegisterUser = z.infer<typeof registerSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;

export type InsertMoodLog = z.infer<typeof insertMoodLogSchema>;
export type MoodLog = typeof moodLogs.$inferSelect;

export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;

export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;
export type MedicationLog = typeof medicationLogs.$inferSelect;

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

export type InsertCommunityReply = z.infer<typeof insertCommunityReplySchema>;
export type CommunityReply = typeof communityReplies.$inferSelect;

export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type Professional = typeof professionals.$inferSelect;
