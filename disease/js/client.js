var socket;
var oliver;

jQuery(document).ready(function() {
  var socketId;
  var userType;
  var turtleId;
  
  socket = io.connect('localhost:3003');

  // show first screen, ask user to enter room
  Interface.showLogin();

  // save student settings
  socket.on("save settings", function(data) {
    if (data.socketId) { socketId = data.socketId; }
    if (data.userType) { userType = data.userType; }
    if (data.turtleId) { turtleId = data.turtleId; }
  });
  
  // display teacher or student interface
  socket.on("display interface", function(data) {
    userType === "teacher" ? Interface.showTeacher() : Interface.showStudent();
  });
  
  //-----------------------//
  // Disease-specific logic
  //-----------------------//
  
  // netlogo colors = ["white", "brown", "green", "yellow", "(violet + 1)", "(sky + 1)"];
  var colorNames = ["white", "brown", "green", "yellow", "purple", "blue"];
  var colorValues = [9.9, 35, 55, 45, 116, 96];
  var teacherObject[mySocketId];
  
  // include most recent updates  to world
  socket.on("send update", function(data) {
    var turtle;
    
    // if one of the updated turtles is a student,
    // send updated values to that student's reporters
    if (data.turtles[turtleId]) {
      turtle = data.turtles[turtleId];
      if (turtle.infected) { $("#netlogo-monitor-29 output").val(turtle.infected); }
      if (turtle.xcor) { $("#xcor").val(turtle.xcor); }
      if (turtle.ycor) { $("#ycor").val(turtle.xcor); }
      if (turtle.color) {
        var colorIndex = colorValues.indexOf(turtle.color);
        (colorValues[colorIndex]) ? $("#shape").val(colorValues[colorIndex]) : $("#shape").val(""); 
      }
      if (turtle.shape) { $("#shape").val(turtle.shape); }
    }
    
    // student repaints world with updated values
    oliver.applyUpdate({turtles: data.turtles});
    oliver.repaint();
  });  
  
  // teacher runs setup
  socket.on("setup teacher", function() {
    var command = "setup";
    session.widgetController.ractive.findComponent('console').fire('run', command);
  });

  // teacher runs create-new-student
  socket.on("setup student", function(data) {
    var command = "create-students 1 [" + 
      ' set socketid "' + data.socketId + 
      '" setup-student-vars ]';
    session.widgetController.ractive.findComponent('console').fire('run', command);
    socket.emit("update all", {socketId: data.socketId});
  });
  
  // student uses socketId to find turtle and get it's turtleId
  socket.on("get turtleid", function(data) {
    var numTurtles = world.turtles().toArray().length;
    var turtleId;
    for (var i = numTurtles - 1; i >= 0; i--) {
      turtle = world.turtles().toArray()[i];
      if (data.socketId === turtle.getVariable("socketid")) {
        turtleId = turtle.id; 
        socket.emit("send turtleid", {turtleId: turtleId});
        break;
      }
    }
  });
  
  // teacher gives student a new appearance
  socket.on("send appearance", function(data) {
    command = 'ask student ' + data.turtleId + 
      ' [' +
        ' set used-shape-colors remove my-code used-shape-colors ' +
        ' set-unique-shape-and-color ' +
        ' if infected ' +
        ' [ set-sick-shape ] ' +
      ']';
    session.widgetController.ractive.findComponent('console').fire('run', command);
  });
  
  //------------------------------//
  // End of Disease-specific logic
  //------------------------------//
  
  // student leaves activity and sees login page
  socket.on("teacher disconnect", function(data) {
    Interface.showLogin();
  });
  
  // remove student
  socket.on("student disconnect", function(data) {
    var command = 'ask turtle "'+data.socketId+'" [die]';
    session.widgetController.ractive.findComponent('console').fire('run', command);
  });
  
});
