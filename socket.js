module.exports = server => {
    const io = require('socket.io')(server);
    const mongoose = require('mongoose');

    io.on('connection', async function(socket) {
        console.log('connected');
        socket.on('event', function(data) {
            console.log(data)
            socket.emit('event', data);
        });
    });
    
}