// src/routes/groups.js
const express = require('express');
const Group = require('./group');
const User = require('./user');
const router = express.Router();

// Route to create a new group
router.post('/create', async (req, res) => {
    try {
        const { name, organizerId } = req.body;

        // Check if both name and organizerId are provided
        if (!name || !organizerId) {
            return res.status(400).json({ message: 'Group name and organizerId are required' });
        }

        // Find the organizer (ensure the user exists)
        const organizer = await User.findById(organizerId);
        if (!organizer) {
            return res.status(400).json({ message: 'Organizer not found' });
        }

        // Create the group
        const newGroup = new Group({
            name,
            organizer: organizerId,
            participants: [organizerId], // Adding organizer as the first participant
        });

        // Save the group to the database
        await newGroup.save();

        // Respond with success
        res.status(201).json({ message: 'Group created successfully', group: newGroup });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to add a participant to the group
router.post('/:groupId/participants', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        // Ensure userId is provided
        if (!userId) {
            return res.status(400).json({ message: 'UserId is required' });
        }

        // Find the group by groupId
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if the user is already a participant
        if (group.participants.includes(userId)) {
            return res.status(400).json({ message: 'User is already a participant' });
        }

        // Add the user as a participant
        group.participants.push(userId);

        // Save the updated group
        await group.save();

        res.status(200).json({ message: 'User added to the group successfully', group });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
