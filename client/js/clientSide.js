websocketGame = {

    // indicate who's drawing now
    isTurnToDraw: false,

    // dataType constants
    WORD_ANSWER: 0,
    CHAT_MESSAGE: 1,
    GAME_LOGIC: 2,

    // gameState game logic constants
    WAITING_TO_START: 0,
    GAME_START: 1,
    GUESSING: 2,
    GAME_RESTART: 3,
    GAME_OVER: 4,
}

//var video = document.getElementById("video");
// canvas context
var canvas = document.getElementById("sig-canvas");
var ctx = canvas.getContext('2d');

// initialize script when DOM is ready
$(function () {
    // check for existance of WebSockets in browser
    if (window["WebSocket"]) {

        //create connection
        websocketGame.socket = new WebSocket("ws://127.0.0.1:8000");
        websocketGame.binaryData = "blob";

        // on open event
        websocketGame.socket.onopen = function (e) {
            console.log("WebSocket is open now.");
        };

        // on close event
        websocketGame.socket.onclose = function (e) {
            console.log("WebSocket is closed now.");
        };

        // handle message events
        websocketGame.socket.onmessage = function (e) {
            console.log("onmessage event: ", e.data);
            var data = JSON.parse(e.data);

            // show waiting until two player connect screen
            // if (data.gameState === websocketGame.WAITING_TO_START) {
            //     //show loader
            //     console.log("Waiting to start firing")
            //     $.mobile.showPageLoadingMsg(); 

            // }

            if (data.dataType === websocketGame.CHAT_MESSAGE) {

            }

            if (data.dataType === websocketGame.GAME_LOGIC) {

                // when the right word has been guessed and restart for another round
                if (data.gameState === websocketGame.GAME_OVER) {
                    if (!websocketGame.isTurnToDraw) {
                        $("<div>You guessed it! The right word was " + data.answer + "</div>").dialog();
                        var data = {
                            dataType: websocketGame.GAME_LOGIC,
                            gameState: websocketGame.GAME_RESTART
                        }
                        $("#chat-history").html("");
                        websocketGame.socket.send(JSON.stringify(data));
                    }

                }

                // when both players connected
                if (data.gameState === websocketGame.GAME_START) {

                    //clear the chat history
                    $("#chat-history").html("");

                    // show the drawer his screen
                    if (data.isPlayerTurn) {
                        websocketGame.isTurnToDraw = true;
                        window.location.href = '#two';
                        // display drawing screen
                        $('.draw').show();
                        $('.guess').hide();
                        $('#chat-input').hide();
                        
                    }
                    // put guesser on hold until drawer send drawing
                    else {
                        websocketGame.isTurnToDraw = false;
                        window.location.href = '#four';
                    }

                }

                // user checks if its his turn to guess
                if (data.gameState === websocketGame.GUESSING && !data.isPlayerTurn) {
                    // goes to canvas page and displays video of the other player drawing
                    window.location.href = '#three';
                    $("#chat-history").append("<li> Please guess the drawn word </li>");
                    // display guessing screen
                    $('.draw').hide();
                    $('.guess').show();
                    $('#chat-input').show();
                    
                    //ctx.drawImage(data.video, 5, 5);

                }
            }
        }

        //get selected word
        $("#easy-button").on("click", function () {
            // get name of word from value attribute
            var text = $(this).attr('value');
            $("#chat-history").append("<li> Please draw the word: " + text + "</li>");
            var data = {
                dataType: websocketGame.WORD_ANSWER,
                message: text
            }

            console.log("sending: " + text)
            websocketGame.socket.send(JSON.stringify(data));
        });


        // Get the stream
        // var videoStream = canvas.captureStream(30); // 25 FPS
        // var mediaRecorder = new MediaRecorder(videoStream);
        // var chunks = [];
        // mediaRecorder.ondataavailable = function (e) {
        //     chunks.push(e.data);
        // };
        // mediaRecorder.start();
        // mediaRecorder.onstop = function (e) {

        //     var blob = new Blob(chunks, { 'type': 'video/mp4' });

        //     console.log("chunks data: " + chunks)

        //     chunks = [];
        //     var data = {
        //         dataType: websocketGame.GAME_LOGIC,
        //         gameState: websocketGame.GUESSING,
        //         video: chunks
        //     }
        //     // send video stream of drawing
        //     websocketGame.socket.send(blob)

        // };

        $('#send').on("click", function () {
            //mediaRecorder.stop();
            // clear the canvas
            canvas.width = canvas.width;
            // go to waiting page
            window.location.href = '#four';

            var data = {
                dataType: websocketGame.GAME_LOGIC,
                gameState: websocketGame.GUESSING,
                video: canvas.toDataURL(),
            }
            // send video stream of drawing
            websocketGame.socket.send(JSON.stringify(data));
        });

        $("#send-guess").on("click", sendMessage);

        $("#chat-input").on("keypress", function (event) {
            if (event.key === "Enter") {
                sendMessage();
            }
        });

        function sendMessage() {
            var message = $("#chat-input").val();
            $("#chat-history").append("<li> You guessed: " + message + "</li>");
            // pack the message into an object
            var data = {};
            data.dataType = websocketGame.CHAT_MESSAGE;
            data.message = message;

            $("#chat-input").val("");
            websocketGame.socket.send(JSON.stringify(data));

        }
    }
})