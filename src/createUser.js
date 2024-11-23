const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user'); // Adjust the path to your User model

dotenv.config(); // Load environment variables

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database connected'))
    .catch(err => console.error(err));

const createUser = async () => {
    const newUser = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword123', // You can hash this if required
    });

    await newUser.save();
    console.log('User created:', newUser);
    mongoose.disconnect();
};

createUser().catch(console.error);
