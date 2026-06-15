const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/profile - get full profile
router.get('/', authenticate, async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: { education: true, experience: true, projects: true, certifications: true }
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/profile - update profile (upsert)
router.put('/', authenticate, async (req, res) => {
  try {
    const { education, experience, projects, certifications, ...profileData } = req.body;

    const profile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: { ...profileData, updatedAt: new Date() },
      create: { userId: req.user.id, ...profileData },
    });

    res.json({ profile, message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/profile/education
router.post('/education', authenticate, async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const edu = await prisma.education.create({ data: { profileId: profile.id, ...req.body } });
    res.status(201).json({ education: edu });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add education' });
  }
});

// PUT /api/profile/education/:id
router.put('/education/:id', authenticate, async (req, res) => {
  try {
    const edu = await prisma.education.update({ where: { id: req.params.id }, data: req.body });
    res.json({ education: edu });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update education' });
  }
});

// DELETE /api/profile/education/:id
router.delete('/education/:id', authenticate, async (req, res) => {
  try {
    await prisma.education.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete education' });
  }
});

// POST /api/profile/experience
router.post('/experience', authenticate, async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    const exp = await prisma.experience.create({ data: { profileId: profile.id, ...req.body } });
    res.status(201).json({ experience: exp });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add experience' });
  }
});

// PUT /api/profile/experience/:id
router.put('/experience/:id', authenticate, async (req, res) => {
  try {
    const exp = await prisma.experience.update({ where: { id: req.params.id }, data: req.body });
    res.json({ experience: exp });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

// DELETE /api/profile/experience/:id
router.delete('/experience/:id', authenticate, async (req, res) => {
  try {
    await prisma.experience.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

// POST /api/profile/projects
router.post('/projects', authenticate, async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    const proj = await prisma.project.create({ data: { profileId: profile.id, ...req.body } });
    res.status(201).json({ project: proj });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add project' });
  }
});

// PUT /api/profile/projects/:id
router.put('/projects/:id', authenticate, async (req, res) => {
  try {
    const proj = await prisma.project.update({ where: { id: req.params.id }, data: req.body });
    res.json({ project: proj });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/profile/projects/:id
router.delete('/projects/:id', authenticate, async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// GET /api/profile/autofill - returns flattened profile for extension use
router.get('/autofill', authenticate, async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: { education: { orderBy: { createdAt: 'desc' }, take: 1 }, experience: { orderBy: { createdAt: 'desc' }, take: 3 } }
    });
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { email: true, name: true } });

    const autofillData = {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      fullName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user?.name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      city: profile?.city || '',
      state: profile?.state || '',
      country: profile?.country || '',
      zipCode: profile?.zipCode || '',
      linkedinUrl: profile?.linkedinUrl || '',
      githubUrl: profile?.githubUrl || '',
      portfolioUrl: profile?.portfolioUrl || '',
      websiteUrl: profile?.websiteUrl || '',
      headline: profile?.headline || '',
      summary: profile?.summary || '',
      skills: profile?.skills || [],
      yearsOfExp: profile?.yearsOfExp || 0,
      currentCompany: profile?.experience?.[0]?.company || '',
      currentTitle: profile?.experience?.[0]?.title || '',
      highestDegree: profile?.education?.[0]?.degree || '',
      university: profile?.education?.[0]?.institution || '',
    };

    res.json({ autofillData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch autofill data' });
  }
});

module.exports = router;
