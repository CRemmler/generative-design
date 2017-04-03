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
		
		var myUserType, mySocketId, myTurtleId;
		
    // declare myRoom
    socket.myRoom = data.room;
    var myRoom = socket.myRoom;
		if (!roomData[myRoom]) {
			roomData[myRoom] = {};
			roomData[myRoom].teacherInRoom = false;
      roomData[myRoom].turtles = {};
			roomData[myRoom].turtleDict = {};
		}
    // declare myUserType, first user in is a teacher, rest are students
		socket.myUserType = (!roomData[myRoom].teacherInRoom) ? "teacher" : "student";
		myUserType = socket.myUserType;
		
    // declare mySocketId
		mySocketId = socket.id;
    //console.log("socket.myTurtleId " + socket.myTurtleId);
    // send settings to client
    socket.emit("save settings", {userType: myUserType, socketId: mySocketId});

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
			socket.emit("get turtleid");
		}
    
	});	
  
	// save client's turtleId value
	socket.on("send turtleid", function(data) {
		console.log("setting turtleid to " + data.turtleId);
		socket.myTurtleId = data.turtleId;
	});
	
	// send the entire state of the world, in this room
  socket.on("update all", function(data) {
		console.log("UPDATE ALL");
    var myRoom = socket.myRoom;
    var socketId = data.socketId;
    io.to(socketId).emit("send update", {turtles: roomData[myRoom].turtles});   
	});
  
	// send only most recent updates of the world, in this room
  socket.on("update", function(data) {
    var myRoom = socket.myRoom;
		var mySocketId = socket.id;
		var myTurtleId;
    for (var key in data.turtles) {
      roomData[myRoom].turtles[key] = data.turtles[key];
			if (!turtleDict[key]) {
				roomData[myRoom].turtleDict[key] = mySocketId;
				socket.myTurtleId = key;
				myTurtleId = socket.myTurtleId;
				socket.io.to(mySocketid).emit("save settings", {turtleId: myTurtleId},
			}
		}
		socket.to(myRoom+"-student").emit("send update", {turtles: data.turtles});
  });

  //-----------------------//
  // Disease-specific logic
  //-----------------------//

  socket.on("change appearance", function() {
    var myRoom = socket.myRoom;
		var myTurtleId = socket.myTurtleId;
		var mySocketId = socket.id;
		socket.to(myRoom+"-teacher").emit("send appearance", {turtleId: myTurtleId});
	});
  
	socket.on("change position", function(data) {
    var myRoom = socket.myRoom;
		var myTurtleId = socket.myTurtleId;
		var mySocketId = socket.id;
		var turtles = roomData[myRoom].turtles;
		if (data.yChange === 0) {
			roomData[myRoom].turtles[myTurtleId].xcor = roomData[myRoom].turtles[myTurtleId].xcor + data.xChange;
		} else {
			roomData[myRoom].turtles[myTurtleId].ycor = roomData[myRoom].turtles[myTurtleId].ycor + data.yChange;
		}
		turtles[myTurtleId] = roomData[myRoom].turtles[myTurtleId];
    socket.to(myRoom+"-teacher").emit("send update", {turtles: turtles}); 
	});
	
  //------------------------------//
  // End of Disease-specific logic
  //------------------------------//
	
	// user exits or hubnet exit message
	socket.on('disconnect', function () {
		var myRoom = socket.myRoom;
		var myTurtleId = socket.myTurtleId;// ? socket.myTurtleId : getTurtleId();
		var socketId;
		if (socket.myUserType === "teacher") {
			socket.to(myRoom+"-student").emit("teacher disconnect");
			var sockets = io.sockets.adapter.rooms[myRoom+"-student"];
			for (var key in sockets) {
				var thisSocket = sockets[key];
				thisSocket.leave(myRoom+"-student");  
			} 
			delete roomData[myRoom];
		} else {
			socket.to(myRoom+"-teacher").emit("student disconnect", {turtleId: myTurtleId});
		}
	});
	
});

http.listen(3003, function(){
	console.log('listening on *:3003');
});
