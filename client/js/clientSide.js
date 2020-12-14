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
var img = document.createElement("img");
var src = document.getElementById("header");



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

            

            if (data.dataType === websocketGame.CHAT_MESSAGE) {

            }

            if (data.dataType === websocketGame.GAME_LOGIC) {

                // when the right word has been guessed and restart for another round
                if (data.gameState === websocketGame.GAME_OVER) {
                    if (!websocketGame.isTurnToDraw) {
                        alert("You guessed it! The right word was " + data.answer);

                        var restartRequest = {
                            dataType: websocketGame.GAME_LOGIC,
                            gameState: websocketGame.GAME_RESTART
                        }
                        $("#chat-history").html("");
                        

                        // update html component to current score
                        
                        websocketGame.socket.send(JSON.stringify(restartRequest));
                    }
                    $('.hud-main-text').text(data.updatedScore);
                    
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
                if (data.gameState === websocketGame.GUESSING) {
                    // goes to canvas page and displays video of the other player drawing
                    window.location.href = '#three';
                    $("#chat-history").append("<li> Please guess the drawn word </li>");
                    // display guessing screen
                    $('.draw').hide();
                    $('.guess').show();
                    $('#chat-input').show();

                    //create image of last drawing
                    img.src=data.video;
                    src.appendChild(img);
                }
            }
        }

        //get selected easy word
        $("#easy-button").on("click", function () {
            // get name of word from value attribute
            var text = $(this).attr('value');
            $("#chat-history").append("<li> Please draw the word: " + text + "</li>");
            var difficultyData = {
                dataType: websocketGame.WORD_ANSWER,
                difficulty: 1,
                message: text
            }
            // randomize the word choosing after 2 second so the user wont see
            setTimeout(function(){randomizeFunction()}, 2000)
            console.log("sending: " + text)
            websocketGame.socket.send(JSON.stringify(difficultyData));
        });

        //get selected medium word
        $("#medium-button").on("click", function () {
            // get name of word from value attribute
            var text = $(this).attr('value');
            $("#chat-history").append("<li> Please draw the word: " + text + "</li>");
            var difficultyData = {
                dataType: websocketGame.WORD_ANSWER,
                difficulty: 3,
                message: text
            }
            // randomize the word choosing after 2 second so the user wont see
            setTimeout(function(){randomizeFunction()}, 2000)
            console.log("sending: " + text)
            websocketGame.socket.send(JSON.stringify(difficultyData));
        });

        //get selected hard word
        $("#hard-button").on("click", function () {
            // get name of word from value attribute
            var text = $(this).attr('value');
            $("#chat-history").append("<li> Please draw the word: " + text + "</li>");
            var difficultyData = {
                dataType: websocketGame.WORD_ANSWER,
                difficulty: 5,
                message: text
            }
            // randomize the word choosing after 2 second so the user wont see
            setTimeout(function(){randomizeFunction()}, 2000)
            console.log("sending: " + text)
            websocketGame.socket.send(JSON.stringify(difficultyData));
        });

        // handle sending the drawing from the drawer
        $('#send').on("click", function () {
            //mediaRecorder.stop();
            var imgData = canvas.toDataURL();
            // clear the canvas
            canvas.width = canvas.width;
            // go to waiting page
            
            
            var drawingData = {
                dataType: websocketGame.GAME_LOGIC,
                gameState: websocketGame.GUESSING,
                video: imgData,
            }
            // send video stream of drawing
            websocketGame.socket.send(JSON.stringify(drawingData));
            console.log(imgData)
            window.location.href = '#four';
        });

        $("#send-guess").on("click", sendMessage);

        $("#chat-input").on("keypress", function (event) {
            if (event.key === "Enter") {
                sendMessage();
            }
        });

        function sendMessage() {
            var message = $("#chat-input").val() || "Nothing";
            $("#chat-history").append("<li> You guessed: " + message + "</li>");
            // pack the message into an object
            var wordGuessedData = {};
            wordGuessedData.dataType = websocketGame.CHAT_MESSAGE;
            wordGuessedData.message = message;
            $("#chat-input").val("");
            websocketGame.socket.send(JSON.stringify(wordGuessedData));

        }

        


    }
})