var express = require('express');
var app = express();
var path = require('path');
var timesyncServer = require('timesync/server');
var server = require('http').createServer(app);
io = require('socket.io').listen(server);

const PORT = process.env.PORT || 5000

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

server.listen(PORT, () => console.log(`Listening on ${ PORT }`));

// handle timesync requests
app.use('/timesync', timesyncServer.requestHandler);

var currentWorks = [];
var currentWorksIX = 0;

//Main Server socket.io
io.on('connection', function(socket) {

  //Request for new piece from splash page
  socket.on('mkNewPiece', function(data) {
    var newPieceType = data.pieceType;
    var newPieceName = data.pieceName;
    var newPieecArr = [];
    var dt = new Date();
    var year = dt.getFullYear();
    var month = dt.getMonth() + 1;
    var day = dt.getDate();
    var hour = dt.getHours();
    var min = dt.getMinutes();
    var timestamp = year + "_" + month + "_" + day + "_" + hour + "_" + min;
    var newPieceID = currentWorksIX + "-" + timestamp;
    var newPieceArr = [newPieceID, newPieceType, newPieceName];
    currentWorks.push(newPieceArr);
    currentWorksIX++;
    socket.broadcast.emit('newPieceBroadcast', {
      newPieceID: newPieceArr
    });
    socket.emit('newPieceBroadcast', {
      newPieceIDArr: newPieceArr
    });
  });

});
