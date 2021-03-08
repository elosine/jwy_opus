// MAKE A JSPANEL TO LIST ALL PIECES ------------ >
var w = 250;
var h = 260;
var btnH = 50;
var btnW = 217;
var menuH1 = 132;
var gap = 8;
var gap2 = 16;
var H2 = gap + btnH + menuH1;
var H3 = H2 + gap + btnH + menuH1;
var fileNameDataArray;
var yStart = 35;
// SOCKET IO ------------------------- >
var ioConnection;
if (window.location.hostname == 'localhost') {
  ioConnection = io();
} else {
  ioConnection = io.connect(window.location.hostname);
}
var socket = ioConnection;

var canvas = mkCanvasDiv('cid', w, h, 'black');
var panel = mkPanel('pid', canvas, w, h, "Soundflow #2 - Score Manager", ['center-top', '0px', '0px', 'none'], 'xs');

var title = mkSpan(canvas, 'mainTitle', w, 24, 8, 23, 'Soundflow #2 - Score Manager', 16, 'rgb(153,255,0)');
title.style.fontVariant = 'small-caps';

var genScoreBtnFunc = function() {};
var genScoreBtn = mkButton(canvas, 'genScoreBtn', btnW, btnH, yStart, 8, 'Generate Score', 14, function() {
  sf2GenScoreMenuFunc()
});

function sf2GenScoreMenuFunc() {
  fileNameDataArray = generateScoreData_sf002();
  var fileName = fileNameDataArray[0];
  var t_dataStr = fileNameDataArray[1];
  var saveScoreBtnFunc = function() {
    downloadStrToHD(t_dataStr, fileName, 'text/plain');
  }
  var saveScoreBtn = mkButton(canvas, 'saveScoreBtn', btnW, btnH, yStart + btnH + gap2 + 5, 8, 'Save Score Local', 14, saveScoreBtnFunc);

  var saveScoreServerBtnFunc = function() {
    socket.emit('sf002_saveScoreToServer', {
      pieceData: fileNameDataArray
    });
  }
  var saveScoreServerBtn = mkButton(canvas, 'saveScoreServerBtn', btnW, btnH, yStart + btnH + gap2 + 5 + btnH + gap2 + 5, 8, 'Save Score Server', 14, saveScoreServerBtnFunc);
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

  var t_dataStr = makeDataString(scoreData);

  console.log(scoreData);

  // Make File Name
  var nameDataArray = [];
  var t_now = new Date();
  var month = t_now.getMonth() + 1;
  var eventsFileName = "soundflow2_" + t_now.getFullYear() + "_" + month + "_" + t_now.getUTCDate() + "_" + t_now.getHours() + "-" + t_now.getMinutes() + "-" + t_now.getSeconds() + '.txt';
  // [ fileName, scoreDatArr:[] ]
  nameDataArray.push(eventsFileName);
  nameDataArray.push(t_dataStr);

  return nameDataArray;
}

function makeDataString(a_scoreData) {
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
            //No ! on last part
            if (ix != (a_scoreData.length - 1)) {
              eventDataStr = eventDataStr + eventData[i][j].toString() + "!";
            } else {
              eventDataStr = eventDataStr + eventData[i][j].toString();
            }
          } else {
            eventDataStr = eventDataStr + eventData[i][j].toString() + ",";
          }
        }
      }
    }

  });
  return eventDataStr;
}
