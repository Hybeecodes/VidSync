const Session = require('./models/Session');
module.exports = server => {
    const io = require('socket.io')(server);
    io.on('connection', async function(socket) {
        const userName = socket.handshake.query.username;
        console.log(`New Connection by ${userName}`);
        socket.on('event', function(data) {
            socket.in(data.sessionId).emit('event', data);
        });

        socket.on('join:session', async function(data) {
            const {sessionId, userId} = data;
            socket.join(sessionId);
            // add user too session
            let session = await Session.findOne({sessionId}).populate({path: 'connectedUsers', select: 'username'});
            const users = session.connectedUsers.map((user) => {
                return user._id;
            });
            if (session) {
                if (!users.includes(userId) &&  userId !== String(session.adminId)) {
                    session.connectedUsers.push(userId);
                    await session.save();
                }
            }
            session = await Session.findOne({sessionId}).populate({path: 'connectedUsers', select: 'username'});
            const userNames = session.connectedUsers.map((user) => {
                return user.username;
            });
            console.log(`${userName} joins session ${sessionId}`);
            socket.in(sessionId).emit('joined:session', {
                message: `${userName} has joined the session`,
                user: userName,
                connectedUsers: userNames
            })
        });

        socket.on('leave:session', function({ sessionId }) {
            console.log(`${userName} leaves session ${sessionId}`);
            socket.leave(sessionId);
            socket.in(sessionId).emit('left:channel', {
                message: `${userName} left the channel`,
                user: userName
            });
        });

        socket.on('end:session', function ({sessionId}) {
            console.log('end Session: ', sessionId);
            socket.in(sessionId).emit('session:ended')
        })

        socket.on('message', data => {
            const {room, message} = data;
            socket.to(room).emit('message', data);
        })
    });
    return io;
};

