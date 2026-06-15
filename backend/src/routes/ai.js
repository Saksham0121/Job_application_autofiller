const express = require('express');
const { authenticate } = require('../middleware/auth');
const { classifyFields } = require('../services/ai/fieldClassifier');
const { analyzeJobDescription } = require('../services/ai/jobAnalyzer');
const { generateCoverLetter } = require('../services/ai/coverLetterGenerator');
const prisma = require('../lib/prisma');

const router = express.Router();

// POST /api/ai/classify-fields
// Body: { fields: [{ id, name, label, placeholder, type }] }
router.post('/classify-fields', authenticate, async (req, res) => {
  try {
    const { fields } = req.body;
    if (!fields?.length) return res.status(400).json({ error: 'Fields array required' });

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: { education: true, experience: true }
    });
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { email: true, name: true } });

    const result = await classifyFields(fields, { ...profile, email: user?.email, name: user?.name });
    res.json({ mappings: result });
  } catch (err) {
    console.error('Field classify error:', err);
    res.status(500).json({ error: 'Field classification failed' });
  }
});

// POST /api/ai/analyze-job
// Body: { jobDescription, jobTitle, company }
router.post('/analyze-job', authenticate, async (req, res) => {
  try {
    const { jobDescription, jobTitle, company } = req.body;
    if (!jobDescription) return res.status(400).json({ error: 'Job description required' });

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: { experience: true, education: true }
    });

    const [analysis, resumes] = await Promise.all([
      analyzeJobDescription(jobDescription, jobTitle, company, profile),
      prisma.resume.findFirst({ where: { userId: req.user.id, isDefault: true } })
    ]);

    res.json({ analysis });
  } catch (err) {
    console.error('Job analyze error:', err);
    res.status(500).json({ error: 'Job analysis failed' });
  }
});

// POST /api/ai/cover-letter
// Body: { jobDescription, jobTitle, company, tone }
router.post('/cover-letter', authenticate, async (req, res) => {
  try {
    const { jobDescription, jobTitle, company, tone = 'professional' } = req.body;
    if (!jobDescription) return res.status(400).json({ error: 'Job description required' });

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: { experience: true, education: true, projects: true }
    });
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { email: true, name: true } });

    const coverLetter = await generateCoverLetter(jobDescription, jobTitle, company, tone, { ...profile, email: user?.email, name: user?.name });
    res.json({ coverLetter });
  } catch (err) {
    console.error('Cover letter error:', err);
    res.status(500).json({ error: 'Cover letter generation failed' });
  }
});

module.exports = router;
