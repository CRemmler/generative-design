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
			roomData[myRoom].socketDict = {};
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
		//console.log("update on client");
    var myRoom = socket.myRoom;
		var socketId;
		var turtleId;
		var turtle;
		var outgoingTurtle;
		
		// send update to all students
		socket.to(myRoom+"-student").emit("send update", {turtles: data.turtles});
		
		// send updates to specific students for their NetLogo reporters
		for (var key in data.turtles) 
		{ 
			turtle = data.turtles[key];
			turtleId = key;
			socketId = (turtle.SOCKETID === undefined) ? roomData[myRoom].socketDict[turtleId] : turtle.SOCKETID;
			
			// for each of the turtles, save whole turtle to roomData[myRoom].turtles
			if (roomData[myRoom].turtles[turtleId] === undefined) {
				roomData[myRoom].turtles[turtleId] = turtle;
			}
			
			// if it is a student save turtleid/studentid pairs in dicts 
			if (turtle.BREED === "STUDENTS") {	
				roomData[myRoom].turtleDict[socketId] = turtleId;
				roomData[myRoom].socketDict[turtleId] = socketId;			
			}
			
			// if any of the reporter values are changed, send that to specific student
			// also save that specific updated variable in roomData[roomId].turtles object
			outgoingTurtle = {};
			if (turtle.SHAPE != undefined) { outgoingTurtle.shape = turtle.SHAPE; roomData[myRoom].turtles[turtleId].shape = turtle.SHAPE; }
			if (turtle.COLOR != undefined) { outgoingTurtle.color = turtle.COLOR; roomData[myRoom].turtles[turtleId].color = turtle.COLOR; }
			if (turtle.INFECTED != undefined) {	outgoingTurtle.infected = turtle.INFECTED; roomData[myRoom].turtles[turtleId].infected = turtle.INFECTED; } 
			if (turtle.XCOR != undefined) {	outgoingTurtle.xcor = turtle.XCOR; roomData[myRoom].turtles[turtleId].xcor = turtle.XCOR; }
			if (turtle.YCOR != undefined) {	outgoingTurtle.ycor = turtle.YCOR; roomData[myRoom].turtles[turtleId].ycor = turtle.YCOR; }
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
		var max = 10;
		if (myTurtleId != undefined) {
			var turtles = {};
			var outgoingTurtle = {};
			if (data.xChange === 0) {
				if ((Math.abs(roomData[myRoom].turtles[myTurtleId].YCOR + data.yChange)) < max) {
					roomData[myRoom].turtles[myTurtleId].YCOR = roomData[myRoom].turtles[myTurtleId].YCOR + data.yChange;
					turtles[myTurtleId] = {};
					turtles[myTurtleId].YCOR = roomData[myRoom].turtles[myTurtleId].YCOR;
					outgoingTurtle.ycor = turtles[myTurtleId].YCOR;
				}
			} else {
				if ((Math.abs(roomData[myRoom].turtles[myTurtleId].XCOR + data.xChange)) < max) {
					roomData[myRoom].turtles[myTurtleId].XCOR = roomData[myRoom].turtles[myTurtleId].XCOR + data.xChange;			
					turtles[myTurtleId] = {};
					turtles[myTurtleId].XCOR = roomData[myRoom].turtles[myTurtleId].XCOR;
					outgoingTurtle.xcor = turtles[myTurtleId].XCOR;
				}
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
		var myTurtleId = socket.myTurtleId;
		var mySocketId = socket.id;
		if (socket.myUserType === "teacher") {
			socket.to(myRoom+"-student").emit("teacher disconnect");
			//var sockets = io.sockets.adapter.rooms[myRoom+"-student"];
			//for (var key in sockets) {
			//	var thisSocket = sockets[key];
			//	thisSocket.leave(myRoom+"-student");  
			//} 
			delete roomData[myRoom];
		} else {
			if (roomData[myRoom] != undefined) {
				var myTurtleId = roomData[myRoom].turtleDict[mySocketId];
				socket.to(myRoom+"-teacher").emit("student disconnect", {turtleId: myTurtleId});
			}
		}
	});
});

http.listen(3003, function(){
	console.log('listening on *:3003');
});
