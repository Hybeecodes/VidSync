console.log($('#connected-users'));
const isAdmin = $('#isAdmin').val();
let isSessionEnded = false;
console.log(typeof isAdmin);
if (isAdmin === 'false') {
    $('#controls').hide();
}else {
    $('#link-field').val(window.location.href);
}
const userName = $('#userName').val();
const sessionId = $('#sessionId').val();
const userId = $('#userId').val();
const socket = io(`?username=${userName}&sessionId=${sessionId}`);
socket.on('connect', function() {
    console.log('USERNAME', userName);
    socket.emit('join:session', { sessionId, userName });
    // get list of connected users
    axios.get(`/sessions/${sessionId}/users`).then((res) => {
        const users = res.data.message;
        console.log('connected users on joining', users);
        if(users.length > 0) {
            let htmlContent = '';
            users.forEach((user) => {
                htmlContent += `
                <li class="list-group-item connected-user">${user}</li>`
            })
            $('#connected-users').html(htmlContent);
        }
        // added new user to connected users
        if(isAdmin === 'false') {
            $('#connected-users').html(`<li class="list-group-item connected-user">${userName}</li>`);
        }
    }).catch(err => {
        console.log(err);
    })
})
// 2. This code loads the IFrame Player API code asynchronously.
const tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
let player;
function onYouTubeIframeAPIReady() {
    const videoId = $('#videoId').val();
    player = new YT.Player('player', {
        height: '500',
        width: '850',
        videoId,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        },
        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            enablejsapi: 1,
            origin: 'http://localhost:3000',
            rel:0,
            showinfo: 0
        }
    });
}
function sliderLoop() {
    if(!player) {
        return;
    }

    setInterval(() => {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        const percentage = (currentTime/duration)*100;
        document.getElementById('myRange')
            .setAttribute('value', percentage);
    }, 200);
}
document.querySelector('#pauseBtn')
    .addEventListener('click', function(e) {
        socket.emit(`event`, {state: 'PAUSE', time: player.getCurrentTime(), sessionId});
        player.pauseVideo();
    });
document.getElementById('myRange')
    .addEventListener('change', function (e) {
        const value = e.target.valueAsNumber;
        const duration = player.getDuration();
        const actualTime = duration * value / 100;
        socket.emit('event', {state: 'SEEK', time: actualTime, sessionId});
        console.log(actualTime);
        player.seekTo(actualTime);
    })
document.querySelector('#playBtn')
    .addEventListener('click', function(e) {
        socket.emit('event', {state: 'PLAY', time: player.getCurrentTime(), sessionId});
        player.playVideo();
    });
socket.on('event', function(data) {
    console.log(data);
    if (player) {
        if(data.state === 'PLAY') {
            player.seekTo(data.time);
            player.playVideo();
        }else if(data.state === 'PAUSE') {
            player.seekTo(data.time);
            player.pauseVideo();
        }else if(data.state === 'SEEK') {
            player.seekTo(data.time);
        }
    }
});

socket.on('session:ended', function (data) {
    player.stopVideo();
    swal('Session Ended By Admin').then(() => {
        window.location.href = '/';
    });
});

socket.on('joined:session', function (data) {
    console.log('data', data);
    const {connectedUsers} = data;
    let htmlContent = '';
    connectedUsers.forEach((user) => {
        htmlContent += `
                <li class="list-group-item connected-user">${user}</li>
                `
    });
    $('#connected-users').html(htmlContent);
    console.log(player.getPlayerState());
    console.log(YT.PlayerState.PLAYING);
    if(player.getPlayerState() === YT.PlayerState.PLAYING)
        setTimeout(() => {
            socket.emit('event', {state: 'SEEK', time: player.getCurrentTime()+ 3, sessionId});
        }, 3000);
});

socket.on('left:channel', function(data) {
    console.log('data', data);
    const {connectedUsers} = data;
    let htmlContent = '';
    connectedUsers.forEach((user) => {
        htmlContent += `
                <li class="list-group-item connected-user">${user}</li>
                `
    });
    $('#connected-users').html(htmlContent);
})

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    sliderLoop();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
    console.log('changed', event);
    // if (event.data === 5 && isAdmin === 'true' && !isSessionEnded) {
    //     // suggest to End Session
    //     swal({
    //         title: "Do you want to End this Session?",
    //         text: "It seems the video has ended so you might want to end this session",
    //         icon: "info",
    //         buttons: true,
    //         dangerMode: true,
    //     })
    //         .then((willDelete) => {
    //             if (willDelete) {
    //                 $('#endSession').trigger();
    //             } else {
    //
    //             }
    //         });
    // }
}
function stopVideo() {
}

$('#endSession').click(function (e) {
    player.stopVideo();
    socket.emit('end:session', {sessionId});
    swal('Session Ended').then(() => {
        isSessionEnded = true;
        window.location.href = '/';
    });
});

$("#update-username-btn").click(function () {
    const newUsername = $("#update-username-input").val();
    axios.post('/guest/update', { username: newUsername, sessionId })
        .then((res) => {
            if(res.data.success === true) {
                socket.emit('change-name:session', {sessionId, prevUsername: userName , newUsername });
                $(`#connected-users li:contains("${userName}")`).text(newUsername);
                $('.alert').removeClass('alert-warning').addClass('alert-success').text(res.data.message);
            } else  {
                $('.alert').removeClass('alert-success').addClass('alert-warning').text(res.data.message);
            }
    }).catch(function (error) {
        $('.alert').removeClass('alert-success').addClass('alert-warning').text(error.response.data.message);
    })
});

new ClipboardJS('.copyLink');