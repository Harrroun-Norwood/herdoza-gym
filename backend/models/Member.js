const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    contact: {
        type: String,
        required: true
    },
    membershipType: {
        type: String,
        required: true,
        enum: ['gym', 'mma', 'dance']
    },
    sessionInfo: {
        type: Object,
        required: true
    },
    dateOfMembership: {
        type: Date,
        required: true
    },
    dateOfExpiration: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'expired']
    }
});

module.exports = mongoose.model('Member', memberSchema); 