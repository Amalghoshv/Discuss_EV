const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Company, User } = require('../models');

const router = express.Router();

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.findAll({
      include: [{ model: User, as: 'employees', attributes: ['id', 'username', 'firstName', 'lastName'] }]
    });
    res.json({ companies });
  } catch (error) {
    console.error('Fetch companies error:', error);
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
});

// Register a new company (creates a pending company)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user.id;

    // Check if company name already exists
    const existing = await Company.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: 'Company name already registered' });
    }

    const company = await Company.create({
      name,
      description,
      ownerId
    });

    // Optionally assign this user to the company
    const user = await User.findByPk(ownerId);
    await user.update({ companyId: company.id });

    res.status(201).json({ message: 'Company registered successfully. Pending approval.', company });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: 'Failed to register company' });
  }
});

// Admin: Update company status (Approve/Reject)
router.put('/:id/verify', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    await company.update({ verificationStatus: status });

    res.json({ message: `Company ${status} successfully`, company });
  } catch (error) {
    console.error('Verify company error:', error);
    res.status(500).json({ message: 'Failed to update company verification status' });
  }
});

module.exports = router;
