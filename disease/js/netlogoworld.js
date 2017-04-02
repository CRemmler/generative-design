//console.log("NetLogoWorld");
NetLogoWorld = (function() {
  
  // teacher saves position
  function setPosition(socketId, xChange, yChange) {
    var xcor;
    var ycor;
    //console.log(xChange + ' ' + yChange + ' ' + socketId);
    var numTurtles = world.turtles().toArray().length;
    for (i = 0; i < numTurtles; i++) {
      turtle = world.turtles().toArray()[i];
      turtleSocketId = turtle.getVariable('socketid'); 
      if (turtleSocketId === socketId) {
        xcor = turtle.getVariable('xcor', xcor);
        ycor = turtle.getVariable('ycor', ycor); 
        //console.log(xcor + ", " + ycor);       
        turtle.setVariable('xcor', xcor + xChange);
        turtle.setVariable('ycor', ycor + yChange);
      }
    }
    return {xcor: xcor, ycor: ycor};
  }

  function setAppearance(socketId) {
    var numTurtles = world.turtles().toArray().length;
    for (i = 0; i < numTurtles; i++) {
      turtle = world.turtles().toArray()[i];
      turtleSocketId = turtle.getVariable('socketid'); 
      if (turtleSocketId === socketId) {
        command = 'ask students with [socketid = "' + turtleSocketId + '" ]' + 
          ' [' +
            ' set used-shape-colors remove my-code used-shape-colors ' +
            ' set-unique-shape-and-color ' +
            ' if infected ' +
            ' [ set-sick-shape ] ' +
          ']';
        session.widgetController.ractive.findComponent('console').fire('run', command);
      }
    }
  }

  return {
    setPosition: setPosition,
    setAppearance: setAppearance
  };
  
})();