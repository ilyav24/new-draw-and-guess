// constants
var WORD_ANSWER = 0;

function User(socket) {
    this.socket = socket;

    //assign id,  either 1 or 2
    //users.length==0 ? this.id=1 : this.id=2;

}

function Room() {
    this.users = [];

    // the current turn of player index
    this.playerTurn = 0;

    this.currentAnswer = undefined;

}

Room.prototype.addUser = function (user) {
    this.users.push(user);
    var room = this;
    message = "Welcome player " + this.users.length;

    room.sendAll(message);

    // handle user closing
    user.socket.onclose = function () {
        console.log('A connection left.');
        room.removeUser(user);
    }

    this.handleUserMessages(user);

    if(room.users.length == 2){
        room.startGame();
    }
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
Room.prototype.handleUserMessages = function(user) {
    var room = this;
    user.socket.on("message", function(message) {

        console.log("handleUserMessage recieved: " + message);
        
        //construct the message
        var data = JSON.parse(message);

        // check if the data is the word that was picked to be drawn
        if(data.dataType === WORD_ANSWER){
            // make that word the current right answer
            this.currentAnswer = data.message;
        }
    });
};

Room.prototype.startGame = function(){
    var room = this;
    // pick a player to draw
    this.playerTurn = (this.playerTurn + 1) % 2;

    

};

module.exports.User = User;
module.exports.Room = Room;