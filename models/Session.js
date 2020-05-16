const mongoose = require('mongoose');
const { Schema } = mongoose;

const SessionSchema = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    adminName: {
        type: String,
        required: true
    },
    videoId: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    connectedUsers: [
        {
            type: String,
        }
    ],
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    }
}, {
    timestamps: true
});

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;
