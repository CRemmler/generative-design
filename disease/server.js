var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');

var roomData = {};

app.use(express.static(__dirname));

app.get('/', function(req, res){
	res.sendfile('index.html');
});

io.on('connection', function(socket){
	
	// user enters room
	socket.on("enter room", function(data) {
		
    // declare myRoom
    socket.myRoom = data.room;
    var myRoom = socket.myRoom;
		if (!roomData[myRoom]) {
			roomData[myRoom] = {};
			roomData[myRoom].teacherInRoom = false;
      roomData[myRoom].turtles = {};
		}
    // declare myUserType, first user in is a teacher, rest are students
		socket.myUserType = (!roomData[myRoom].teacherInRoom) ? "teacher" : "student";
		var myUserType = socket.myUserType;
		
    // declare mySocketId
		var mySocketId = socket.id;
    
    // send settings to client
    socket.emit("save settings", {room: myRoom, userType: myUserType, socketId: mySocketId});

    // join myRoom
		socket.join(myRoom+"-"+myUserType);
		
    // tell client intro actions, dependent on myUserType
    socket.emit("display interface");
    
		if (myUserType === "teacher") {
      // remembet that there is already a teacher in room
			roomData[myRoom].teacherInRoom = true;
      
      // action for teacher to take
			socket.emit("setup teacher");
      
		} else {
      // action for teacher to take
			socket.to(myRoom+"-teacher").emit("setup student", {socketId: mySocketId});
		}
    
	});	
  
  socket.on("update all", function(data) {
    var myRoom = socket.myRoom;
    var socketId = data.socketId;
    io.to(socketId).emit("send update", {turtles: roomData[myRoom].turtles});   
  });
  
  socket.on("update", function(data) {
    var myRoom = socket.myRoom;
    for (var key in data.turtles) {
      roomData[myRoom].turtles[key] = data.turtles[key];
    }
    socket.to(myRoom+"-student").emit("send update", {turtles: data.turtles}); 
  });

  //-----------------------//
  // Disease-specific logic
  //-----------------------//

  socket.on("change appearance", function(data) {
    var myRoom = socket.myRoom;
    var mySocketId = socket.id;
    socket.to(myRoom+"-teacher").emit("send appearance", {socketId: mySocketId});
  });
  
  socket.on("change infected", function(data) {
    socket.emit("send infected", {socketId: mySocketId, infected: data.infected });
  });
  
	socket.on("change position", function(data) {
    var myRoom = socket.myRoom;
		var mySocketId = socket.id;
    socket.to(myRoom+"-teacher").emit("send position", {socketId: mySocketId, xChange: data.xChange, yChange: data.yChange });
	});
  //------------------------------//
  // End of Disease-specific logic
  //------------------------------//
	
	// user exits or hubnet exit message
	socket.on('disconnect', function () {
		var myRoom = socket.myRoom;
		//socket.to(myRoom).emit("message", {text: "Send to others. " + socket.myUserType + " left room " + myRoom});	
		if (socket.myUserType === "teacher") {
			socket.to(myRoom+"-student").emit("teacher disconnect", {id: socket.mySocketId});
			// remove students from room.		
			//socket.leave(myRoom+"-student");	
			// kill channel
			delete roomData[myRoom];
		} else {
			socket.to(myRoom+"-teacher").emit("student disconnect", {id: socket.mySocketId});
			if (roomData[myRoom]) {
				if (roomData[myRoom].numStudents > 0) {roomData[myRoom].numStudents--;}
			}
		}
	});
	
});

http.listen(3003, function(){
	console.log('listening on *:3003');
});
