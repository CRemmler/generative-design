jQuery(document).ready(function() {

  //-------------------//
  // Events From login
  //-----------------------//
  
  // when student submits room name
  $("#submitRoomString").click(function() {
    var myRoom = $("#roomString").val();
    socket.emit("enter room", {room: myRoom});
  });
  
  //-----------------------//
  // Events From teacher
  //-----------------------//
  
  // when teacher pushes go button
  /*$("#netlogo-button-1").mousedown(function() {
    if ($("#netlogo-button-1.netlogo-active").length === 1) {
      clearInterval(myTimer);
    } else {
      myTimer = setInterval(go, 1000);
    }
  });*/
  
  // teacher sends world to server
  //function go() {
  //}
  
  //-----------------------//
  // Events From student
  //-----------------------//
  
  var stepsize = +$("#netlogo-slider-26 .netlogo-slider-value input").val();
  // when student clicks stepsize slider
  $("#netlogo-slider-26").click(function() {
    stepsize = +$("#netlogo-slider-26 .netlogo-slider-value input").val();
  });
  
  // when student pushes down button
  $("#netlogo-button-21").click(function() {
    socket.emit("change position", {xChange: 0, yChange: -stepsize}); 
  });
  
  // when student pushes up button
  $("#netlogo-button-22").click(function() {
    //console.log("pressed up button");
    socket.emit("change position", {xChange: 0, yChange: stepsize}); 
  });
  
  // when student pushes right button
  $("#netlogo-button-23").click(function() {
    socket.emit("change position", {xChange: stepsize, yChange:0}); 
  });
  
  // when student pushes left button
  $("#netlogo-button-24").click(function() {
    socket.emit("change position", {xChange: -stepsize, yChange:0}); 
  });
  
  $("#netlogo-button-25").click(function() {
    socket.emit("change appearance"); 
  });
  
});