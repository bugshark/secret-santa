const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema definition
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'], // Adds custom error message
        unique: true, // Ensures no two users can have the same email
        lowercase: true, // Automatically converts email to lowercase
        trim: true, // Removes leading/trailing whitespaces
        match: [/.+\@.+\..+/, 'Please use a valid email address'], // Basic email regex validation
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'], // Minimum password length
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true, // Removes leading/trailing whitespaces
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});

// Hash password before saving it to the database
userSchema.pre('save', async function (next) {
    // Check if password is new or modified
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10); // Generate a salt
        this.password = await bcrypt.hash(this.password, salt); // Hash the password
        next();
    } catch (error) {
        next(error); // Pass error to the next middleware
    }
});

// Method to compare the hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password); // Compare input password with hashed password
};

module.exports = mongoose.model('User', userSchema);
