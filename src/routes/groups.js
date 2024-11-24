const express = require('express');
const mongoose = require('mongoose');
const Group = require('../models/group');
const User = require('../models/user');
const Match = require('../models/match');

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
// Route to add a participant to the group
router.post('/:groupId/participants', async (req, res) => {
    console.log('Reached add participants route');
    try {
        const { groupId } = req.params; // Get group ID from URL parameter
        const { userId } = req.body; // Get userId from request body

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
        console.error('Error during participant addition:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Match Participants to a group and save in the DB
router.post('/:groupId/secret-santa', async (req, res) => {
    try {
        const { groupId } = req.params;

        // Find the group by groupId
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Fetch participants from the group and filter out the organizer from self-matching
        let participants = group.participants.slice();
        const matches = {};

        // Prevent self-matching by excluding the organizer for their own match
        participants = participants.filter(id => id !== group.organizer.toString());

        // Create pairs for Secret Santa
        let shuffledParticipants = [...participants];
        shuffledParticipants = shuffledParticipants.sort(() => Math.random() - 0.5); // Shuffle participants

        for (let i = 0; i < participants.length; i++) {
            // Ensure no one is matched with themselves
            const giver = participants[i];
            let receiver = shuffledParticipants[i];

            if (giver.toString() === receiver.toString()) {
                // If self-match happens, swap with the next available user
                receiver = shuffledParticipants[(i + 1) % participants.length];
            }

            matches[giver] = receiver; // Assign the match

            // Save the match to the database
            const newMatch = new Match({
                groupId,
                userId: giver,
                matchId: receiver,
            });
            await newMatch.save();
        }

        // Send the result
        res.status(200).json({ message: 'Secret Santa matches created', matches });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
