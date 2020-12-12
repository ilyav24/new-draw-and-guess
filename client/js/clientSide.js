websocketGame = {

    // constants
    WORD_ANSWER: 0,

    // game logic constants
    WAITING_TO_START: 0,
    GAME_START: 1,
    GAME_OVER: 2,
    GAME_RESTART: 3
}

// canvas context
// var canvas = document.getElementById('drawing-pad');
// var ctx = canvas.getContext('2d');

// initialize script when DOM is ready
$(function () {
    // check for existance of WebSockets in browser
    if (window["WebSocket"]) {

        //create connection
        websocketGame.socket = new WebSocket("ws://127.0.0.1:8000");

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

            // when both players connected
            if(data.gameState === websocketGame.GAME_START){

                // show the drawer his screen
                if(data.isPlayerTurn){
                    window.location.href = '#two';
                    $("#chat-history").append("<li>" + data.message + "</li>");
                }
            }
        }

        //get selected word
        $("#easy-button").on("click", function () {
            var text = $(this).attr('value');
            $("#chat-history").append("<li> Please draw the word: " + text + "</li>");
            var data = {
                dataType: websocketGame.WORD_ANSWER,
                message: text
            }

            console.log("sending: " + text)
            websocketGame.socket.send(JSON.stringify(data));

        });

    }
})