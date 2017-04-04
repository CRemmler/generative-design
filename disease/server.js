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
		}
    
	});	
  
	// send the entire state of the world, in this room
  socket.on("update all", function(data) {
    var myRoom = socket.myRoom;
    var socketId = data.socketId;
    io.to(socketId).emit("send update", {turtles: roomData[myRoom].turtles});
	});
  
	// send only most recent updates of the world, in this room
  socket.on("update", function(data) {
    var myRoom = socket.myRoom;
		var socketId;
		var turtleId;
		var turtle;
		var outgoingTurtle;
		socket.to(myRoom+"-student").emit("send update", {turtles: data.turtles});
		console.log("update");
		for (var key in data.turtles) 
		{ 
			console.log("loop through turtles: " + key);
			turtle = data.turtles[key];
			outgoingTurtle = {};
			turtleId = key;
			socketId = turtle.SOCKETID;
			
			// for each of the turtles, save whole turtle to roomData[myRoom].turtles
			roomData[myRoom].turtles[turtleId] = turtle;
			
			// if it is a student save turtleid/studentid pair in dict 
			if (turtle.BREED === "STUDENTS") {	
				roomData[myRoom].turtleDict[socketId] = turtleId;
			}
			
			console.log(turtle.SOCKETID + ": " + turtle.XCOR + ", " + turtle.YCOR);
			// if any of the reporter values are changed, send that to specific student
			if (turtle.SHAPE != undefined) {	outgoingTurtle.shape = turtle.SHAPE; }
			if (turtle.COLOR != undefined) {	outgoingTurtle.color = turtle.COLOR; }
			// change sick? from turtle var to global
			if (outgoingTurtle != {}) {
				io.to(socketId).emit("send update reporters", {turtle: outgoingTurtle});
			} 
		}
  });

  //-----------------------//
  // Disease-specific logic
  //-----------------------//

	// send netlogo command, that will trigger updates from within netlogo part
  socket.on("change appearance", function() {
    var myRoom = socket.myRoom;
		var mySocketId = socket.id;
		var myTurtleId = roomData[myRoom].turtleDict[mySocketId];
		socket.to(myRoom+"-teacher").emit("send appearance", {turtleId: myTurtleId});
	});
  
	// student pushes buttons, change variables in world on server,
	// send world to students, send reporter updates to individual 
	socket.on("change position", function(data) {
    var myRoom = socket.myRoom;
		var mySocketId = socket.id;
		var myTurtleId = roomData[myRoom].turtleDict[mySocketId];
		if (myTurtleId != undefined) {
			var turtles = {};
			var outgoingTurtle = {};
			if (data.xChange === 0) {
				roomData[myRoom].turtles[myTurtleId].YCOR = roomData[myRoom].turtles[myTurtleId].YCOR + data.yChange;
				turtles[myTurtleId] = {};
				turtles[myTurtleId].YCOR = roomData[myRoom].turtles[myTurtleId].YCOR;
				outgoingTurtle.ycor = turtles[myTurtleId].YCOR;
			} else {
				roomData[myRoom].turtles[myTurtleId].XCOR = roomData[myRoom].turtles[myTurtleId].XCOR + data.xChange;			
				turtles[myTurtleId] = {};
				turtles[myTurtleId].XCOR = roomData[myRoom].turtles[myTurtleId].XCOR;
				outgoingTurtle.xcor = turtles[myTurtleId].XCOR;
			}
			socket.to(myRoom+"-teacher").emit("send update", {turtles: turtles});
			socket.to(myRoom+"-student").emit("send update", {turtles: turtles}); 
			socket.emit("send update", {turtles: turtles}); 
			socket.emit("send update reporters", {turtle: outgoingTurtle});
		}	
	});
	
  //------------------------------//
  // End of Disease-specific logic
  //------------------------------//
	
	// user exits or hubnet exit message
	socket.on('disconnect', function () {
		var myRoom = socket.myRoom;
		var myTurtleId = socket.myTurtleId;// ? socket.myTurtleId : getTurtleId();
		var mySocketId = socket.id;
		
		var myTurtleId = roomData[myRoom].turtleDict[mySocketId];
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
