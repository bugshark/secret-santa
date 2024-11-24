// src/models/group.js
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
        required: true,
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Refers to the User model
        },
    ],
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});

// Export the Group model
module.exports = mongoose.model('Group', groupSchema);
