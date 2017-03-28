
jQuery(document).ready(function() {
  var socket = io.connect('localhost:3003');
  var room;
  var turtleId;
  var userType;
  var numStudents = 0;
  var myTimer;
  
  // show first screen, ask user to enter room
  $("#netlogo-model-container").addClass("hidden");
  $(".netlogo-tab-area .netlogo-tab-text").first().click();
  $("[cm-text]").trigger("click");
  $("#noRoomsChosen").removeClass("hidden");

  // save room, tell server room and 
  $("#submitRoomString").click(function() {
    myRoom = $("#roomString").val();
    socket.emit("enter room", {room: myRoom, items: getItems()});
  });
  
  // when teachers world changes, send teacher sends items
  var myTimer;
  $("#netlogo-button-1").click(function() {
    console.log("go button pushed");
    if ($("#netlogo-button-1.netlogo-active").length === 0) {
      clearInterval(myTimer);
    } else {
      myTimer = setInterval(teacherToServer, 5000);
    }
  });
  
  function teacherToServer() {
    console.log("send hubnet-web-message from teacher to server to students ");
    var items = getItems();
    socket.emit("teacher to server", {items: items});
  }
  
  // display message from server
  socket.on("message", function(data) {
    console.log("Message from server: " + data.text);
  });
  
  // save student settings
  socket.on("save settings", function(data) {
    room = data.room;
    turtleId = data.turtleId;
    userType = data.userType;
    console.log("Save settings: room: " + room + " turtleId: " + turtleId + " userType: " + userType);
  });
  
  // display teacher or student interface
  socket.on("display interface", function(data) {
    console.log("Display interface");
    userType === "teacher" ? displayTeacherInterface() : displayStudentInterface();
  });
  
  // teacher runs setup
  socket.on("setup", function() {
    console.log("Setup");
    $("[cm-text]").trigger("click");
    session.widgetController.ractive.findComponent('console').fire('run', 'setup');
  });

  // teacher runs create-new-student
  socket.on("create-new-student", function() {
    console.log("create-new-student");
    $("[cm-text]").trigger("click");
    session.widgetController.ractive.findComponent('console').fire('run', 'create-new-student');
  });
  
  socket.on("server to turtles", function(data) {
    console.log("Server to turtles");
    if ($("#netlogo-button-1.netlogo-active").length === 1) {
      $(".netlogo-tab-area .netlogo-tab-text").first().click();
      $("[cm-text]").trigger("click");
      putItems(data.items);
    }
  });

  function putItems(itemList) {
    $(".netlogo-tab-area .netlogo-tab-text").first().click();
    var numItems = itemList.length;
    var turtles = (world.turtles()._agents.length === 0) ? [] : world.turtles().toArray();
    var numTurtles = turtles.length;
    var turtleId;
    console.log('numTurtles ' + numTurtles + ' numItems ' + numItems);
    for (var j=0; j < numTurtles; j++) {
      turtle = turtles[0];
      item = itemList[0];
      turtle.setVariable('xcor', item['xcor']);
      turtle.setVariable('ycor', item['ycor']);
      turtle.setVariable('baseshape', "'" + item['shape'] + "'");
      turtle.setVariable('color', item['color']);
      turtle.setVariable('heading', item['heading']);
      turtle.setVariable('stepsize', item['stepsize']);
      turtle.setVariable('infected', item['infected']);
    }
    var command;
    var itemId;
    $("[cm-text]").trigger("click");
    if (numTurtles > numItems) {
      for (var m=numItems; m < numTurtles; m++) {
        session.widgetController.ractive.findComponent('console').fire('run', 'ask one-of students [die]');          
      }
    } else if (numTurtles < numItems) {
      //var addTurtles = numItems - numTurtles;
      var commandList = [];
      for (var k=numTurtles; k < numItems; k++) {
        item = itemList[k];
        command = "create-students " + (k+1).toString() + " [" +
          " set xcor " + item['xcor'] + 
          " set ycor " + item['ycor'] + 
          ' set shape "' + item['shape'] + '"' + 
          " set color " + item['color'] + 
          " set heading " + item['heading'] + 
          " set stepsize " + item['stepsize'] + 
          " set infected " + item['infected'] + " ]";
        commandList.push(command);
        if (k + 1 === numItems) {
          evaluateCommandList(commandList);          
        }
      }
    }
  }
  
  function evaluateCommandList(cList) {
    var command = cList.shift();
    console.log(command);
    session.widgetController.ractive.findComponent('console').fire('run', command);
    if (cList.length > 0) { evaluateCommandList(cList); }
  }
  
  // when student wants to change world by pushing up
  $("#netlogo-button-21").click(function() {
    console.log("clicked down by " + turtleId);
    socket.emit("move turtle", {xChange: 0, yChange:-1}); 
  });
  
  // when student wants to change world by pushing up
  $("#netlogo-button-22").click(function() {
    console.log("clicked up by " + turtleId);
    socket.emit("move turtle", {xChange: 0, yChange:1}); 
  });
  
  // when student wants to change world by pushing up
  $("#netlogo-button-23").click(function() {
    console.log("clicked right by " + turtleId);
    socket.emit("move turtle", {xChange: 1, yChange:0}); 
  });
  
  // when student wants to change world by pushing up
  $("#netlogo-button-24").click(function() {
    console.log("clicked left by " + turtleId);
    socket.emit("move turtle", {xChange: -1, yChange:0}); 
  });
  
  function getItems() {
    console.log("get items");
    var itemsList = [];
    var itemObject;
    var item;
    var itemList = world.turtles().toArray();
    var numItems = itemList.length;
    for (var i=0; i < numItems; i++) {
      item = itemList[i];
      itemObject = {};
      itemObject['id'] = item.id;
      itemObject['xcor'] = item.xcor;
      itemObject['ycor'] = item.ycor;
      itemObject['shape'] = item.getVariable('baseshape');
      itemObject['color'] = item.getVariable('color');
      itemObject['heading'] = item.getVariable('heading');
      itemObject['stepsize'] = item.getVariable('stepsize');
      itemObject['infected'] = item.getVariable('infected');
      itemsList.push(itemObject);
      if ((i + 1) === numItems) { 
        return itemsList; 
      }
    }
  }
  
  function displayTeacherInterface() {
    $("#netlogo-button-21").addClass("hidden");
    $("#netlogo-button-22").addClass("hidden");
    $("#netlogo-button-23").addClass("hidden");
    $("#netlogo-button-24").addClass("hidden");
    $("#netlogo-button-25").addClass("hidden");
    $("#netlogo-slider-26").addClass("hidden");
    $("#netlogo-monitor-27").addClass("hidden");
    $("#netlogo-monitor-28").addClass("hidden");
    $("#netlogo-monitor-29").addClass("hidden");
    $("#netlogo-model-container").removeClass("hidden");
    $("#noRoomsChosen").addClass("hidden");
    $("#netlogo-inputBox-30").addClass("hidden");
  }
  function displayStudentInterface() {
    $("#netlogo-model-container").removeClass("hidden");
    $("#noRoomsChosen").addClass("hidden");
    $(".netlogo-widget").addClass("hidden");
    $(".netlogo-widget-error").removeClass("hidden");
    $("#netlogo-button-21").removeClass("hidden");
    $("#netlogo-button-22").removeClass("hidden");
    $("#netlogo-button-23").removeClass("hidden");
    $("#netlogo-button-24").removeClass("hidden");
    $("#netlogo-button-25").removeClass("hidden");
    $("#netlogo-slider-26").removeClass("hidden");
    $("#netlogo-monitor-27").removeClass("hidden");
    $("#netlogo-monitor-28").removeClass("hidden");
    $("#netlogo-monitor-29").removeClass("hidden");
    $(".netlogo-view-container").removeClass("hidden");
    $(".netlogo-view-container").css("top","10px");
    //$(".netlogo-tab-area").addClass("hidden");
    $(".netlogo-export-wrapper").addClass("hidden");
    $("#netlogo-monitor-30").removeClass("hidden");
    $("#netlogo-monitor-31").removeClass("hidden");
    $("#netlogo-monitor-32").removeClass("hidden");
    $("#netlogo-inputBox-30").addClass("hidden");
  }
});
