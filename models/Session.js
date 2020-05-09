const mongoose = require('mongoose');
const { Schema } = mongoose;

const SessionSchema = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
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
            type: Schema.Types.ObjectId,
            ref: 'User'
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
