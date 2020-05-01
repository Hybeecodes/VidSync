module.exports = server => {
    const io = require('socket.io')(server);
    const mongoose = require('mongoose');

    io.sockets.on('connection', async function(socket) {
        const user = socket.handshake.query;
        console.log(user);
        socket.on('event', function(data) {
            socket.emit('event', data);
        });
    });
    
}