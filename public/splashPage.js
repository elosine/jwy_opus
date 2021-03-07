// <editor-fold>         <<<< GLOBAL VARIABLES >>>> ------------------------ //
// ID ----------------------------- >
var ID = 'scoreLoader';
// Measurements ------------------- >
var w = 490;
var h = 400;
var menuW = 146;
var menuH1 = 132;
var btnW = menuW;
var btnH = 35;
var gap = 8;
var gap2 = 12;
var H2 = gap + btnH + menuH1;
var genScoreMenuGate = true;
var serverScoreMenu;
var t_scoreData;
// Canvas ------------------------- >
var canvasID = ID + 'canvas';
var canvas = mkCanvasDiv(canvasID, w, h, 'black');
// jsPanel ------------------------ >
var panelID = ID + 'panel';
var panel = mkPanel(panelID, canvas, w, h, "Score Loader", ['center-top', '0px', '0px', 'none'], 'xs');
// </editor-fold> END GLOBAL VARIABLES ////////////////////////////////////////

// <editor-fold> <<<< GENERATE SCORE >>>> ---------------------------------- //
// Populate Menu Here
var genScoreMenuArray = [
  ['Soundflow #2', function() {
    sf2GenScoreMenuFunc()
  }]
];
var genScoreMenu = mkMenu(canvas, genScoreMenuID, menuW, menuH1, btnH + gap, 0 + gap, genScoreMenuArray);
var genScoreBtnFunc = function() {
  genScoreMenu.classList.toggle("show");
};
var genScoreBtn = mkButton(canvas, genScoreBtnID, btnW, btnH, 0, 0, 'Generate Score', 14, genScoreBtnFunc);

// <editor-fold>      << GENERATE SCORE - SF2 >>  ///////////////
var genScoreBtnID = 'genScoreBtn';
var genScoreMenuID = 'genScoreMenu';
//RUNS WHEN Soundflow#2 Menu item is chosen
function sf2GenScoreMenuFunc() {
  if (genScoreMenuGate) {
    genScoreMenuGate = false;
     t_scoreData = generateScoreData_sf002();
    var saveScoreBtnFunc = function() {
      saveData(t_scoreData);
    }
    var saveScoreBtn = mkButton(canvas, 'saveScoreBtn', btnW, btnH, 0, menuW + gap, 'Save Score', 14, saveScoreBtnFunc);
    var launchScoreBtnFunc = function() {
      socket.emit('mkNewPiece', {
        pieceType: 'sf002',
        pieceName: 'Soundflow #2',
        pieceData: t_scoreData
      });
    }
    var launchScoreBtn = mkButton(canvas, 'launchScore', btnW, btnH, btnH + gap2, menuW + gap, 'Launch Score', 14, launchScoreBtnFunc);
  }
}
// </editor-fold>     END GENERATE SCORE - SF2  /////////////////

// </editor-fold>  END GENERATE SCORE  ////////////////////////////////////////

// <editor-fold> <<<< LOAD SCORE LOCAL >>>> -------------------------------- //
var loadScoreListArray = [
  ['Soundflow #2', function(){loadPiece()}],
];
var loadScoreLocalMenu = mkMenu(canvas, 'loadScoreLocalMenu', menuW, menuH1, H2+btnH+gap, gap, loadScoreListArray);
var loadScoreLoadMenuFunc = function() {
  loadScoreLocalMenu.classList.toggle("show");
};
var loadScoreLocalBtn = mkButton(canvas, 'loadScoreLocalBtn', menuW, btnH, H2, 0, 'Load Score Local', 14, loadScoreLoadMenuFunc);
// </editor-fold>  END LOAD SCORE LOCAL  //////////////////////////////////////

// <editor-fold> <<<< LOAD SCORE SERVER >>>> ------------------------------- //
var loadPieceFromServerFunc = function() {
  socket.emit('loadPieceFromServer', {
    pieceType: 'sf002',
    pieceName: 'Soundflow #2',
    pieceData: t_scoreData
  });
}
var loadPieceFromServerBtn = mkButton(canvas, 'loadPieceFromServerButton', menuW, btnH, H2, menuW + 10, 'Load Score Server', 14, loadPieceFromServerFunc);
// </editor-fold>  END LOAD SCORE SERVER  /////////////////////////////////////

// <editor-fold>         <<<< SOCKET IO >>>> ------------------------------- //

// <editor-fold>       <<<< SOCKET IO - SETUP >>>> -------------- //
var ioConnection;
if (window.location.hostname == 'localhost') {
  ioConnection = io();
} else {
  ioConnection = io.connect(window.location.hostname);
}
var socket = ioConnection;
// </editor-fold>      END SOCKET IO - SETUP ///////////////////////

// <editor-fold>       <<<< SOCKET IO - INIT NEW PIECE >>>> -------------- //
socket.on('newPieceBroadcast', function(data) {
  var newPieceID = data.newPieceArr[0];
  // pass parameters through html
  location.href = "sf002.html?id=" + newPieceID;
});
// </editor-fold>    END SOCKET IO - INIT NEW PIECE ///////////////////////

// <editor-fold>       <<<< SOCKET IO - LOAD PIECE FROM SERVER >>>> ------- //
socket.on('loadPieceFromServerBroadcast', function(data) {
  var t_pieceArr = data.availableScoreData;
  var t_menuArr = [];
  t_pieceArr.forEach((it, ix) => {
    var tar = [];
    tar.push(it);
    var funtt = function() {
      socket.emit('loadServerPieceData', {
        pieceType: 'sf002',
        pieceName: 'Soundflow #2',
        fileName: it
      });
    };
    tar.push(funtt);
    t_menuArr.push(tar);
  });
  serverScoreMenu = mkMenu(canvas, 'serverList', (menuW * 2) + 20, menuH1, H2 + btnH + gap, menuW + 18, t_menuArr);
  serverScoreMenu.classList.toggle("show");
});
// </editor-fold>    END SOCKET IO - LOAD PIECE ///////////////////////

//</editor-fold> END SOCKET IO ////////////////////////////////////////////////

// <editor-fold>         <<<< SCORE GENERATION >>>> ------------------------ //

// <editor-fold>       <<<< SOUNDFLOW 2 >>>> ---------------- //
function saveData(a_scoreData) {
  var eventDataStr = "";
  a_scoreData.forEach(function(it, ix) {
    var eventData = it;
    for (var i = 0; i < eventData.length; i++) {
      if (i != (eventData.length - 1)) { //if not last (last item will not have semicolon)
        for (var j = 0; j < eventData[i].length; j++) {
          if (j == (eventData[i].length - 1)) {
            eventDataStr = eventDataStr + eventData[i][j].toString() + ";"; //semicolon for last one
          } else {
            eventDataStr = eventDataStr + eventData[i][j].toString() + ","; // , for all others
          }
        }
      } else { //last one don't include semicolon
        for (var j = 0; j < eventData[i].length; j++) {
          if (j == (eventData[i].length - 1)) {
            eventDataStr = eventDataStr + eventData[i][j].toString() + "!";
          } else {
            eventDataStr = eventDataStr + eventData[i][j].toString() + ",";
          }
        }
      }
    }

  });
  var t_now = new Date();
  var month = t_now.getMonth() + 1;
  var eventsFileName = "soundflow2_" + t_now.getFullYear() + "_" + month + "_" + t_now.getUTCDate() + "_" + t_now.getHours() + "-" + t_now.getMinutes();
  downloadStrToHD(eventDataStr, eventsFileName, 'text/plain');
}

function generateScoreData_sf002() {
  // numOfParts, cresDurRangeArr, igapRangeArr = 4, deltaAsPercentRangeArr, numOfCyclesRangeArr
  //Events have equal length
  //Gaps between events increase a percentage each event for a certain number
  //of events then revert to the initial gap growing again
  var scoreData = [];
  var numOfParts = 12;
  var cresDurRangeArr = [14, 14];
  var igapRangeArr = [4, 4];
  var durDeltaAsPercentRangeArr = [-0.07, 0.07];
  var gapDeltaAsPercentRangeArr = [0.07, 0.13];
  var numOfCyclesRangeArr = [9, 13];
  for (var i = 0; i < numOfParts; i++) {
    var cresDur = rrand(cresDurRangeArr[0], cresDurRangeArr[1]);
    var igap = rrand(igapRangeArr[0], igapRangeArr[1]);
    var durDeltaAsPercent = rrand(durDeltaAsPercentRangeArr[0], durDeltaAsPercentRangeArr[1]);
    var gapDeltaAsPercent = rrand(gapDeltaAsPercentRangeArr[0], gapDeltaAsPercentRangeArr[1]);
    var numOfCycles = rrandInt(numOfCyclesRangeArr[0], numOfCyclesRangeArr[1]);
    var temp_data = generateEventData_sf002(cresDur, igap, durDeltaAsPercent, gapDeltaAsPercent, numOfCycles);
    scoreData.push(temp_data);
  }

  function generateEventData_sf002(cresDur, igap, durDeltaAsPercent, gapDeltaAsPercent, numOfCycles) {
    var eventDataArray = [];
    var newDur = cresDur;
    var newGap = igap;
    var PIECE_MAX_DURATION = 7200;
    var maxNumEvents = PIECE_MAX_DURATION / cresDur;
    var currCycle = 0;
    var goTime = 0;
    eventDataArray.push([goTime, cresDur]);
    for (var i = 1; i < maxNumEvents; i++) {
      var tempArr = [];
      currCycle++;
      var previousGoTime = eventDataArray[i - 1][0];
      var previousDur = eventDataArray[i - 1][1];
      var newGoTime = previousGoTime + previousDur + newGap;
      if ((currCycle % numOfCycles) == 0) {
        newDur = cresDur;
        newGap = igap;
      } else {
        newDur = newDur * (1 + durDeltaAsPercent);
        newGap = newGap * (1 + gapDeltaAsPercent);
      }
      tempArr.push(newGoTime);
      tempArr.push(newDur);
      eventDataArray.push(tempArr);
    }
    //longest/shortest Dur = igap * Math.pow( (1+changeDeltaAsPercent), numOfCycles )
    return eventDataArray;
  }
  return scoreData;
}



function loadPiece() {
  var input = document.createElement('input');
  input.type = 'file';
  input.onchange = e => {
    var reader = new FileReader();
    reader.readAsText(e.srcElement.files[0]);
    var me = this;
    reader.onload = function() {
      var dataAsText = reader.result;
      var eventsArray = [];
      var playersArr = dataAsText.split("!");
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
      })
      socket.emit('mkNewPiece', {
        pieceType: 'sf002',
        pieceName: 'Soundflow #2',
        pieceData: eventsArray
      });
    }
  }
  input.click();
}




// </editor-fold>       END SOUNDFLOW 2 -------------------////////

// </editor-fold>     END SCORE GENERATION ////////////////////////////////////









// SAMPLE SECTIONERS
// <editor-fold> <<<< GENERATE SCORE >>>> ---------------------------------- //
// <editor-fold>      << GENERATE SCORE - SF2 >>  ///////////////
// </editor-fold>     END GENERATE SCORE - SF2  /////////////////
// </editor-fold>  END GENERATE SCORE  ////////////////////////////////////////
