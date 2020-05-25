const Session = require('./models/Session');
module.exports = server => {
    const io = require('socket.io')(server);

    io.sockets.on('connection', async function(socket) {
        const userName = socket.handshake.query.username;
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

