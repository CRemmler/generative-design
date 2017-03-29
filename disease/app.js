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
	//console.log("connection");
	
	// user enters room
	socket.on("enter room", function(data) {
		//console.log("enter room");
		socket.myRoom = data.room;
		var myRoom = socket.myRoom;
		if (!roomData[myRoom]) {
			roomData[myRoom] = {};
			roomData.items = [];
			roomData[myRoom].numTeachers = 0;
			roomData[myRoom].numStudents = 0;
			roomData[myRoom].turtleCounter = 0;
		}
		socket.myUserType = (roomData[myRoom].numTeachers === 0) ? "teacher" : "student";
		var myUserType = socket.myUserType;
		socket.myTurtleId = (myUserType === "student") ? roomData[myRoom].turtleCounter : -1;
		var myTurtleId = socket.myTurtleId;
		socket.emit('message', {text: "Join room " + myRoom+"-"+myUserType});
		socket.join(myRoom+"-"+myUserType);
		socket.emit("save settings", {room: myRoom, turtleId: myTurtleId, userType: myUserType});
		socket.emit("display interface");
		if (myUserType === "teacher") {
			roomData[myRoom].numTeachers++;
			socket.emit("setup");
			roomData[myRoom].items = data.items;
		} else {
			roomData[myRoom].numStudents++;
			socket.to(myRoom+"-teacher").emit("create-new-student");
			roomData[myRoom].turtleCounter++;
		}
		socket.emit('message', {text:roomData[myRoom].numTeachers + " teachers and " + roomData[myRoom].numStudents + " students in room " + myRoom});
	});	
		
	// teacher shares world
	socket.on("teacher to server", function(data) {
		//console.log("teacher to server");
		var myRoom = socket.myRoom;
		roomData[myRoom].items = data.items;
		socket.to(myRoom+"-student").emit("server to turtles", {items: data.items});
	});
	
	// student moves turtle
	socket.on("move turtle", function(data) {
			//console.log("move turtle " + socket.myTurtleId);
			var myTurtleId = socket.myTurtleId;
			var myRoom = socket.myRoom;
			if (roomData[myRoom]) {
				roomData[myRoom].items[myTurtleId].xcor = roomData[myRoom].items[myTurtleId].xcor + data.xChange;
				roomData[myRoom].items[myTurtleId].ycor = roomData[myRoom].items[myTurtleId].ycor + data.yChange;		
				socket.to(myRoom+"-teacher").emit("server to turtles", {items: roomData[myRoom].items});
			}
	});
	
	// user exits
	socket.on('disconnect', function () {
		//console.log(socket.myTurtleId + " disconnected");
		var myRoom = socket.myRoom;
		socket.to(myRoom).emit("message", {text: "Send to others. " + socket.myUserType + " left room " + myRoom});	
		if (socket.myUserType === "teacher") {
			socket.to(myRoom+"-student").emit("teacher disconnect", {id: socket.myTurtleId});
			// remove students from room.		
			//socket.leave(myRoom+"-student");	
			// kill channel
			delete roomData[myRoom];
		} else {
			socket.to(myRoom+"-teacher").emit("student disconnect", {id: socket.myTurtleId});
			if (roomData[myRoom]) {
				if (roomData[myRoom].numStudents > 0) {roomData[myRoom].numStudents--;}
			}
		}
	});
	
});

http.listen(3003, function(){
	console.log('listening on *:3003');
});
