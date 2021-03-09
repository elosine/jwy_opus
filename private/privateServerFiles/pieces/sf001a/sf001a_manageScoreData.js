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
// CANVAS & PANEL & TITLE
var canvas = mkCanvasDiv('cid', w, h, 'black');
var panel = mkPanel('pid', canvas, w, h, "Soundflow #2 - Score Manager", ['center-top', '0px', '0px', 'none'], 'xs');
var title = mkSpan(canvas, 'mainTitle', w, 24, 8, 23, 'Soundflow #2 - Score Manager', 16, 'rgb(153,255,0)');
title.style.fontVariant = 'small-caps';
//GENERATE SCORE - CAN SAVE TO SERVER OR LOCALLY
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



// <editor-fold>      <<<< DIAL NOTATION OBJECT - GENERATE PIECE new //
function generateScoreData() {
  var scoreData = [];
  var numDials = 4;
  var numTicksPerDial = [12, 11, 13, 9];
  var motiveWeightingSets = [
    [0.13, 0.13, 0.13, 0.13, 0.42],
    [0.15, 0.3, 0.18, 0.28, 0.31],
    [0.23, 0.07, 0.2, 0.11, 0.22],
    [0.2, 0.22, 0.2, 0.11, 0.11]
  ];
  var useNotationProbabilities = [0.36, 0.42, 0.33, 0.41];
  var bpms = [87, 87, 87, 87];
  var notationUrlsDimensions = [
    [
      ["/notation/eight_accent_2ndPartial_27_34.svg", 26, 33],
      ["/notation/eight_accent_1stPartial_27_34.svg", 26, 33],
      ["/notation/triplet_accent_1st_partial_45_45.svg", 44, 44],
      ["/notation/quarter_accent_12_35.svg", 12, 35],
      ["/notation/quadruplet_accent.svg", 44, 34]
    ],
    [
      ["/notation/eight_accent_2ndPartial_27_34.svg", 26, 33],
      ["/notation/eight_accent_1stPartial_27_34.svg", 26, 33],
      ["/notation/triplet_accent_1st_partial_45_45.svg", 44, 44],
      ["/notation/quarter_accent_12_35.svg", 12, 35],
      ["/notation/quadruplet_accent.svg", 44, 34]
    ],
    [
      ["/notation/eight_accent_2ndPartial_27_34.svg", 26, 33],
      ["/notation/eight_accent_1stPartial_27_34.svg", 26, 33],
      ["/notation/triplet_accent_1st_partial_45_45.svg", 44, 44],
      ["/notation/quarter_accent_12_35.svg", 12, 35],
      ["/notation/quadruplet_accent.svg", 44, 34]
    ],
    [
      ["/notation/eight_accent_2ndPartial_27_34.svg", 26, 33],
      ["/notation/eight_accent_1stPartial_27_34.svg", 26, 33],
      ["/notation/triplet_accent_1st_partial_45_45.svg", 44, 44],
      ["/notation/quarter_accent_12_35.svg", 12, 35],
      ["/notation/quadruplet_accent.svg", 44, 34]
    ]
  ];
  // notationUrlsDimensions[i], useNotationProbabilities[i], motiveWeightingSets[i]));
  // FUNCTION GENERATE PIECE ALGORITHIM ----------------------------------- //
  numTicksPerDial.forEach((it, ix) => { //for each part ix is part number
    var notesArr = [];
    for (var i = 0; i < it; i++) { //for every tick in each part
      var useNotation = probability(useNotationProbabilities[ix]); //set porbability of any given tick having a notation
      // if this tick has notation, algorithm for choosing the motive for this tick
      if (useNotation) {
        //Universalize this based on array of motives
        var motivesIxSet = [];
        // Generate numbers 0-size of set for chooseWeighted algo below
        notationUrlsDimensions[ix].forEach(function(it, ix) {
          motivesIxSet.push(ix); //make an array of indexes to choose from
        });
        var chosenMotiveIx = chooseWeighted(motivesIxSet, motiveWeightingSets[ix]); //choose the ix of the notation to use
        var chosenMotive = notationUrlsDimensions[ix][chosenMotiveIx]; //this is the chosen motive
        notesArr.push(chosenMotive);
      } else { //not all ticks have a notation box. push 0 to empty ones
        notesArr.push(-1);
      }
    }
    scoreData.push(notesArr);
  });
  return scoreData;
}
// </editor-fold>     END DIAL NOTATION OBJECT - GENERATE PIECE new



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
