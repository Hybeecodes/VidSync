const mongoose = require('mongoose');
const { Schema } = mongoose;

const SessionSchema = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    videoId: {
        type: String,
        required: true
    },
    connectedUsers: [
        {
            type: Schema.Types.ObjectId
        }
    ],
    status: {
        type: String,
        enum: ['active', 'inactive']
    }
}, {
    timestamps: true
});

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;
