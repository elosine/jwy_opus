// <editor-fold>         <<<< GLOBAL VARIABLES >>>> ------------------------ //
// ID ----------------------------- >
var ID = 'scoreLoader';
// Measurements ------------------- >
var w = 300;
var h = 400;
var menuW = 138;
var menuH1 = 132;
var gap = 8;
var halfgap = gap / 2;
var ddMenuLeft_Left = (w / 2) - menuW - halfgap;
var ddMenuRight_Left = (w / 2) + menuW + halfgap;
var btnH = 35;
var btnRight_left = (w / 2) - 3;
// Canvas ------------------------- >
var canvasID = ID + 'canvas';
var canvas = mkCanvasDiv(canvasID, w, h, 'black');
// jsPanel ------------------------ >
var panelID = ID + 'panel';
var panel = mkPanel(panelID, canvas, w, h, "Score Loader", ['center-top', '0px', '0px', 'none'], 'xs');
// </editor-fold> END GLOBAL VARIABLES ////////////////////////////////////////


// <editor-fold>         <<<< MAKE DROP DOWN >>>> -------------------------- //
// Generate Score Menu --------------- >
var genScoreBtnID = ID + 'button';
var genScoreMenuID = ID + 'menu';
var genScoreMenuTop = gap + btnH;
var genScoreListArray = [
  ['Soundflow #1', function() {}],
  ['Soundflow #2', function() {
    var t_scoreData = generateScoreData_sf002();
    socket.emit('mkNewPiece', {
      pieceType: 'sf002',
      pieceName: 'Soundflow #2',
      pieceData: t_scoreData
    });
  }],
  ['Soundflow #3', function() {}]
];

var genScoreMenu = mkMenu(canvas, genScoreMenuID, menuW, menuH1, genScoreMenuTop, ddMenuLeft_Left, genScoreListArray);
var genScoreLoadMenuFunc = function() {
  genScoreMenu.classList.toggle("show");
};
var genScoreBtn = mkButton(canvas, genScoreBtnID, menuW, btnH, 0, 0, 'Generate Score', 14, genScoreLoadMenuFunc);
// </editor-fold>              END MAKE DROP DOWN ------------------- ////////



// <editor-fold>       <<<< MAKE MENU >>>> ---------------------- //
function mkMenu(canvas, id, w, h, top, left, listArray) {
  var menuDiv = document.createElement("div");
  var menuDivID = id + 'menuDiv';
  menuDiv.id = menuDivID;
  menuDiv.className = 'dropdown-content';
  menuDiv.style.width = w.toString() + "px";
  menuDiv.style.top = top.toString() + "px";
  menuDiv.style.left = left.toString() + "px";
  menuDiv.style.maxHeight = h.toString() + "px";
  canvas.appendChild(menuDiv);
  //listArray = [[listLabel, action]]
  listArray.forEach(function(it, ix) {
    var tempAtag = document.createElement('a');
    tempAtag.textContent = it[0];
    tempAtag.style.fontFamily = "lato";
    tempAtag.id = id + 'listA' + ix.toString();
    tempAtag.addEventListener("click", it[1]);
    menuDiv.appendChild(tempAtag);
  });
  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.btn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }
  return menuDiv;
}
// </editor-fold>      END MAKE MENU /////////////////////////////


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


// <editor-fold>       <<<< SOCKET IO - LOAD PIECE >>>> -------------- //
// socket.on('loadPieceBroadcast', function(data) {
//   console.log(data);
//   //Populate menu with available score data
//   var pieceDataListDiv = document.createElement("div");
//   pieceDataListDiv.className = 'dropdown';
//   canvas.appendChild(pieceDataListDiv);
//   var pieceDataDropDownListDiv = document.createElement("div");
//   pieceDataDropDownListDiv.id = 'pieceDataList';
//   pieceDataDropDownListDiv.className = 'dropdown-content';
//   var ddw = btnW - 4;
//   pieceDataDropDownListDiv.style.width = ddw.toString() + "px";
//   var tlistH = pieceName_IDList.length * listH;
//   var tlistT = btnH + 17;
//   pieceDataDropDownListDiv.style.top = tlistT.toString() + "px";
//   var ddL3 = btnL2 + 10 + btnW + 10;
//   pieceDataDropDownListDiv.style.left = ddL2.toString() + "px";
//   pieceDataListDiv.appendChild(pieceDataDropDownListDiv);
//   var dataIx = 0;
//   for (const [key, value] of Object.entries(data)) {
//     console.log(key, value);
//     var tempAtag = document.createElement('a');
//     // tempAtag.setAttribute('href', "scores.html");
//     tempAtag.textContent = value;
//     tempAtag.style.fontFamily = "lato";
//     tempAtag.id = 'scoreData' + dataIx.toString();
//     dataIx++;
//     tempAtag.addEventListener("click", function() {
//       if (activateButtons) {
//
//       }
//     });
//     pieceDataDropDownListDiv.appendChild(tempAtag);
//     pieceDataAtags.push(tempAtag);
//   };
//   pieceDataDropDownListDiv.classList.toggle("show");
//
// });
// </editor-fold>    END SOCKET IO - LOAD PIECE ///////////////////////

//</editor-fold> END SOCKET IO ////////////////////////////////////////////////


// <editor-fold>         <<<< SCORE GENERATION >>>> ------------------------ //

// <editor-fold>       <<<< SOUNDFLOW 2 >>>> ---------------- //
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
// </editor-fold>       END SOUNDFLOW 2 -------------------////////

// </editor-fold>     END SCORE GENERATION ////////////////////////////////////
