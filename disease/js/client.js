var socket;
var oliver;

jQuery(document).ready(function() {
  var socketId;
  var userType;
  var turtleDict = {};
  
  socket = io.connect('localhost:3003');

  // show first screen, ask user to enter room
  Interface.showLogin();

  // save student settings
  socket.on("save settings", function(data) {
    socketId = data.socketId; 
    userType = data.userType; 
  });
  
  // display teacher or student interface
  socket.on("display interface", function(data) {
    userType === "teacher" ? Interface.showTeacher() : Interface.showStudent();
  });
  
  // apply most recent updates to world
  socket.on("send update", function(data) {
    //console.log("update world", data.turtles);
    oliver.applyUpdate({turtles: data.turtles});
    oliver.repaint();
  });  
  
  //-----------------------//
  // Disease-specific logic
  //-----------------------//
  
  // netlogo colors = ["white", "brown", "green", "yellow", "(violet + 1)", "(sky + 1)"];
  var colorNames = ["white", "brown", "green", "yellow", "purple", "blue"];
  var colorValues = [9.9, 35, 55, 45, 116, 96];
  
  socket.on("send update reporters", function(data) {
    //console.log("update reporters ", data.turtle);
    var turtle = data.turtle;
    if (turtle.infected != undefined) { $("#infected").html("" + turtle.infected); }
    if (turtle.xcor) { $("#xcor").html(turtle.xcor); }
    if (turtle.ycor) { $("#ycor").html(turtle.ycor); }
    if (turtle.color) {
      var colorIndex = colorValues.indexOf(turtle.color);
      $("#color").html(colorNames[colorIndex]); 
    }
    if (turtle.shape) { $("#shape").html(turtle.shape); }
  });
  
  // teacher runs setup
  socket.on("setup teacher", function() {
    var command = "setup";
    session.widgetController.ractive.findComponent('console').fire('run', command);
  });

  // teacher runs create-new-student
  socket.on("setup student", function(data) {
    var socketId = data.socketId;
    var command = "create-students 1 [" + 
      ' set socketid "' + socketId + 
      '" setup-student-vars ]';
    session.widgetController.ractive.findComponent('console').fire('run', command);
    socket.emit("update all", {socketId: data.socketId});
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
    var command = 'ask turtle "'+data.turtleId+'" [die]';
    session.widgetController.ractive.findComponent('console').fire('run', command);
  });
  
});
