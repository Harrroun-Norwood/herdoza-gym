const express = require('express');
const router = express.Router();
const { validateRegistration } = require('../middleware/validation');
const Registration = require('../models/Registration');
const Member = require('../models/Member');
const { logger } = require('../utils/logger');

// Submit new registration
router.post('/', validateRegistration, async (req, res) => {
    try {
        const { name, email, contact, membershipType, sessionInfo } = req.body;
        
        // Check if email already exists in registrations or members
        const existingRegistration = await Registration.findOne({ email });
        const existingMember = await Member.findOne({ email });
        
        if (existingRegistration || existingMember) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already registered'
            });
        }

        // Create new registration
        const registration = new Registration({
            name,
            email,
            contact,
            membershipType,
            sessionInfo,
            status: 'pending'
        });

        await registration.save();
        
        res.status(201).json({
            status: 'success',
            message: 'Registration submitted successfully',
            data: registration
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error processing registration'
        });
    }
});

// Get all registrations (admin only)
router.get('/all', async (req, res) => {
    try {
        const registrations = await Registration.find({});
        res.json({
            status: 'success',
            data: registrations
        });
    } catch (error) {
        logger.error('Error fetching registrations:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching registrations'
        });
    }
});

// Approve registration
router.post('/approve/:id', async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);
        
        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        // Create new member from registration
        const member = new Member({
            name: registration.name,
            email: registration.email,
            contact: registration.contact,
            membershipType: registration.membershipType,
            sessionInfo: registration.sessionInfo
        });

        await member.save();
        
        // Update registration status
        registration.status = 'approved';
        await registration.save();

        res.json({
            status: 'success',
            message: 'Registration approved and member created',
            data: member
        });
    } catch (error) {
        logger.error('Error approving registration:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error approving registration'
        });
    }
});

// Reject registration
router.post('/reject/:id', async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);
        
        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        registration.status = 'rejected';
        await registration.save();

        res.json({
            status: 'success',
            message: 'Registration rejected',
            data: registration
        });
    } catch (error) {
        logger.error('Error rejecting registration:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error rejecting registration'
        });
    }
});

module.exports = router; 