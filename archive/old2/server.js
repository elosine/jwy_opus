var express = require('express');
var app = express();
var path = require('path');
var timesyncServer = require('timesync/server');
var server = require('http').createServer(app);
io = require('socket.io').listen(server);
const fs = require('fs');
const PORT = process.env.PORT || 5000
app.use(express.static(path.join(__dirname, '/public')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
// handle timesync requests
app.use('/timesync', timesyncServer.requestHandler);
// Keep score data and log current pieces in progress
var currentWorks = []; // [pieceID, pieceType, pieceName, pieceData, epochStartTime, timeAdjustment]
var currentWorksIX = 0;

io.on('connection', function(socket) {
  // MAKE NEW PIECE
  socket.on('mkNewPiece', function(data) {
    mkNewPiece(data);
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
    var pieceID = data.pieceID;
    var absStartTime = data.absStartTime;
    var timeAdjustment = data.timeAdjustment;
    //store absolute startTime epoch & timeAdjustiment
    for (var i = 0; i < currentWorks.length; i++) {
      if (pieceID == currentWorks[i][0]) {
        currentWorks[i][4] = absStartTime;
        currentWorks[i][5] = timeAdjustment;
        break;
      }
    }
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
  // Request for load piece from splash page
  socket.on('loadPieceFromServer', function(data) {
    var pieceType = data.pieceType;
    var pieceName = data.pieceName;
    switch (pieceType) {
      case 'sf002':
        //joining path of directory
        const directoryPath = path.join(__dirname, 'public/savedScoreData/sf002');
        //passsing directoryPath and callback function
        fs.readdir(directoryPath, function(err, files) {
          //handling error
          if (err) {
            return console.log('Unable to scan directory: ' + err);
          }
          //Send list of files in directory to Splash page
          socket.broadcast.emit('loadPieceFromServerBroadcast', {
            availableScoreData: files
          });
          socket.emit('loadPieceFromServerBroadcast', {
            availableScoreData: files
          });
        });
        break;
    }
  });

  // Request for load piece from splash page
  socket.on('loadServerPieceData', function(data) {
    var fileName = data.fileName;
    const filePath = path.join(__dirname, 'public/savedScoreData/sf002/', fileName);
    fs.readFile(filePath, 'utf8', function(err, data) {
      if (err) throw err;
      var eventsArray = [];
      var playersArr = data.split("!");
      playersArr.forEach(function(it, ix) {
        var t1 = it.split(";");
        var thisPlayersEvents = [];
        for (var i = 0; i < t1.length; i++) {
          t2 = [];
          var temparr = t1[i].split(',');
          t2.push(parseFloat(temparr[0]));
          t2.push(parseFloat(temparr[1]));
          thisPlayersEvents.push(t2);
        }
        eventsArray.push(thisPlayersEvents);
      });
      var t_newPieceDat = {};
      t_newPieceDat['pieceType'] = 'sf002';
      t_newPieceDat['pieceName'] = 'Soundflow #2';
      t_newPieceDat['pieceData'] = eventsArray;

      mkNewPiece(t_newPieceDat);


    });
  });

  function mkNewPiece(scoreData) {
    var newPieceType = scoreData.pieceType;
    var newPieceName = scoreData.pieceName;
    var newPieceData = scoreData.pieceData;
    //Generate Piece ID:
    //// Timestamp
    var dt = new Date();
    var year = dt.getFullYear();
    var month = dt.getMonth() + 1;
    var day = dt.getDate();
    var hour = dt.getHours();
    var min = dt.getMinutes();
    var sec = dt.getSeconds();
    var timestamp = year + "_" + month + "_" + day + "_" + hour + "_" + min+ "_" + sec;
    var newPieceID = currentWorksIX + "-" + timestamp;
    var tempArray = [];
    tempArray.push(newPieceID);
    tempArray.push(newPieceType);
    tempArray.push(newPieceName);
    tempArray.push(newPieceData);
    var t_epochStartTime = dt.getTime();
    tempArray.push(t_epochStartTime);
    var t_timeAdj = 10;
    tempArray.push(t_timeAdj);
    currentWorks.push(tempArray);
    currentWorksIX++;
    //Send data to splash page where the piece.html will be launched
    socket.broadcast.emit('newPieceBroadcast', {
      newPieceArr: tempArray
    });
    socket.emit('newPieceBroadcast', {
      newPieceArr: tempArray
    });
  }
  // Get List of Pieces in PROGRESS
  socket.on('getPieceList', function(data) {
    socket.broadcast.emit('pieceListBroadcast', {
      piecesInProgress: currentWorks
    });
    socket.emit('pieceListBroadcast', {
      piecesInProgress: currentWorks
    });
  });
  // JOIN PIECE
  socket.on('joinPiece', function(data) {
    var pieceID = data.pieceID;
    var absStartTime, timeAdjustment, pieceType;
    for (var i = 0; i < currentWorks.length; i++) {
      if (pieceID == currentWorks[i][0]) {
        absStartTime = currentWorks[i][4];
        timeAdjustment = currentWorks[i][5];
        pieceType = currentWorks[i][1];
        break;
      }
    }
    socket.broadcast.emit('joinpiecebroadcast', {
      pieceID: pieceID,
      absStartTime: absStartTime,
      timeAdjustment: timeAdjustment,
      pieceType: pieceType
    });
    socket.emit('joinpiecebroadcast', {
      pieceID: pieceID,
      absStartTime: absStartTime,
      timeAdjustment: timeAdjustment,
      pieceType: pieceType
    });
  });







}); // End Socket IO
