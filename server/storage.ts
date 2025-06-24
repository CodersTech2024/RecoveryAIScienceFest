import { 
  users, 
  moodLogs, 
  medications, 
  medicationLogs, 
  resources, 
  communityPosts, 
  communityReplies, 
  professionals,
  type User, 
  type RegisterUser,
  type LoginUser,
  type MoodLog,
  type InsertMoodLog,
  type Medication,
  type InsertMedication,
  type MedicationLog,
  type InsertMedicationLog,
  type Resource,
  type InsertResource,
  type CommunityPost,
  type InsertCommunityPost,
  type CommunityReply,
  type InsertCommunityReply,
  type Professional,
  type InsertProfessional
} from "@shared/schema";

export interface IStorage {
  // Auth
  register(user: RegisterUser): Promise<User>;
  login(credentials: LoginUser): Promise<User | null>;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  
  // Mood logs
  createMoodLog(moodLog: InsertMoodLog): Promise<MoodLog>;
  getMoodLogsByUser(userId: number, limit?: number): Promise<MoodLog[]>;
  
  // Medications
  createMedication(medication: InsertMedication): Promise<Medication>;
  getMedicationsByUser(userId: number): Promise<Medication[]>;
  updateMedication(id: number, medication: Partial<Medication>): Promise<Medication>;
  
  // Medication logs
  createMedicationLog(medicationLog: InsertMedicationLog): Promise<MedicationLog>;
  getMedicationLogsByUser(userId: number): Promise<MedicationLog[]>;
  
  // Resources
  getAllResources(): Promise<Resource[]>;
  getResourcesByCategory(category: string): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  
  // Community
  getAllCommunityPosts(): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  getRepliesByPost(postId: number): Promise<CommunityReply[]>;
  createCommunityReply(reply: InsertCommunityReply): Promise<CommunityReply>;
  
  // Professionals
  getAllProfessionals(): Promise<Professional[]>;
  createProfessional(professional: InsertProfessional): Promise<Professional>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private moodLogs: Map<number, MoodLog>;
  private medications: Map<number, Medication>;
  private medicationLogs: Map<number, MedicationLog>;
  private resources: Map<number, Resource>;
  private communityPosts: Map<number, CommunityPost>;
  private communityReplies: Map<number, CommunityReply>;
  private professionals: Map<number, Professional>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.moodLogs = new Map();
    this.medications = new Map();
    this.medicationLogs = new Map();
    this.resources = new Map();
    this.communityPosts = new Map();
    this.communityReplies = new Map();
    this.professionals = new Map();
    this.currentId = 1;
    
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Default user for demo
    const user: User = {
      id: this.currentId++,
      username: "demo_user",
      password: "password123", // In real app, this would be hashed
      email: "demo@example.com",
      addictionTypes: ["alcohol", "opioids"],
      recoveryStartDate: new Date(Date.now() - (127 * 24 * 60 * 60 * 1000)), // 127 days ago
      emergencyContacts: ["emergency-services", "support-buddy"],
      createdAt: new Date(),
    };
    this.users.set(user.id, user);

    // Default resources
    const defaultResources: Omit<Resource, 'id'>[] = [
      {
        title: "Understanding Triggers",
        type: "article",
        content: "Learn to identify and manage your personal triggers for lasting recovery.",
        description: "A comprehensive guide to identifying and managing triggers in addiction recovery.",
        duration: "5 min read",
        category: "triggers",
        isActive: true,
      },
      {
        title: "Mindfulness for Recovery",
        type: "video",
        content: "Guided meditation techniques specifically designed for addiction recovery.",
        description: "Meditation and mindfulness practices for addiction recovery.",
        duration: "12 min",
        category: "mindfulness",
        isActive: true,
      }
    ];
    
    defaultResources.forEach(resource => {
      const newResource: Resource = { ...resource, id: this.currentId++ };
      this.resources.set(newResource.id, newResource);
    });

    // Default professionals
    const defaultProfessionals: Omit<Professional, 'id'>[] = [
      {
        name: "Dr. Emily Chen",
        type: "counselor",
        contact: "phone:555-0123",
        availability: "Available Today",
        specialization: "Addiction Counselor",
        isActive: true,
      },
      {
        name: "Weekly Group Meeting",
        type: "support_group",
        contact: "location:Community Center",
        availability: "Thursdays 7 PM",
        specialization: "Group Support",
        isActive: true,
      },
      {
        name: "Crisis Hotline",
        type: "hotline",
        contact: "phone:988",
        availability: "24/7 Support",
        specialization: "Crisis Intervention",
        isActive: true,
      }
    ];
    
    defaultProfessionals.forEach(professional => {
      const newProfessional: Professional = { ...professional, id: this.currentId++ };
      this.professionals.set(newProfessional.id, newProfessional);
    });
  }

  // Auth
  async register(userData: RegisterUser): Promise<User> {
    // Check if user exists
    const existing = Array.from(this.users.values()).find(
      u => u.username === userData.username || u.email === userData.email
    );
    if (existing) {
      throw new Error("User already exists");
    }

    const id = this.currentId++;
    const user: User = {
      id,
      username: userData.username,
      password: userData.password, // In real app, hash this
      email: userData.email,
      addictionTypes: userData.addictionTypes,
      recoveryStartDate: userData.recoveryStartDate,
      emergencyContacts: [],
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async login(credentials: LoginUser): Promise<User | null> {
    const user = Array.from(this.users.values()).find(
      u => u.username === credentials.username && u.password === credentials.password
    );
    return user || null;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Mood logs
  async createMoodLog(insertMoodLog: InsertMoodLog): Promise<MoodLog> {
    const id = this.currentId++;
    const moodLog: MoodLog = { 
      ...insertMoodLog, 
      id,
      notes: insertMoodLog.notes || null,
      timestamp: new Date(),
    };
    this.moodLogs.set(id, moodLog);
    return moodLog;
  }

  async getMoodLogsByUser(userId: number, limit = 10): Promise<MoodLog[]> {
    return Array.from(this.moodLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Medications
  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const id = this.currentId++;
    const medication: Medication = { 
      ...insertMedication, 
      id,
      isActive: true,
    };
    this.medications.set(id, medication);
    return medication;
  }

  async getMedicationsByUser(userId: number): Promise<Medication[]> {
    return Array.from(this.medications.values())
      .filter(med => med.userId === userId && med.isActive);
  }

  async updateMedication(id: number, updates: Partial<Medication>): Promise<Medication> {
    const medication = this.medications.get(id);
    if (!medication) throw new Error("Medication not found");
    
    const updatedMedication = { ...medication, ...updates };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }

  // Medication logs
  async createMedicationLog(insertMedicationLog: InsertMedicationLog): Promise<MedicationLog> {
    const id = this.currentId++;
    const medicationLog: MedicationLog = { 
      ...insertMedicationLog, 
      id,
      timestamp: new Date(),
    };
    this.medicationLogs.set(id, medicationLog);
    return medicationLog;
  }

  async getMedicationLogsByUser(userId: number): Promise<MedicationLog[]> {
    return Array.from(this.medicationLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Resources
  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(resource => resource.isActive);
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.category === category && resource.isActive);
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = this.currentId++;
    const resource: Resource = { 
      ...insertResource, 
      id,
      isActive: true,
    };
    this.resources.set(id, resource);
    return resource;
  }

  // Community
  async getAllCommunityPosts(): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const id = this.currentId++;
    const post: CommunityPost = { 
      ...insertPost, 
      id,
      timestamp: new Date(),
    };
    this.communityPosts.set(id, post);
    return post;
  }

  async getRepliesByPost(postId: number): Promise<CommunityReply[]> {
    return Array.from(this.communityReplies.values())
      .filter(reply => reply.postId === postId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createCommunityReply(insertReply: InsertCommunityReply): Promise<CommunityReply> {
    const id = this.currentId++;
    const reply: CommunityReply = { 
      ...insertReply, 
      id,
      timestamp: new Date(),
    };
    this.communityReplies.set(id, reply);
    return reply;
  }

  // Professionals
  async getAllProfessionals(): Promise<Professional[]> {
    return Array.from(this.professionals.values()).filter(prof => prof.isActive);
  }

  async createProfessional(insertProfessional: InsertProfessional): Promise<Professional> {
    const id = this.currentId++;
    const professional: Professional = { 
      ...insertProfessional, 
      id,
      isActive: true,
    };
    this.professionals.set(id, professional);
    return professional;
  }
}

export const storage = new MemStorage();
