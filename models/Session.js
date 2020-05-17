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

SessionSchema.statics.addUser = function ({user, sessionId}) {
    let _this = this;
    return new Promise(async (resolve, reject) => {
        try {
            const session = await _this.findById(sessionId);
            if (
                !session.connectedUsers.some(u => u.toString() === user._id.toString())
            ) {
                session.connectedUsers.push(user._id);
                await session.save();
            }
            await _this.populate(session, ['connectedUsers']);
            resolve(session.connectedUsers);
        }catch (e) {
            console.log('Unable to add User to session: ', e);
        }
    });
}

SessionSchema.statics.removeUser = function ({user, sessionId}) {
    let _this = this;
    return new Promise(async (resolve, reject) => {
        try {
            const session = await _this.findOne({ _id: sessionId });
            session.connectedUsers.pull(user);
            await session.save();
            await _this.populate(session, ['connectedUsers']);
            resolve(session.connectedUsers);
        }catch (e) {
            console.log('Unable to remove User to session: ', e);
        }
    });
}

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;
