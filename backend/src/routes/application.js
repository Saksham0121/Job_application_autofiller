const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/applications
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = { userId: req.user.id, ...(status && { status }) };
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: Number(limit),
        include: { resume: { select: { id: true, name: true } } }
      }),
      prisma.application.count({ where })
    ]);
    res.json({ applications, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// POST /api/applications
router.post('/', authenticate, async (req, res) => {
  try {
    const application = await prisma.application.create({
      data: { userId: req.user.id, ...req.body }
    });
    res.status(201).json({ application });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// PUT /api/applications/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const application = await prisma.application.update({
      where: { id: req.params.id }, data: req.body
    });
    res.json({ application });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// DELETE /api/applications/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.application.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

// GET /api/applications/stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = await prisma.application.groupBy({
      by: ['status'], where: { userId: req.user.id }, _count: { status: true }
    });
    const total = await prisma.application.count({ where: { userId: req.user.id } });
    const avgScore = await prisma.application.aggregate({
      where: { userId: req.user.id, matchScore: { not: null } },
      _avg: { matchScore: true }
    });
    res.json({ stats, total, avgMatchScore: avgScore._avg.matchScore });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
