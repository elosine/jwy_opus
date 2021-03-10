var express = require('express');
var app = express();
var path = require('path');
var timesyncServer = require('timesync/server');
var server = require('http').createServer(app);
io = require('socket.io').listen(server);
const fs = require('fs');
const PORT = process.env.PORT || 5000
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/private')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
// TIMESYNC SERVER -------------- >
app.use('/timesync', timesyncServer.requestHandler);
//<editor-fold> << SOCKET IO >> -------------------------------------------- //
io.on('connection', function(socket) {
  //<editor-fold> << SF002 >> --------------------------------------------- //
  //<editor-fold>  < START PIECE >                         //
  socket.on('sf002_startpiece', function(data) {
    socket.broadcast.emit('sf002_startpiecebroadcast', {});
    socket.emit('sf002_startpiecebroadcast', {});
  });
  //</editor-fold> END START PIECE END
  //<editor-fold>  < START TIME >                          //
  socket.on('sf002_startTime', function(data) {
    var newStartTime = data.newStartTime;
    socket.broadcast.emit('sf002_startTimeBroadcast', {
      newStartTime: newStartTime
    });
    socket.emit('sf002_startTimeBroadcast', {
      newStartTime: newStartTime
    });
  });
  //</editor-fold> END START TIME END
  //<editor-fold>  < STOP >                                //
  socket.on('sf002_stop', function(data) {
    socket.emit('sf002_stopBroadcast', {});
    socket.broadcast.emit('sf002_stopBroadcast', {});
  });
  //</editor-fold> END STOP END
  //<editor-fold>  < PAUSE >                               //
  socket.on('sf002_pause', function(data) {
    socket.emit('sf002_pauseBroadcast', {
      pauseState: data.pauseState,
      pauseTime: data.pauseTime
    });
    socket.broadcast.emit('sf002_pauseBroadcast', {
      pauseState: data.pauseState,
      pauseTime: data.pauseTime
    });
  });
  //</editor-fold> END PAUSE END
  //<editor-fold>  < sf002_saveScoreToServer >             //
  socket.on('sf002_saveScoreToServer', function(data) {
    var fileName = data.pieceData[0];
    var pieceData = data.pieceData[1];
    var pathStr = "/public/pieces/sf002/savedScoreData/" + fileName;
    var filePath = path.join(__dirname, pathStr);
    fs.writeFile(filePath, pieceData, function(err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
  });
  //</editor-fold> END sf002_saveScoreToServer END
  //<editor-fold>  < LOAD PIECE FROM SERVER >              //
  // Request for load piece from splash page
  socket.on('sf002_loadPieceFromServer', function(data) {
    //joining path of directory
    const directoryPath = path.join(__dirname, 'public/pieces/sf002/savedScoreData');
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function(err, files) {
      //handling error
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      //Send list of files in directory to Splash page
      socket.broadcast.emit('sf002_loadPieceFromServerBroadcast', {
        availableScoreData: files
      });
      socket.emit('sf002_loadPieceFromServerBroadcast', {
        availableScoreDataFiles: files
      });
    });
  });
  //</editor-fold> END LOAD PIECE FROM SERVER END
  //</editor-fold> >> END SF002 END  //////////////////////////////////////////


  //<editor-fold> << sf001 >> --------------------------------------------- //
  //<editor-fold>  < START PIECE >                         //
  socket.on('sf001_startpiece', function(data) {
    socket.broadcast.emit('sf001_startpiecebroadcast', {});
    socket.emit('sf001_startpiecebroadcast', {});
  });
  //</editor-fold> END START PIECE END
  //<editor-fold>  < STOP >                                //
  socket.on('sf001_stop', function(data) {
    socket.emit('sf001_stopBroadcast', {});
    socket.broadcast.emit('sf001_stopBroadcast', {});
  });
  //</editor-fold> END STOP END
  //<editor-fold>  < PAUSE >                               //
  socket.on('sf001_pause', function(data) {
    socket.emit('sf001_pauseBroadcast', {
      pauseState: data.pauseState,
      pauseTime: data.pauseTime
    });
    socket.broadcast.emit('sf001_pauseBroadcast', {
      pauseState: data.pauseState,
      pauseTime: data.pauseTime
    });
  });
  //</editor-fold> END PAUSE END
  //<editor-fold>  < sf001_saveScoreToServer >             //
  socket.on('sf001_saveScoreToServer', function(data) {
    var fileName = data.pieceData[0];
    var pieceData = data.pieceData[1];
    var pathStr = "/public/pieces/sf001/savedScoreData/" + fileName;
    var filePath = path.join(__dirname, pathStr);
    fs.writeFile(filePath, pieceData, function(err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
  });
  //</editor-fold> END sf001_saveScoreToServer END
  //<editor-fold>  < LOAD PIECE FROM SERVER >              //
  // Request for load piece from splash page
  socket.on('sf001_loadPieceFromServer', function(data) {
    //joining path of directory
    const directoryPath = path.join(__dirname, 'public/pieces/sf001/savedScoreData');
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function(err, files) {
      //handling error
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      //Send list of files in directory to Splash page
      socket.broadcast.emit('sf001_loadPieceFromServerBroadcast', {
        availableScoreData: files
      });
      socket.emit('sf001_loadPieceFromServerBroadcast', {
        availableScoreDataFiles: files
      });
    });
  });
  //</editor-fold> END LOAD PIECE FROM SERVER END
  //</editor-fold> >> END sf001 END  //////////////////////////////////////////

}); // End Socket IO
//</editor-fold> >> END SOCKET IO END  ////////////////////////////////////////
