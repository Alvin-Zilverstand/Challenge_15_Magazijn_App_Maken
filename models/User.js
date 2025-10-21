const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: function() {
            return this.role === 'student';
        },
        sparse: true,
        unique: true,
        validate: {
            validator: function(email) {
                return /^\d{6}@vistacollege\.nl$/.test(email);
            },
            message: 'Email must be in the format: 123456@vistacollege.nl'
        }
    },
    role: {
        type: String,
        enum: ['admin', 'student'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);