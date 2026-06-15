const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { parseResume } = require('../services/resume/parser');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF and Word documents allowed'));
  }
});

// GET /api/resume - list all resumes
router.get('/', authenticate, async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ resumes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// POST /api/resume/upload - upload a resume
router.post('/upload', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileUrl = `/uploads/${req.file.filename}`;
    const name = req.body.name || req.file.originalname;

    // Parse the resume with AI
    let parsedData = null;
    try {
      parsedData = await parseResume(req.file.path);
    } catch (parseErr) {
      console.error('Resume parsing failed:', parseErr.message);
    }

    const resume = await prisma.resume.create({
      data: {
        userId: req.user.id,
        name,
        fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        parsedData,
        isDefault: (await prisma.resume.count({ where: { userId: req.user.id } })) === 0
      }
    });

    // Auto-populate profile from parsed data if profile is empty
    if (parsedData) {
      try {
        const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
        if (profile && !profile.firstName && parsedData.firstName) {
          await prisma.profile.update({
            where: { userId: req.user.id },
            data: {
              firstName: parsedData.firstName,
              lastName: parsedData.lastName,
              phone: parsedData.phone,
              linkedinUrl: parsedData.linkedinUrl,
              githubUrl: parsedData.githubUrl,
              summary: parsedData.summary,
              skills: parsedData.skills || [],
            }
          });
        }
      } catch (e) { /* non-critical */ }
    }

    res.status(201).json({ resume, parsedData });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// PUT /api/resume/:id/default - set as default
router.put('/:id/default', authenticate, async (req, res) => {
  try {
    await prisma.resume.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    const resume = await prisma.resume.update({ where: { id: req.params.id }, data: { isDefault: true } });
    res.json({ resume });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set default' });
  }
});

// DELETE /api/resume/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const resume = await prisma.resume.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    // Delete file from disk
    const filePath = path.join(__dirname, '../../', resume.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.resume.delete({ where: { id: req.params.id } });
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

module.exports = router;
