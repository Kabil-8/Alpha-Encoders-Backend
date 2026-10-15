import express, { type Request, type Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Ensure DNS SRV records resolve cleanly on Windows/ISP networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Fall back to default system DNS if restricted
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://projectalphateam308_db_user:6dUMWkCu3MYsGcis@cluster0.cuqbzoa.mongodb.net/edusphere?retryWrites=true&w=majority';

// Middleware
app.use(cors());
app.use(express.json());

// Comprehensive Interfaces
export interface InquiryItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  websiteType: string;
  requiredFeatures: string[];
  estimatedBudget?: string;
  completionTimeline?: string;
  description: string;
  status: 'new' | 'contacted' | 'in_review' | 'closed';
  notes?: string;
  createdAt: string;
}

export interface ProjectMetrics {
  lighthousePerformance?: number;
  pageSpeed?: string;
  accessibility?: number;
  seoScore?: number;
  payloadSize?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  slug: string;
  industry: string;
  tagline: string;
  description: string;
  clientName?: string;
  clientFeedback?: string;
  projectBudget?: string;
  deliveryDuration?: string;
  completionDate?: string;
  services: string[];
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  verifiedResult?: string;
  featured: boolean;
  category: string;
  highlights: string[];
  architectureOverview: string;
  metrics?: ProjectMetrics;
  createdAt: string;
  updatedAt?: string;
}

export interface UserInquirySnapshot {
  inquiryId: string;
  websiteType: string;
  submittedAt: string;
  estimatedBudget?: string;
  completionTimeline?: string;
  status: string;
  description: string;
  requiredFeatures: string[];
}

export interface UserItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  location?: string;
  role: 'client' | 'prospect' | 'lead' | 'vip';
  status: 'active' | 'in_discussion' | 'completed' | 'onboarding';
  totalInquiries: number;
  totalEstimatedValue: number;
  currency: string;
  notes: string;
  websiteTypes: string[];
  associatedProjects: string[];
  inquiryHistory: UserInquirySnapshot[];
  createdAt: string;
  lastActiveAt: string;
}

export interface DatabaseSchema {
  admin: {
    email: string;
    passwordHash: string;
    name: string;
    role: string;
  };
  inquiries: InquiryItem[];
  users: UserItem[];
  projects: ProjectItem[];
}

const readDB = (): DatabaseSchema => {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.users) parsed.users = [];
    if (!parsed.projects) parsed.projects = [];
    if (!parsed.inquiries) parsed.inquiries = [];
    return parsed;
  } catch (err) {
    console.error('Error reading db.json, returning empty structure', err);
    return {
      admin: {
        email: 'admin@alphaencoders.com',
        passwordHash: 'admin123',
        name: 'Lead Architect',
        role: 'Super Admin'
      },
      inquiries: [],
      users: [],
      projects: []
    };
  }
};

// ---------------------------------------------------------------------
// MONGOOSE SCHEMAS & MODELS (Persistent MongoDB Atlas Collections)
// ---------------------------------------------------------------------
const AlphaInquirySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    company: String,
    websiteType: { type: String, required: true },
    requiredFeatures: [String],
    estimatedBudget: String,
    completionTimeline: String,
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['new', 'contacted', 'in_review', 'closed'],
      default: 'new'
    },
    notes: String,
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { collection: 'alpha_inquiries', timestamps: true }
);

const AlphaProjectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    industry: { type: String, required: true },
    tagline: String,
    description: String,
    clientName: String,
    clientFeedback: String,
    projectBudget: String,
    deliveryDuration: String,
    completionDate: String,
    services: [String],
    technologies: [String],
    liveUrl: String,
    githubUrl: String,
    verifiedResult: String,
    featured: { type: Boolean, default: false },
    category: String,
    highlights: [String],
    architectureOverview: String,
    metrics: {
      lighthousePerformance: Number,
      pageSpeed: String,
      accessibility: Number,
      seoScore: Number,
      payloadSize: String
    },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: String
  },
  { collection: 'alpha_projects', timestamps: true }
);

const AlphaUserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    company: String,
    location: String,
    role: {
      type: String,
      enum: ['client', 'prospect', 'lead', 'vip'],
      default: 'client'
    },
    status: {
      type: String,
      enum: ['active', 'in_discussion', 'completed', 'onboarding'],
      default: 'active'
    },
    totalInquiries: { type: Number, default: 0 },
    totalEstimatedValue: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    notes: String,
    websiteTypes: [String],
    associatedProjects: [String],
    inquiryHistory: [
      {
        inquiryId: String,
        websiteType: String,
        submittedAt: String,
        estimatedBudget: String,
        completionTimeline: String,
        status: String,
        description: String,
        requiredFeatures: [String]
      }
    ],
    createdAt: { type: String, default: () => new Date().toISOString() },
    lastActiveAt: { type: String, default: () => new Date().toISOString() }
  },
  { collection: 'alpha_users', timestamps: true }
);

const AlphaQuotationSchema = new mongoose.Schema(
  {
    quoteNumber: { type: String, required: true, unique: true },
    issueDate: String,
    validUntil: String,
    currencyCode: String,
    currencySymbol: String,
    client: {
      name: String,
      company: String,
      email: String,
      phone: String,
      location: String
    },
    projectTitle: String,
    lineItems: [
      {
        id: String,
        title: String,
        description: String,
        quantity: Number,
        rate: Number
      }
    ],
    subtotal: Number,
    discountPercent: Number,
    taxPercent: Number,
    grandTotal: Number,
    notes: String,
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'invoiced'],
      default: 'draft'
    },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { collection: 'alpha_quotations', timestamps: true }
);

export const InquiryModel = mongoose.models.AlphaInquiry || mongoose.model('AlphaInquiry', AlphaInquirySchema);
export const ProjectModel = mongoose.models.AlphaProject || mongoose.model('AlphaProject', AlphaProjectSchema);
export const UserModel = mongoose.models.AlphaUser || mongoose.model('AlphaUser', AlphaUserSchema);
export const QuotationModel = mongoose.models.AlphaQuotation || mongoose.model('AlphaQuotation', AlphaQuotationSchema);

let isMongoConnected = false;

const syncToMongo = async (data: DatabaseSchema) => {
  if (!isMongoConnected) return;
  try {
    for (const p of data.projects) {
      await ProjectModel.findOneAndUpdate({ id: p.id }, p, { upsert: true });
    }
    for (const u of data.users) {
      await UserModel.findOneAndUpdate({ id: u.id }, u, { upsert: true });
    }
    for (const inq of data.inquiries) {
      await InquiryModel.findOneAndUpdate({ id: inq.id }, inq, { upsert: true });
    }
  } catch (err) {
    console.warn('[MongoDB Atlas] Auto-sync notice:', err);
  }
};

export const seedInitialDataFromDB = async () => {
  try {
    const db = readDB();
    const projCount = await ProjectModel.countDocuments();
    if (projCount === 0 && db.projects.length > 0) {
      await ProjectModel.insertMany(db.projects);
      console.log(`[MongoDB Atlas] Seeded ${db.projects.length} verified projects into alpha_projects`);
    }

    const userCount = await UserModel.countDocuments();
    if (userCount === 0 && db.users.length > 0) {
      await UserModel.insertMany(db.users);
      console.log(`[MongoDB Atlas] Seeded ${db.users.length} clients into alpha_users`);
    }

    const inqCount = await InquiryModel.countDocuments();
    if (inqCount === 0 && db.inquiries.length > 0) {
      await InquiryModel.insertMany(db.inquiries);
      console.log(`[MongoDB Atlas] Seeded ${db.inquiries.length} inquiries into alpha_inquiries`);
    }
  } catch (err) {
    console.error('[MongoDB Atlas] Seeding notice:', err);
  }
};

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 6000
    });
    isMongoConnected = true;
    console.log('[MongoDB Atlas] Connected successfully to cluster0.cuqbzoa.mongodb.net/edusphere');
    await seedInitialDataFromDB();
  } catch (err: any) {
    isMongoConnected = false;
    console.warn('[MongoDB Atlas] Connection notice (db.json fallback active):', err.message);
  }
};

const writeDB = (data: DatabaseSchema): boolean => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    syncToMongo(data).catch(() => {});
    return true;
  } catch (err) {
    console.error('Error writing to db.json', err);
    return false;
  }
};

const calculateBudgetValue = (budgetStr?: string): number => {
  if (!budgetStr) return 2500;
  if (budgetStr.includes('10,000+')) return 12000;
  if (budgetStr.includes('5,000')) return 7500;
  if (budgetStr.includes('2,500')) return 3750;
  if (budgetStr.includes('1,000')) return 1750;
  if (budgetStr.includes('Under')) return 800;
  return 2500;
};

// ---------------------------------------------------------------------
// HEALTH CHECK & DATABASE STATUS
// ---------------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'Alpha Encoders Core API',
    database: {
      provider: 'MongoDB Atlas',
      cluster: 'cluster0.cuqbzoa.mongodb.net',
      dbName: 'edusphere',
      connected: isMongoConnected,
      status: isMongoConnected ? 'connected' : 'fallback_mode'
    },
    timestamp: new Date().toISOString()
  });
});

// ---------------------------------------------------------------------
// AUTHENTICATION
// ---------------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const db = readDB();

  if (email === db.admin.email && password === db.admin.passwordHash) {
    const token = `ae_token_${Buffer.from(email + ':' + Date.now()).toString('base64')}`;
    res.json({
      success: true,
      token,
      user: {
        email: db.admin.email,
        name: db.admin.name,
        role: db.admin.role
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid administrative email or password.'
    });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const db = readDB();
  res.json({
    success: true,
    user: {
      email: db.admin.email,
      name: db.admin.name,
      role: db.admin.role
    }
  });
});

// ---------------------------------------------------------------------
// PROJECTS MANAGEMENT (FULL DETAILS)
// ---------------------------------------------------------------------

// Get all projects with complete details
app.get('/api/projects', (req: Request, res: Response) => {
  const db = readDB();
  const { featured, category, search } = req.query;

  let results = db.projects;

  if (featured === 'true') {
    results = results.filter((p) => p.featured);
  }

  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.technologies.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    total: results.length,
    projects: results
  });
});

// Get single project complete details by id or slug
app.get('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();

  const project = db.projects.find((p) => p.id === id || p.slug === id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  res.json({
    success: true,
    project
  });
});

// Add new project (Admin)
app.post('/api/projects', (req: Request, res: Response) => {
  const {
    name,
    slug,
    industry,
    tagline,
    description,
    clientName,
    clientFeedback,
    projectBudget,
    deliveryDuration,
    completionDate,
    services,
    technologies,
    liveUrl,
    githubUrl,
    verifiedResult,
    featured,
    category,
    highlights,
    architectureOverview,
    metrics
  } = req.body;

  if (!name || !description) {
    return res.status(400).json({
      success: false,
      message: 'Project name and description are required.'
    });
  }

  const db = readDB();
  const projectSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newProject: ProjectItem = {
    id: projectSlug,
    name: name.trim(),
    slug: projectSlug,
    industry: industry || 'Technology & Digital Architecture',
    tagline: tagline || `${name} Custom Web Experience`,
    description: description.trim(),
    clientName: clientName ? clientName.trim() : undefined,
    clientFeedback: clientFeedback ? clientFeedback.trim() : undefined,
    projectBudget: projectBudget ? projectBudget.trim() : undefined,
    deliveryDuration: deliveryDuration ? deliveryDuration.trim() : undefined,
    completionDate: completionDate ? completionDate.trim() : undefined,
    services: Array.isArray(services) ? services : typeof services === 'string' ? services.split(',').map((s) => s.trim()).filter(Boolean) : ['Custom Web Engineering'],
    technologies: Array.isArray(technologies) ? technologies : typeof technologies === 'string' ? technologies.split(',').map((t) => t.trim()).filter(Boolean) : ['React', 'TypeScript', 'Tailwind CSS'],
    liveUrl: liveUrl ? liveUrl.trim() : undefined,
    githubUrl: githubUrl ? githubUrl.trim() : undefined,
    verifiedResult: verifiedResult ? verifiedResult.trim() : 'Production verified deployment with responsive performance.',
    featured: Boolean(featured),
    category: category || 'Web Application',
    highlights: Array.isArray(highlights) ? highlights : typeof highlights === 'string' ? highlights.split('\n').map((h) => h.trim()).filter(Boolean) : [],
    architectureOverview: architectureOverview ? architectureOverview.trim() : 'Engineered with modern frontend components, responsive layouts, and performant state handling.',
    metrics: metrics || {
      lighthousePerformance: 98,
      pageSpeed: '0.45s',
      accessibility: 100,
      seoScore: 100,
      payloadSize: '160 KB'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.projects.unshift(newProject);
  writeDB(db);

  res.status(201).json({
    success: true,
    message: 'New project created successfully with complete specifications.',
    project: newProject
  });
});

// Update project with complete fields (Admin)
app.put('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();

  const index = db.projects.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const existing = db.projects[index];
  const payload = req.body;

  db.projects[index] = {
    ...existing,
    ...payload,
    id: existing.id, // preserve immutable ID
    services: Array.isArray(payload.services)
      ? payload.services
      : typeof payload.services === 'string'
      ? payload.services.split(',').map((s: string) => s.trim()).filter(Boolean)
      : existing.services,
    technologies: Array.isArray(payload.technologies)
      ? payload.technologies
      : typeof payload.technologies === 'string'
      ? payload.technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
      : existing.technologies,
    highlights: Array.isArray(payload.highlights)
      ? payload.highlights
      : typeof payload.highlights === 'string'
      ? payload.highlights.split('\n').map((h: string) => h.trim()).filter(Boolean)
      : existing.highlights,
    updatedAt: new Date().toISOString()
  };

  writeDB(db);

  res.json({
    success: true,
    message: 'Project updated successfully.',
    project: db.projects[index]
  });
});

// Delete project (Admin)
app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();

  const initialLen = db.projects.length;
  db.projects = db.projects.filter((p) => p.id !== id && p.slug !== id);

  if (db.projects.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  writeDB(db);
  res.json({ success: true, message: 'Project deleted successfully.' });
});

// ---------------------------------------------------------------------
// USERS & CLIENTS CRM MANAGEMENT (FULL DETAILS)
// ---------------------------------------------------------------------

// Get all users with full details, with optional search and filters
app.get('/api/users', (req: Request, res: Response) => {
  const db = readDB();
  const { search, role, status } = req.query;

  let results = db.users;

  if (role && typeof role === 'string' && role !== 'all') {
    results = results.filter((u) => u.role === role);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    results = results.filter((u) => u.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.company && u.company.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.location && u.location.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    total: results.length,
    users: results
  });
});

// Get single user complete details by id or email
app.get('/api/users/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const idLower = id.toLowerCase();
  const db = readDB();

  const user = db.users.find((u) => u.id === id || u.email.toLowerCase() === idLower);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found in CRM.' });
  }

  // Cross-reference all live inquiries submitted by this user
  const matchingInquiries = db.inquiries.filter((inq) => inq.email.toLowerCase() === user.email.toLowerCase());

  res.json({
    success: true,
    user: {
      ...user,
      liveInquiries: matchingInquiries
    }
  });
});

// Create new user / client profile (Admin)
app.post('/api/users', (req: Request, res: Response) => {
  const {
    fullName,
    email,
    phone,
    company,
    location,
    role,
    status,
    notes,
    websiteTypes,
    associatedProjects,
    totalEstimatedValue
  } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({
      success: false,
      message: 'Full name and email are required to register a client.'
    });
  }

  const db = readDB();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'A client profile with this email address already exists.'
    });
  }

  const newUser: UserItem = {
    id: `usr-${Date.now()}`,
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone ? phone.trim() : undefined,
    company: company ? company.trim() : undefined,
    location: location ? location.trim() : 'Remote / Global',
    role: role || 'lead',
    status: status || 'in_discussion',
    totalInquiries: 0,
    totalEstimatedValue: Number(totalEstimatedValue) || 0,
    currency: 'USD',
    notes: notes ? notes.trim() : 'Registered client profile created via admin portal.',
    websiteTypes: Array.isArray(websiteTypes) ? websiteTypes : typeof websiteTypes === 'string' ? websiteTypes.split(',').map((w) => w.trim()).filter(Boolean) : [],
    associatedProjects: Array.isArray(associatedProjects) ? associatedProjects : [],
    inquiryHistory: [],
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString()
  };

  db.users.unshift(newUser);
  writeDB(db);

  res.status(201).json({
    success: true,
    message: 'Client profile registered successfully in CRM.',
    user: newUser
  });
});

// Update user details (Admin)
app.patch('/api/users/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const idLower = id.toLowerCase();
  const db = readDB();

  const index = db.users.findIndex((u) => u.id === id || u.email.toLowerCase() === idLower);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const existing = db.users[index];
  const payload = req.body;

  db.users[index] = {
    ...existing,
    ...payload,
    id: existing.id,
    email: payload.email ? payload.email.trim().toLowerCase() : existing.email,
    lastActiveAt: new Date().toISOString()
  };

  writeDB(db);

  res.json({
    success: true,
    message: 'User profile updated successfully.',
    user: db.users[index]
  });
});

// Delete user from CRM (Admin)
app.delete('/api/users/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const idLower = id.toLowerCase();
  const db = readDB();

  const initialLen = db.users.length;
  db.users = db.users.filter((u) => u.id !== id && u.email.toLowerCase() !== idLower);

  if (db.users.length === initialLen) {
    return res.status(404).json({ success: false, message: 'User not found in CRM.' });
  }

  writeDB(db);
  res.json({ success: true, message: 'User profile deleted successfully.' });
});

// ---------------------------------------------------------------------
// INQUIRIES MANAGEMENT & AUTOMATIC CRM USER SYNC
// ---------------------------------------------------------------------

// Submit new inquiry (Public endpoint)
app.post('/api/inquiries', (req: Request, res: Response) => {
  const {
    fullName,
    email,
    phone,
    company,
    websiteType,
    requiredFeatures,
    estimatedBudget,
    completionTimeline,
    description,
    honeypot
  } = req.body;

  if (honeypot) {
    return res.status(400).json({ success: false, message: 'Spam detected.' });
  }

  if (!fullName || !email || !description) {
    return res.status(400).json({
      success: false,
      message: 'Please provide required fields: fullName, email, and description.'
    });
  }

  const db = readDB();
  const normalizedEmail = email.trim().toLowerCase();
  const inqId = `inq-${Date.now()}`;

  const newInquiry: InquiryItem = {
    id: inqId,
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone ? phone.trim() : undefined,
    company: company ? company.trim() : undefined,
    websiteType: websiteType || 'Business website',
    requiredFeatures: Array.isArray(requiredFeatures) ? requiredFeatures : [],
    estimatedBudget: estimatedBudget || 'To be determined',
    completionTimeline: completionTimeline || 'Flexible',
    description: description.trim(),
    status: 'new',
    notes: 'Inquiry received from website contact portal.',
    createdAt: new Date().toISOString()
  };

  db.inquiries.unshift(newInquiry);

  // Sync / Upsert into db.users CRM
  const userSnapshot: UserInquirySnapshot = {
    inquiryId: inqId,
    websiteType: newInquiry.websiteType,
    submittedAt: newInquiry.createdAt,
    estimatedBudget: newInquiry.estimatedBudget,
    completionTimeline: newInquiry.completionTimeline,
    status: 'new',
    description: newInquiry.description,
    requiredFeatures: newInquiry.requiredFeatures
  };

  const existingUserIndex = db.users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  const budgetVal = calculateBudgetValue(newInquiry.estimatedBudget);

  if (existingUserIndex >= 0) {
    const usr = db.users[existingUserIndex];
    usr.totalInquiries += 1;
    usr.totalEstimatedValue += budgetVal;
    usr.lastActiveAt = newInquiry.createdAt;
    if (newInquiry.phone) usr.phone = newInquiry.phone;
    if (newInquiry.company) usr.company = newInquiry.company;
    if (!usr.websiteTypes.includes(newInquiry.websiteType)) {
      usr.websiteTypes.push(newInquiry.websiteType);
    }
    usr.inquiryHistory.unshift(userSnapshot);
  } else {
    const newUser: UserItem = {
      id: `usr-${Date.now()}`,
      fullName: newInquiry.fullName,
      email: normalizedEmail,
      phone: newInquiry.phone,
      company: newInquiry.company,
      location: 'Lead Submission',
      role: 'lead',
      status: 'in_discussion',
      totalInquiries: 1,
      totalEstimatedValue: budgetVal,
      currency: 'USD',
      notes: `Lead acquired via website inquiry for ${newInquiry.websiteType}.`,
      websiteTypes: [newInquiry.websiteType],
      associatedProjects: [],
      inquiryHistory: [userSnapshot],
      createdAt: newInquiry.createdAt,
      lastActiveAt: newInquiry.createdAt
    };
    db.users.unshift(newUser);
  }

  writeDB(db);

  res.status(201).json({
    success: true,
    message: 'Project inquiry dispatched, stored, and client CRM synced.',
    inquiry: newInquiry
  });
});

// Get all inquiries (Admin)
app.get('/api/inquiries', (req: Request, res: Response) => {
  const db = readDB();
  const { status, search } = req.query;

  let results = db.inquiries;

  if (status && typeof status === 'string' && status !== 'all') {
    results = results.filter((item) => item.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (item) =>
        item.fullName.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.company && item.company.toLowerCase().includes(q)) ||
        item.description.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: results.length,
    inquiries: results
  });
});

// Update inquiry status or notes (Admin)
app.patch('/api/inquiries/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const db = readDB();

  const index = db.inquiries.findIndex((i) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Inquiry not found.' });
  }

  if (status) db.inquiries[index].status = status;
  if (notes !== undefined) db.inquiries[index].notes = notes;

  // Also update inquiryHistory item in corresponding user
  const user = db.users.find((u) => u.email.toLowerCase() === db.inquiries[index].email.toLowerCase());
  if (user) {
    const snap = user.inquiryHistory.find((s) => s.inquiryId === id);
    if (snap && status) {
      snap.status = status;
    }
  }

  writeDB(db);

  res.json({
    success: true,
    message: 'Inquiry updated successfully.',
    inquiry: db.inquiries[index]
  });
});

// Delete inquiry (Admin)
app.delete('/api/inquiries/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();

  const initialLen = db.inquiries.length;
  db.inquiries = db.inquiries.filter((i) => i.id !== id);

  if (db.inquiries.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Inquiry not found.' });
  }

  writeDB(db);
  res.json({ success: true, message: 'Inquiry deleted successfully.' });
});

// ---------------------------------------------------------------------
// ADMIN OVERVIEW & STATS
// ---------------------------------------------------------------------
app.get('/api/admin/stats', (_req: Request, res: Response) => {
  const db = readDB();

  const totalInquiries = db.inquiries.length;
  const newInquiries = db.inquiries.filter((i) => i.status === 'new').length;
  const inProgressInquiries = db.inquiries.filter((i) => i.status === 'in_review' || i.status === 'contacted').length;
  const totalProjects = db.projects.length;
  const featuredProjects = db.projects.filter((p) => p.featured).length;
  const totalUsers = db.users.length;
  const activeClients = db.users.filter((u) => u.role === 'client' || u.status === 'completed' || u.status === 'active').length;

  let estimatedPipeline = 0;
  db.users.forEach((u) => {
    estimatedPipeline += u.totalEstimatedValue || 0;
  });

  res.json({
    success: true,
    stats: {
      totalInquiries,
      newInquiries,
      inProgressInquiries,
      totalProjects,
      featuredProjects,
      totalUsers,
      activeClients,
      estimatedPipeline,
      currency: 'USD',
      mongoConnected: isMongoConnected
    }
  });
});

// ---------------------------------------------------------------------
// QUOTATIONS API (Cloud Stored Proposals in MongoDB Atlas)
// ---------------------------------------------------------------------
app.get('/api/quotations', async (_req: Request, res: Response) => {
  try {
    if (isMongoConnected) {
      const quotations = await QuotationModel.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: quotations.length, quotations });
    }
    return res.json({ success: true, count: 0, quotations: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/quotations', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload.quoteNumber) {
      payload.quoteNumber = `AE-QUO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    }

    if (isMongoConnected) {
      const saved = await QuotationModel.findOneAndUpdate(
        { quoteNumber: payload.quoteNumber },
        payload,
        { upsert: true, new: true }
      );
      return res.json({
        success: true,
        message: 'Commercial proposal saved successfully to MongoDB Atlas.',
        quotation: saved
      });
    }

    res.json({
      success: true,
      message: 'Commercial proposal accepted (running in local snapshot mode).',
      quotation: payload
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/quotations/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (isMongoConnected) {
      const quotation = await QuotationModel.findOne({
        $or: [{ quoteNumber: id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
      });
      if (!quotation) {
        return res.status(404).json({ success: false, message: 'Quotation not found.' });
      }
      return res.json({ success: true, quotation });
    }
    res.status(404).json({ success: false, message: 'Database disconnected.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start Server & Connect to MongoDB Atlas
app.listen(PORT, async () => {
  console.log(`[Alpha Encoders Server] Running on http://localhost:${PORT}`);
  console.log(`[Alpha Encoders Server] Local snapshot cache: ${DB_FILE}`);
  await connectMongoDB();
});
