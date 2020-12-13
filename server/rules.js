

// constants
var WORD_ANSWER = 0;
var CHAT_MESSAGE = 1;
var GAME_LOGIC = 2;

// game logic constants
var WAITING_TO_START = 0;
var GAME_START = 1;
var GUESSING = 2;
var GAME_RESTART = 3;

function User(socket) {
    this.socket = socket;

    //assign id,  either 1 or 2
    //users.length==0 ? this.id=1 : this.id=2;

}

function Room() {
    this.users = [];
}

Room.prototype.addUser = function (user) {
    this.users.push(user);
    var room = this;
    msg = "Welcome player " + this.users.length;

    // saving welcome message
    var data = {
        message: msg
    }

    // secnding welcome message
    room.sendAll(JSON.stringify(data));


    // handle user closing
    user.socket.onclose = function () {
        console.log('A connection left.');
        room.removeUser(user);
    }

    this.handleUserMessages(user);
};

Room.prototype.removeUser = function (user) {
    // loop to find the user
    for (var i = this.users.length; i >= 0; i--) {
        if (this.users[i] === user) {
            this.users.splice(i, 1);
        }
    }
};

Room.prototype.sendAll = function (message) {

    for (var i = 0, len = this.users.length; i < len; i++) {
        this.users[i].socket.send(message);
        console.log(message);
    }
};

// receive messages from user
Room.prototype.handleUserMessages = function (user) {
    var room = this;
    user.socket.on("message", function (message) {

        console.log("handleUserMessage recieved: " + message);

        //construct the message
        var data = JSON.parse(message);

        // check if the data is the word that was picked to be drawn
        if (data.dataType === WORD_ANSWER) {
            // make that word the current right answer
            this.currentAnswer = data.message;
        }
    });
};

function GameRoom() {
    // the current turn of player index
    this.playerTurn = 0;

    this.currentAnswer = undefined;
    this.currentGameState = WAITING_TO_START;

    // send the game state to all players
    var gameLogicData = {
        dataType: GAME_LOGIC,
        gameState: WAITING_TO_START
    };

    console.log("sending game logic data");
    this.sendAll(JSON.stringify(gameLogicData));

}

// inherit Room
GameRoom.prototype = new Room();

GameRoom.prototype.addUser = function (user) {
    // aka super(user)
    Room.prototype.addUser.call(this, user);

    // start the game if there are 2 connections
    if (this.currentGameState === WAITING_TO_START && this.users.length == 2)
        this.startGame();
}

GameRoom.prototype.handleUserMessages = function (user) {
    var room = this;
    // gandle on message
    user.socket.on('message', function (message) {

        console.log("[GameRoom] Received message: " + message);

        var data = JSON.parse(message);


        // check if the message is guessing right or wrong
        if (data.dataType === CHAT_MESSAGE) {
            console.log("Current state: " + room.currentGameState);

            if (room.currentGameState === GAME_START) {
                console.log("Got message: " + data.message
                    + " (Answer: " + room.currentAnswer + ")");
            }

            if (room.currentGameState === GAME_START && data.message === room.currentAnswer) {
                var gameLogicData = {
                    dataType: GAME_LOGIC,
                    //gameState: GAME_OVER,
                    //winner: user.id,
                    answer: room.currentAnswer
                };

                room.sendAll(JSON.stringify(gameLogicData));

                room.currentGameState = WAITING_TO_START;


            }
        }

        
        if (data.dataType === GAME_LOGIC) {

            // check if its time to guess the drawing
            if(data.gameState === GUESSING){
                var guessingPlayer=room.users[(room.playerTurn + 1) % 2];

                // datatype: game logic, gamestate: guessing, and video of the drawing
                guessingPlayer.socket.send(JSON.stringify(data));
            }

            // check if player is done guessing
            if (data.gameState === GAME_RESTART) {
                room.startGame(data.message);
            }

        }



    });
};

GameRoom.prototype.startGame = function () {

    // pick a player to draw
    this.playerTurn = (this.playerTurn + 1) % 2;

    // game start for all players
    var gameLogicForEveryone = {
        dataType: GAME_LOGIC,
        gameState: GAME_START,
        isPlayerTurn: false,
    }

    this.sendAll(JSON.stringify(gameLogicForEveryone));

    // game start for drawing player
    var gameLogicForDrawer = {
        dataType: GAME_LOGIC,
        gameState: GAME_START,
        isPlayerTurn: true
    }

    var player = this.users[this.playerTurn];
    player.socket.send(JSON.stringify(gameLogicForDrawer));
};

module.exports.GameRoom = GameRoom;
module.exports.User = User;
module.exports.Room = Room;