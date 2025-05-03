const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { logger } = require('../utils/logger');

// Get all members
router.get('/', async (req, res) => {
    try {
        const members = await Member.find({});
        res.json({
            status: 'success',
            data: members
        });
    } catch (error) {
        logger.error('Error fetching members:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching members'
        });
    }
});

// Get member by email
router.get('/email/:email', async (req, res) => {
    try {
        const member = await Member.findOne({ email: req.params.email });
        if (!member) {
            return res.status(404).json({
                status: 'error',
                message: 'Member not found'
            });
        }
        res.json({
            status: 'success',
            data: member
        });
    } catch (error) {
        logger.error('Error fetching member:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching member'
        });
    }
});

module.exports = router; 