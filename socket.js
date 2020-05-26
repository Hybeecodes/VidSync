const Session = require('./models/Session');
module.exports = server => {
    const io = require('socket.io')(server);
    io.on('connection', async function(socket) {
        const userName = socket.handshake.query.username;
        console.log(`${userName} is connected`);
        socket.on('event', function(data) {
            console.log(data);
            socket.in(data.sessionId).emit('event', data);
        });

        socket.on('join:session', async function(data) {
            const {sessionId, userName} = data;
            if(! sessionId || !userName) {
                return ;
            }
            socket.join(sessionId);
            // add user too session
            let session = await Session.findOne({sessionId});
            const users = session.connectedUsers.map((user) => {
                return user;
            });
            if (session) {
                if (!users.includes(userName) &&  userName !== String(session.adminName)) {
                    session.connectedUsers.push(userName);
                    await session.save();
                }
            }
            session = await Session.findOne({sessionId});
            const userNames = session.connectedUsers.map((user) => {
                return user;
            });
            console.log('connected usernames', userNames);
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

