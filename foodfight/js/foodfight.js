
jQuery(document).ready(function() {

  //////////
  // Preload Images
  //////////

  var preloadedImages = [];

  function preloadImages() {
    for (var idx = 0; idx < arguments.length; idx++) {
        var oneImage = new Image()
        oneImage.src = arguments[idx];
        preloadedImages.push(oneImage);
    }
  }

  preloadImages(
    'images/bread.png',
    'images/cauliflower.png',
    'images/carrot.png',
    'images/apple.png',
    'images/orange.png',
    'images/milk.png',
    'images/eggs.png',
    'images/lime.png',
    'images/celery.png',
    'images/butter.png',
    'images/cursor.png'
  );

  //////////
  // Canvas
  //////////
  
  var CANVAS_WIDTH = 400, CANVAS_HEIGHT = 300, SCALE = 30;
  var context = document.getElementById("canvas").getContext("2d");
  var allDataDef = [];
  var allData = [];
  var mouseX, mouseY;
  var p = $("#canvas");
  var canvasPosition = p.position();
  var mouseDown = false;
  var playerId;
  var ms = 40;

  //////////////
  // SocketIO
  //////////////

  var socket = io.connect('localhost:3000');

  socket.on('Welcome', function(data) {
    socket.emit('All Ready');
  });

  socket.on('Initialize', function(data) {  
    // data is a list of [imageFileName, imageWidth, imageHeight]
    allDataDef = data.allDataDef;
    playerId = data.playerId;
    console.log("playerId " + playerId); 
  });
  
  socket.on('Update', function(data) {
    // data is a list of [x, y, angle]
    console.log('update ' + data.allData.length);
    if (allDataDef != [])    {
      allData = data.allData;
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      for (i=0;i<allDataDef.length;i++) {
        var imgObj = new Image();
        imgObj.src = allDataDef[i][0];          
        context.save();
        context.translate(allData[i][0],allData[i][1]);
       	context.rotate(allData[i][2]);
      	context.drawImage(imgObj,allDataDef[i][1],allDataDef[i][2]);
      	context.restore();
      }
      for (i=10;i<allData.length;i++) {
        var imgObj = new Image();
        imgObj.src = 'images/cursor.png';          
        context.save();
      	context.translate(allData[i][0], allData[i][1]);
      	context.drawImage(imgObj,-5,-5);
      	context.restore();    
      }
    }
  });


  function mouseSend() {
    console.log('mouseSend');
    socket.emit('Mouse Move', { playerId:playerId, mouseX:mouseX, mouseY:mouseY, mouseDown:mouseDown});
  }
  
  $('#canvas').bind('mouseout', function(event) {
    mouseDown = false;
    mouseSend();
  });
  
  $('#canvas').bind('mousedown touchstart', function(event) {    
    mouseDown = true;
    mouseSend();
  });

  $('#canvas').bind('mouseup touchend', function(event) {
    mouseX = -5; mouseY = -5;
    mouseDown = false;
    mouseSend();
  });
  
  var last = (new Date()).getTime();
  $('#canvas').bind('mousemove', function(event) {  
    var now = (new Date()).getTime();
    if (now - last > ms) {
      last = now;
      mouseX = (event.pageX - canvasPosition.left) / SCALE;
      mouseY = (event.pageY - canvasPosition.top) / SCALE;
      mouseSend();
    }
  });
  
  $('#canvas').bind('touchmove',function (event) {
    var now = (new Date()).getTime();
    if (now - last > ms) {
      last = now;
      event.preventDefault();
      var orig = event.originalEvent;
      mouseX = (orig.touches[0].pageX - canvasPosition.left) / SCALE;
      mouseY = (-30 + orig.touches[0].pageY - canvasPosition.left) / SCALE;
      mouseSend();
    }
  });

});
