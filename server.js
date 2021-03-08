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
// TIMESYNC SERVER --------------------------------- >
app.use('/timesync', timesyncServer.requestHandler);

// <editor-fold> <<<< SOCKET IO >>>> --------------------------------------- //
io.on('connection', function(socket) {
  // <editor-fold>    << INCOMING MSG >>  ////////////////////
  socket.on('startTime', function(data) {
    var newStartTime = data.newStartTime;
    socket.broadcast.emit('startTimeBroadcast', {
      newStartTime: newStartTime
    });
    socket.emit('startTimeBroadcast', {
      newStartTime: newStartTime
    });
  });
  // </editor-fold>  END INCOMING MSG  ///////////////////////
  // <editor-fold>    << INCOMING MSG >>  ////////////////////
  socket.on('sf002_saveScoreToServer', function(data) {
    console.log('fdsa');
    var fileName = data.pieceData[0];
    var pieceData = data.pieceData[1];
    var pathStr = "/public/pieces/sf002/savedScoreData/" + fileName;
    var filePath = path.join(__dirname, pathStr);
    var fs = require('fs');
    fs.writeFile(filePath, pieceData, function(err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
  });
  // </editor-fold>  END INCOMING MSG  ///////////////////////



  // Request for load piece from splash page
  socket.on('loadPieceFromServer', function(data) {
    //joining path of directory
    const directoryPath = path.join(__dirname, 'public/pieces/sf002/savedScoreData');
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
        availableScoreDataFiles: files
      });
    });

  });



}); // End Socket IO
// </editor-fold>  END SOCKET IO  ////////////////////////////////////////////









//// SAMPLE SECTIONERS
// <editor-fold> <<<< GENERATE SCORE >>>> ---------------------------------- //
// <editor-fold>      << GENERATE SCORE - SF2 >>  ///////////////
// </editor-fold>     END GENERATE SCORE - SF2  /////////////////
// </editor-fold>  END GENERATE SCORE  ////////////////////////////////////////
