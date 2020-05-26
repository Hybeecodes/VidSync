const Session = require('./models/Session');
module.exports = server => {
    const io = require('socket.io')(server);

    io.sockets.on('connection', async function(socket) {
        const userName = socket.handshake.query.username;
        const connectedSessionId = socket.handshake.query.sessionId;
        console.log(`New Connection by ${userName}`);

        socket.on('event', function(data) {
            socket.in(data.sessionId).emit('event', data);
        });

        socket.on('join:session', async function(data) {
            const {sessionId, userName} = data;
            if(! sessionId || !userName) {
                return ;
            }
            Session.addUser({userName, sessionId}).then((users) => {
                socket.join(sessionId);
                console.log('connected users', users);
                console.log(`${userName} joins session ${sessionId}`);
                socket.in(sessionId).emit('joined:session', {
                    message: `${userName} has joined the session`,
                    user: userName,
                    connectedUsers: users
                })
            }).catch((err) => {
                console.log('error');
            })
        });

        socket.on('disconnect', function() {
            Session.removeUser({userName, sessionId:connectedSessionId}).then((users) => {
                console.log(`${userName} leaves session ${connectedSessionId}`);
                socket.leave(connectedSessionId);
                socket.in(connectedSessionId).emit('left:channel', {
                    message: `${userName} left the channel`,
                    user: userName,
                    connectedUsers: users
                });
            })
        })

        socket.on('end:session', function ({sessionId}) {
            console.log('end Session: ', sessionId);
            socket.in(sessionId).emit('session:ended')
        })

        socket.on('change-name:session', async function({ sessionId, prevUsername, newUsername }) {
            let session = await Session.findOne({ sessionId });

            if (session) {
                session.connectedUsers = session.connectedUsers.map(username => username === prevUsername ? newUsername : username);
                await session.save();

                socket.in(sessionId).emit('joined:session', {
                    message: `${userName} has joined the session`,
                    user: newUsername,
                    connectedUsers: session.connectedUsers
                })
            }
        });

        socket.on('message', data => {
            const {room, message} = data;
            socket.to(room).emit('message', data);
        })
    });
    return io;
};

