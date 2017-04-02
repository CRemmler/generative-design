var socket, olive, oliverr;
jQuery(document).ready(function() {
  var room;
  var socketId;
  var userType;
  var myTimer;
  var myWorld;
  
  socket = io.connect('localhost:3003');

  // show first screen, ask user to enter room
  Interface.showLogin();

  // save student settings
  socket.on("save settings", function(data) {
    room = data.room;
    socketId = data.socketId;
    userType = data.userType;
  });
  
  // display teacher or student interface
  socket.on("display interface", function(data) {
    userType === "teacher" ? Interface.showTeacher() : Interface.showStudent();
  });
  
  //-----------------------
  // Disease-specific logic
  //-----------------------
  
  //socket.to(myRoom+"-student").emit("send update", {modelUpdate: this.modelUpdate}});    
  socket.on("send update", function(data) {
    console.log("get update", data.turtles);
    //AgentStreamController.prototype.update(data.modelUpdate);
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
  
  socket.on("send appearance", function(data) {
    // store updated appearance in world, so teacher finds it
    NetLogoWorld.setAppearance(data.socketId);
    // update text on student's client
    //$("#netlogo-monitor-22 output").val(data.color + " " + data.baseshape);
  });
  
  // student sets position based on arrow key buttons
  socket.on("send position", function(data) {
    console.log("send position " + data.socketId);
    // update position in world, so teacher finds it
    var newPosition = NetLogoWorld.setPosition(data.socketId, data.xChange, data.yChange);
    // update text on student's client
    // $("#netlogo-monitor-28 output").val("(" + newPosition.xcor + "," + newPosition.ycor + ")");
  });
  
  // teacher sends infection status to student
  socket.on("send infected", function(data) {
    // update text on student's client
    // $("#netlogo-monitor-29 output").val(data.infected);
  });
  
  //------------------------------
  // End of Disease-specific logic
  //------------------------------
  
  // remove student
  socket.on("teacher disconnect", function(data) {
    Interface.showLogin();
  });
  
  socket.on("student disconnect", function(data) {
    // session.widgetController.ractive.findComponent('console').fire('run', 'ask turtle '+data.id+' [die]');
  });
  
});
