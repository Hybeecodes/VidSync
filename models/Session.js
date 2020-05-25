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

SessionSchema.statics.addUser = function ({userName, sessionId}) {
    let _this = this;
    return new Promise(async (resolve, reject) => {
        try {
            const session = await _this.findOne({sessionId});
            if (!session.connectedUsers.some(u => u === userName)) {
                if (userName !== session.adminName) session.connectedUsers.push(userName);
                await session.save();
            resolve(session.connectedUsers);
            }
        }catch (e) {
            console.log('Unable to add User to session: ', e);
                reject(e);
        }
    });
}

SessionSchema.statics.removeUser = function ({userName, sessionId}) {
    let _this = this;
    return new Promise(async (resolve, reject) => {
        try {
            const session = await _this.findOne({ sessionId });
            session.connectedUsers.pull(userName);
            await session.save();
            resolve(session.connectedUsers);
        }catch (e) {
            console.log('Unable to remove User to session: ', e);
            reject(e);
        }
    });
}

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;
