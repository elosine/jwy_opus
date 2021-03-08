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

}); // End Socket IO
// </editor-fold>  END SOCKET IO  ////////////////////////////////////////////




























//// SAMPLE SECTIONERS
// <editor-fold> <<<< GENERATE SCORE >>>> ---------------------------------- //
// <editor-fold>      << GENERATE SCORE - SF2 >>  ///////////////
// </editor-fold>     END GENERATE SCORE - SF2  /////////////////
// </editor-fold>  END GENERATE SCORE  ////////////////////////////////////////
