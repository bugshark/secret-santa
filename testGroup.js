const mongoose = require('mongoose');
const Group = require('./src/models/group');

async function testGroup() {
    try {
        await mongoose.connect('mongodb+srv://bugshark:iAK58LejEAfS5Mgk@cluster-secret-santa.qj6fc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-Secret-Santa', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to the database');

        const group = new Group({
            name: 'Test Group',
            organizer: '67415b2afd74c58f9a1a424b', // Replace with a valid ObjectId from your database
            participants: ['67415b2afd74c58f9a1a424b'],
        });

        await group.save();
        console.log('Group created successfully:', group);

        await mongoose.disconnect();
        console.log('Disconnected from the database');
    } catch (error) {
        console.error('Error during test:', error);
    }
}

testGroup();
