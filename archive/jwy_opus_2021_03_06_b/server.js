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
// Keep score data and log current pieces in progress
var currentWorks = [];
var currentWorksIX = 0;
// SOCKET IO
io.on('connection', function(socket) {
  // MAKE NEW PIECE
  socket.on('mkNewPiece', function(data) {
    var newPieceType = data.pieceType;
    var newPieceName = data.pieceName;
    var newPieceData = data.pieceData;
    //Generate Piece ID:
    //// Timestamp
    var dt = new Date();
    var year = dt.getFullYear();
    var month = dt.getMonth() + 1;
    var day = dt.getDate();
    var hour = dt.getHours();
    var min = dt.getMinutes();
    var timestamp = year + "_" + month + "_" + day + "_" + hour + "_" + min;
    var newPieceID = currentWorksIX + "-" + timestamp;
    var tempArray = [];
    tempArray.push(newPieceID);
    tempArray.push(newPieceType);
    tempArray.push(newPieceName);
    tempArray.push(newPieceData);
    currentWorks.push(tempArray);
    currentWorksIX++;
    //Send data to splash page where the piece.html will be launched
    socket.broadcast.emit('newPieceBroadcast', {
      newPieceArr: tempArray
    });
    socket.emit('newPieceBroadcast', {
      newPieceArr: tempArray
    });
  });
  // GET SCORE DATA
  socket.on('getScoreData', function(data) {
    var pieceID = data.pieceID;
    //search for piece id in currentWorks array
    for (var i = 0; i < currentWorks.length; i++) {
      if (pieceID == currentWorks[i][0]) {
        //send back to page
        socket.broadcast.emit('scoreDataBroadcast', {
          scoreData: currentWorks[i]
        });
        socket.emit('scoreDataBroadcast', {
          scoreData: currentWorks[i]
        });
        break;
      }
    };
  });
  // START PIECE BROADCAST
  socket.on('startpiece', function(data) {
    socket.broadcast.emit('startpiecebroadcast', {});
    socket.emit('startpiecebroadcast', {});
  });
  // START TIME BROADCAST
  socket.on('startTime', function(data) {
    var newStartTime = data.newStartTime;
    socket.broadcast.emit('startTimeBroadcast', {
      newStartTime: newStartTime
    });
    socket.emit('startTimeBroadcast', {
      newStartTime: newStartTime
    });
  });
  // STOP
  socket.on('stop', function(data) {
    socket.emit('stopBroadcast', {});
    socket.broadcast.emit('stopBroadcast', {});
  });
  // PAUSE
  socket.on('pause', function(data) {
    socket.emit('pauseBroadcast', {
      pauseState: data.pauseState,
      pauseTime: data.pauseTime
    });
    socket.broadcast.emit('pauseBroadcast', {
      pauseState: data.pauseState,
      pauseTime: data.pauseTime
    });
  });

});
