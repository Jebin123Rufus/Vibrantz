import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Groq from 'groq-sdk';
import { OAuth2Client } from 'google-auth-library';
import User from './models/User.js';
import Project from './models/Project.js';

dotenv.config({ path: './.env' });

const app = express();
app.use(cors());
app.use(express.json());

// Security Headers for Google OAuth
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const groq = new Groq({
  apiKey: process.env.VITE_GROQ_API_KEY,
});

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error('Email and password are required');
    const user = new User({ email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });
    const { email, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ 
      $or: [{ googleId }, { email }] 
    });

    if (!user) {
      user = new User({ email, googleId });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json({ user: { id: user._id, email: user.email } });
});

// Project Routes
app.get('/api/projects', authenticate, async (req, res) => {
  const projects = await Project.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(projects.map(p => ({ ...p._doc, id: p._id })));
});

app.post('/api/projects', authenticate, async (req, res) => {
  try {
    const { title, description } = req.body;
    const project = new Project({
      userId: req.userId,
      title,
      description,
      status: 'generating'
    });
    await project.save();
    res.json({ ...project._doc, id: project._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/projects/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ ...project._doc, id: project._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/projects/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    res.json({ ...project._doc, id: project._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// AI Generation Route (Streaming)
app.post('/api/generate', authenticate, async (req, res) => {
  const { projectIdea, projectId } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const SYSTEM_PROMPT = `You are an advanced AI Project Architect. Your role is to convert a user's project idea into a complete, structured, execution-ready architecture blueprint.

You MUST output a valid JSON object with the following structure:
{
  "projectAnalysis": {
    "objective": "string",
    "type": "string",
    "complexity": "beginner|intermediate|advanced",
    "domains": ["string"]
  },
  "skillTree": [
    {
      "category": "string",
      "skills": [
        {
          "name": "string",
          "subskills": ["string"]
        }
      ]
    }
  ],
  "knowledgeChecklist": [
    {
      "module": "string",
      "items": ["string"]
    }
  ],
  "moduleArchitecture": [
    {
      "name": "string",
      "purpose": "string",
      "dependencies": ["string"],
      "inputs": ["string"],
      "outputs": ["string"]
    }
  ],
  "executionRoadmap": [
    {
      "step": number,
      "title": "string",
      "description": "string"
    }
  ],
  "folderStructure": "string (formatted tree structure)",
  "taskBreakdown": [
    {
      "module": "string",
      "tasks": ["string"]
    }
  ]
}

Be specific, actionable, and dependency-aware. Use the tech stack: React + TypeScript + Vite + Tailwind CSS for frontend. For backend, suggest appropriate choices.
IMPORTANT: You MUST return ONLY the JSON object. Do not include markdown code blocks (like \`\`\`json), no preamble, and no postscript. 
Ensure the JSON is perfectly valid. Do NOT use raw newline characters inside string values; use "\\\\n" escape sequences if a newline is needed (especially in the folderStructure field).
Do NOT include any text outside the JSON. Return ONLY valid JSON.`;

  try {
    const stream = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Project Idea: ${projectIdea}\n\nGenerate a complete project architecture blueprint.` },
      ],
      model: 'llama-3.3-70b-versatile',
      stream: true,
    });

    let fullText = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullText += content;
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Generation error:', err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
