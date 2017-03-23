var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	  res.sendfile('index.html');
});

io.on('connection', function (socket) {

  socket.emit('Welcome'); 
 
});


http.listen(3030, function(){
//  console.log('listening on *:3030');
});
