const express = require('express');
const mongoose = require('mongoose');
const Group = require('../models/group');
const User = require('../models/user');

const router = express.Router();

// Route to create a new group
router.post('/create', async (req, res) => {
    console.log('--- Incoming Request to Create Group ---');
    try {
        console.log('Request Body:', req.body);

        const { name, organizerId } = req.body;

        // Validate request body
        if (!name || !organizerId) {
            console.log('Validation Error: Missing name or organizerId');
            return res.status(400).json({ message: 'Group name and organizerId are required' });
        }

        console.log(`Validating organizerId format: ${organizerId}`);
        if (!mongoose.Types.ObjectId.isValid(organizerId)) {
            console.log('Validation Error: Invalid organizerId format');
            return res.status(400).json({ message: 'Invalid organizerId format' });
        }

        console.log('Finding organizer in database...');
        const organizer = await User.findById(organizerId);
        if (!organizer) {
            console.log('Error: Organizer not found in database');
            return res.status(400).json({ message: 'Organizer not found' });
        }
        console.log('Organizer found:', organizer);

        console.log('Preparing new Group object...');
        const newGroup = new Group({
            name,
            organizer: organizerId,
            participants: [organizerId], // Adding organizer as the first participant
        });

        console.log('Group object prepared:', newGroup);

        console.log('Saving group to the database...');
        try {
            await newGroup.save();
            console.log('Group saved successfully:', newGroup);
        } catch (saveError) {
            console.error('Error saving group:', saveError);
            throw saveError; // Let the outer try-catch handle this.
        }
        console.log('--- Group Creation Successful ---');
        res.status(201).json({ message: 'Group created successfully', group: newGroup });
    } catch (error) {
        console.error('--- Error during group creation ---');
        console.error('Error Details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
