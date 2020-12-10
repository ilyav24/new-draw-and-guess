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
    message = "Welcome player " + this.users.length;

    room.sendAll(message);

    // handle user closing
    user.socket.onclose = function () {
        console.log('A connection left.');
        room.removeUser(user);
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

module.exports.User = User;
module.exports.Room = Room;