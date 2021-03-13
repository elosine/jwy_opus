//<editor-fold> << GLOBAL VARIABLES >> ------------------------------------- //
//<editor-fold>  < GLOBAL VARS - TIMING >                //
var FRAMERATE = 60.0;
var MSPERFRAME = 1000.0 / FRAMERATE;
var framect = 0;
var timeAdjustment = 0;
var clockAdj = 0;
var epochStartTime;
var delta = 0.0;
var lastFrameTimeMs = 0.0;
var clockTimeMS, clockTimeSec, clockTimeMin, clockTimeHrs;
var pauseState = 0;
var pausedTime = 0;
// FUNCTION: startPiece() ------- >
function startPiece() {
  var t_now = new Date(ts.now());
  lastFrameTimeMs = t_now.getTime();
  epochStartTime = lastFrameTimeMs;
  requestAnimationFrame(animationEngine);
}
//</editor-fold> END GLOBAL VARS - TIMING END
//<editor-fold>  < GLOBAL VARS - GATES >                 //
var animationGo = true;
var activateStartBtn = true;
var activatePauseBtn = false;
var activateStopBtn = false;
var startPieceGate = true;
//</editor-fold> END GLOBAL VARS - GATES END
//<editor-fold>  < GLOBAL VARS - PIECE DATA & VARS>            //
var scoreDataFileName = 'flux001_4parts.txt';
var partsToRun = [];
var allScoreData = [];
var partsToRunData = [];
var notationObjects = [];
var numDials = 4;
var ring0W = 500;
var ring0H = 500;
//</editor-fold> END SCORE DATA END
//<editor-fold>  < GLOBAL VARS - MISC >                  //
var SVG_NS = "http://www.w3.org/2000/svg";
var SVG_XLINK = 'http://www.w3.org/1999/xlink';
var urlArgsDict;
var scoreCtrlPanel;
//</editor-fold> END GLOBAL VARS - MISC END
//<editor-fold>  < GLOBAL VARS - TIMESYNC ENGINE >       //
var tsServer;
if (window.location.hostname == 'localhost') {
  tsServer = '/timesync';
} else {
  tsServer = window.location.hostname + '/timesync';
}
var ts = timesync.create({
  server: tsServer,
  // server: '/timesync',
  interval: 1000
});
//</editor-fold> > END GLOBAL VARS - TIMESYNC ENGINE END
//<editor-fold>  < GLOBAL VARS - SOCKET IO >             //
var ioConnection;
if (window.location.hostname == 'localhost') {
  ioConnection = io();
} else {
  ioConnection = io.connect(window.location.hostname);
}
var socket = ioConnection;
//</editor-fold> > END GLOBAL VARS - SOCKET IO END
//</editor-fold> >> END GLOBAL VARIABLES END  /////////////////////////////////

//<editor-fold> << START UP WORKFLOW >> ------------------------------------ //
//<editor-fold>  < WORKFLOW >                            //
/*
1) init() is run from the html page->body <body onload='init();'>
2) init() runs getUrlArgs() to get args from URL
3) init() Get parts to run from urlArgsDict populate partsToRun array
4) init() -> run loadScoreData() which loads score data for all 12 parts
5) loadScoreData() -> extract score data for only the parts you are running store in partsToRunData
6) loadScoreData() -> Make NotationObjects (basic graphic framework for each part) and Draw Static Elements
7) loadScoreData() -> Make Control Panel
*/
//</editor-fold> END WORKFLOW END
//<editor-fold>  < INIT() >                              //
function init() {
  urlArgsDict = getUrlArgs();
  var partsStrArray = urlArgsDict.parts.split(';');
  partsStrArray.forEach((it, ix) => {
    partsToRun.push(parseInt(it));
  });
  var t_scoreDataFileName = urlArgsDict.dataFileName || scoreDataFileName;
  var scoreDataFilePath = 'savedScoreData/' + t_scoreDataFileName;


  //// <- TEMP -> ////
  mkNotationObject(0, ring0W, ring0H, defaultScoreData['0'], [0,1] /*[#, ofTotal]*/ );
}
//</editor-fold> END INIT() END
//</editor-fold> >> END START UP WORKFLOW  ////////////////////////////////////

//<editor-fold> << SCORE DATA & EVENTS >> ---------------------------------- //
function retriveFile(path) {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'text';
    request.onload = () => resolve({
      fileData: request.response
    });
    request.onerror = reject;
    request.send();
  })
}
async function loadScoreData(path) {
  var eventsArray = [];
  var retrivedFileDataObj = await retriveFile(path);
  var retrivedFileData = retrivedFileDataObj.fileData;
  var playersArr = retrivedFileData.split("newPlayerDataSet");
  playersArr.forEach(function(it, ix) {
    var t1 = it.split(";");
    var thisPlayersEvents = [];
    for (var i = 0; i < t1.length; i++) {
      if (t1[i] == -1) {
        thisPlayersEvents.push(-1);
      } else {
        t2 = [];
        var temparr = t1[i].split(',');
        t2.push(temparr[0]);
        t2.push(parseInt(temparr[1]));
        t2.push(parseInt(temparr[2]));
        thisPlayersEvents.push(t2);
      }
    }
    eventsArray.push(thisPlayersEvents);
  });

  partsToRun.forEach((it, ix) => {
    var newNO = mkNotationObject(it, ringW, ringH, numTicksPerDial[it], bpms[it], eventsArray[it], [ix, partsToRun.length]);
    notationObjects.push(newNO);
  });
  scoreCtrlPanel = mkCtrlPanel_ctrl('scoreCtrlPanel', 70, 162, 'Ctrl Panel', ['left-top', '0px', '0px', 'none'], 'xs');

  return eventsArray;
}


//</editor-fold> >> END SCORE DATA & EVENTS END  //////////////////////////////

//<editor-fold> << NOTATION OBJECT >> -------------------------------------- //
//<editor-fold>  < NOTATION OBJECT - INIT >              //
function mkNotationObject(ix, w, h, scoreDataObj, placementOrder /*[#, ofTotal]*/ ) {
  var thisScoreData = scoreDataObj.partScoreData;
  var notationObj = {};
  notationObj['ix'] = ix;
  var id = 'cascadingRings' + ix;
  notationObj['id'] = id;
  // PLACEMENT OF PANEL IN BROWSER WINDOW ---- >
  var offsetX;
  var partOrderNum = placementOrder[0];
  var totalParts = placementOrder[1];
  var txoffset;
  if (placementOrder[1] == 1) { //only one part
    roffsetX = '0px';
  } else {
    txoffset = partOrderNum - (totalParts / 2) + 0.5;
    offsetX = (txoffset * (w + 7)).toString() + 'px';
  }
  // FUNCTION VARIABLES ----------- >
  var cx = w / 2;
  var cy = h / 2;
  var pad = 18;
  var r1 = (w / 2) - pad;
  var circumferenceOG = 2 * Math.PI * r1;
  var circumference1Sec = circumferenceOG / 60;
  var twelveOclockY = pad;
  var ringStrokeWidth = 4;
  var dialStrokeWidth = 4;
  // var halfDSW = dialStrokeWidth/2;
  var dialLength = 18;
  var halfDL = dialLength / 2;
  var initDeg = -90; //temp
  // << CANVAS -------------------- >
  var canvasID = id + 'canvas';
  var canvas = mkSVGcanvas(canvasID, w, h);
  notationObj['canvas'] = canvas;
  // << PANEL ---=----------------- >
  var panelID = id + 'panel';
  var panel = mkPanel(panelID, canvas, w, h, "Player " + ix.toString(), ['center-top', offsetX, '0px', 'none'], 'xs');
  notationObj['panel'] = panel;
  //</editor-fold> END NOTATION OBJECT - INIT END
  //<editor-fold>  < NOTATION OBJECT - STATIC ELEMENTS >   //
  // RINGS ------------------------ >
  var ringElements = [];
  var ringsSize_Sec = [];
  thisScoreData.forEach((it, ix) => {
    ringsSize_Sec.push(it[0]);
  });
  ringsSize_Sec.forEach((it, ix) => {
    var newCircumference = circumference1Sec * it;
    var newR = newCircumference / (2 * Math.PI);
    var newCy = cy - (r1 - newR) + (ix * pad);
    var ring = document.createElementNS(SVG_NS, "circle");
    ring.setAttributeNS(null, "cx", cx);
    ring.setAttributeNS(null, "cy", newCy);
    ring.setAttributeNS(null, "r", newR);
    ring.setAttributeNS(null, "stroke", "rgb(153, 255, 0)");
    ring.setAttributeNS(null, "stroke-width", ringStrokeWidth);
    ring.setAttributeNS(null, "fill", "none");
    var ringID = id + 'ring' + ix;
    ring.setAttributeNS(null, "id", ringID);
    canvas.appendChild(ring);
    notationObj['rings'] = ringElements;


    var testArc = document.createElementNS(SVG_NS, "path");

    testArc.setAttributeNS(null, "d", describeArc(cx, newCy, newR, 0, 40));
    testArc.setAttributeNS(null, "stroke-width", 9);
    testArc.setAttributeNS(null, "stroke", "magenta");

    testArc.setAttributeNS(null, "fill", "none");

    canvas.appendChild(testArc);


    // DIALS ------------------------ >
    var newY1 = newCy - newR;
    var ogx1 = ((newR + halfDL) * Math.cos(rads(initDeg + (10 * ix)))) + cx;
    var ogy1 = ((newR + halfDL) * Math.sin(rads(initDeg + (10 * ix)))) + newCy;
    var ogx2 = ((newR - halfDL) * Math.cos(rads(initDeg + (10 * ix)))) + cx;
    var ogy2 = ((newR - halfDL) * Math.sin(rads(initDeg + (10 * ix)))) + newCy;
    var dial = document.createElementNS(SVG_NS, "line");
    // dial.setAttributeNS(null, "x1", cx);
    // dial.setAttributeNS(null, "y1", newCy);
    dial.setAttributeNS(null, "x1", ogx1);
    dial.setAttributeNS(null, "y1", ogy1);
    dial.setAttributeNS(null, "x2", ogx2);
    dial.setAttributeNS(null, "y2", ogy2);
    // dial.setAttributeNS(null, "x2", cx);
    // dial.setAttributeNS(null, "y2", newCy);
    dial.setAttributeNS(null, "stroke", "rgb(153,255,0)");
    dial.setAttributeNS(null, "stroke-width", dialStrokeWidth);
    dial.setAttributeNS(null, "stroke-linecap", 'round');
    var dialID = id + 'dial' + ix;
    dial.setAttributeNS(null, "id", dialID);
    canvas.appendChild(dial);
    notationObj['dial'] = dial;
  });
  //</editor-fold> END NOTATION OBJECT - STATIC ELEMENTS END
  //<editor-fold>  < NOTATION OBJECT - ANIMATION >         //
  /*
  notationObj['animate'] = function(time) {
    // Animate Dial
    currDeg += degreesPerFrame; //advance degreesPerFrame
    var newDialX1 = r1 * Math.cos(rads(currDeg)) + cx;
    var newDialY1 = r1 * Math.sin(rads(currDeg)) + cy;
    dial.setAttributeNS(null, "x1", newDialX1);
    dial.setAttributeNS(null, "y1", newDialY1);
    return notationObj;
  }
  */
  //</editor-fold> END NOTATION OBJECT - ANIMATION END
}
//</editor-fold> >> END NOTATION OBJECT  //////////////////////////////////////

//<editor-fold> << CONTROL PANEL >> ---------------------------------------- //
function mkCtrlPanel_ctrl(id, w, h, title, posArr, headerSize) {
  var panelObj = mkCtrlPanel(id, w, h, title, posArr, headerSize);
  var panel = panelObj.panel;
  var canvas = panelObj.canvas;
  var btnW = w - 15;
  var btnH = 36;
  //<editor-fold>  < CONTROL PANEL - START BUTTON >        //
  var startBtnFunc = function() {
    if (activateStartBtn) {
      var t_now = new Date(ts.now());
      var absStartTime = t_now.getTime();
      socket.emit('sf003_startpiece', {});
    }
  }
  var startBtn = mkButton(canvas, id + 'startbtn', btnW, btnH, 0, 0, 'Start', 12, startBtnFunc);
  panelObj['startBtn'] = startBtn;
  // SOCKET IO - START PIECE ------ >
  socket.on('sf003_startpiecebroadcast', function(data) {
    if (startPieceGate) {
      startPieceGate = false;
      activateStartBtn = false;
      activateStopBtn = true;
      activatePauseBtn = true;
      animationGo = true;
      scoreCtrlPanel.stopBtn.className = 'btn btn-1';
      scoreCtrlPanel.startBtn.className = 'btn btn-1_inactive';
      scoreCtrlPanel.pauseBtn.className = 'btn btn-1';
      scoreCtrlPanel.panel.smallify();
      startPiece();
    }
  });
  //</editor-fold> END START BUTTON END
  //<editor-fold>  < CONTROL PANEL - PAUSE BUTTON >        //
  var pauseBtnFunc = function() {
    if (activatePauseBtn) {
      pauseState = (pauseState + 1) % 2;
      var t_now = new Date(ts.now());
      var pauseTime = t_now.getTime()
      if (pauseState == 1) { //Paused
        socket.emit('sf003_pause', {
          pauseState: pauseState,
          pauseTime: pauseTime
        });
      } else if (pauseState == 0) { //unpaused
        var globalPauseTime = pauseTime - pausedTime;
        socket.emit('sf003_pause', {
          pauseState: pauseState,
          pauseTime: globalPauseTime
        });
      }
    }
  }
  var pauseBtn = mkButton(canvas, id + 'pausebtn', btnW, btnH, 51, 0, 'Pause', 12, pauseBtnFunc);
  panelObj['pauseBtn'] = pauseBtn;
  pauseBtn.className = 'btn btn-1_inactive';
  // SOCKET IO - PAUSE BROADCAST -- >
  socket.on('sf003_pauseBroadcast', function(data) {
    pauseState = data.pauseState;
    if (pauseState == 0) { //unpaused
      timeAdjustment = data.pauseTime + timeAdjustment;
      scoreCtrlPanel.pauseBtn.innerText = 'Pause';
      scoreCtrlPanel.pauseBtn.className = 'btn btn-1';
      scoreCtrlPanel.panel.smallify();
      animationGo = true;
      requestAnimationFrame(animationEngine);
    } else if (pauseState == 1) { //paused
      pausedTime = data.pauseTime
      animationGo = false;
      scoreCtrlPanel.pauseBtn.innerText = 'Resume';
      scoreCtrlPanel.pauseBtn.className = 'btn btn-2';
    }
  });
  //</editor-fold> END PAUSE BUTTON END
  //<editor-fold>  < CONTROL PANEL - STOP BUTTON >         //
  var stopBtnFunc = function() {
    if (activateStopBtn) {
      socket.emit('sf003_stop', {});
    }
  }
  var stopBtn = mkButton(canvas, id + 'stopbtn', btnW, btnH, 51 + btnH + 16, 0, 'stop', 12, stopBtnFunc);
  panelObj['stopBtn'] = stopBtn;
  // SOCKET IO - STOP ------------- >
  stopBtn.className = 'btn btn-1_inactive';
  socket.on('sf003_stopBroadcast', function(data) {
    location.reload();
  });
  //</editor-fold> END STOP BUTTON END
  return panelObj;
}
//</editor-fold> >> CONTROL PANEL  ////////////////////////////////////////////

//<editor-fold> << ANIMATION ENGINE >> ------------------------------------- //
//<editor-fold>  < ANIMATION ENGINE - ENGINE >           //
function animationEngine(timestamp) {
  var t_now = new Date(ts.now());
  t_lt = t_now.getTime() - timeAdjustment;
  calcClock(t_lt);
  delta += t_lt - lastFrameTimeMs;
  lastFrameTimeMs = t_lt;
  while (delta >= MSPERFRAME) {
    update(MSPERFRAME, t_lt);
    draw();
    delta -= MSPERFRAME;
  }
  if (animationGo) requestAnimationFrame(animationEngine);
}
//</editor-fold> END ANIMATION ENGINE - ENGINE END
//<editor-fold>     < ANIMATION ENGINE - UPDATE >           //
function update(aMSPERFRAME, currTimeMS) {
  framect++;
  // ANIMATE ---------------------- >
  notationObjects.forEach(function(it, ix) {
    it.animate(currTimeMS);
  });
}
//</editor-fold> END ANIMATION ENGINE - UPDATE END
//<editor-fold>     < ANIMATION ENGINE - DRAW >             //
function draw() {}
//</editor-fold> END ANIMATION ENGINE - DRAW END    //
//</editor-fold>  > END ANIMATION ENGINE  /////////////////////////////////////

//<editor-fold>  <<<< UTILITIES >>>> --------------------------------------- //
//<editor-fold>   < UTILITIES - CLOCK >                  //
var clockDiv = mkCanvasDiv('clockdiv', 41, 20, 'yellow');
var clockPanel = mkClockPanel(clockDiv);

function calcClock(time) {
  var timeMS = time - epochStartTime + (clockAdj * 1000);
  clockTimeMS = timeMS % 1000;
  clockTimeSec = Math.floor(timeMS / 1000) % 60;
  clockTimeMin = Math.floor(timeMS / 60000) % 60;
  clockTimeHrs = Math.floor(timeMS / 3600000);
  document.getElementById('clockdiv').innerHTML =
    pad(clockTimeMin, 2) + ":" +
    pad(clockTimeSec, 2)
}
//</editor-fold> END UTILITIES - CLOCK END
//</editor-fold>  > END UTILITIES  ////////////////////////////////////////////

//<editor-fold> << SCORE DATA GENERATION >> -------------- --------------- //
//<editor-fold>  < SCORE DATA GENERATION - ALGORITHM >   //
/*
3 Parts each with sets of cascading rings each smaller than the next.
There will be 4 - 6 cascading rings per part.
There are 60, 1 second segments in the largest ring.
Each largest ring will have between 2 and 4 events.
Events are either acceleration or deceleration chosen randomly.
Events will collectively last max 18-24 seconds decided randomly
Make event durations as follows:
1st event will be a duration between maxDur/numEvents, and half this number
Next event will be remainingMaxDur/remainingNumEvents, and 25% this number and so on
Randomly distribute the events in the cycle with initial minGap=3sec. no events should overlap
All subsequent rings will have random segments removed.
The smallest ring will be no smaller than 1/3 the original ring.
Use the above method to calculate the number of segments to remove each subsequent ring
The segments to be removed will be calculated randomly and those actual segments should be removed each ring
If there is an event during that segment, the event will be shortened, if rest, the rest shortened
In performance, the first part of the piece should be from largest ring to smallest ring and back,but then after this, next rings can be chosen at random
*/
//</editor-fold> END SCORE DATA GENERATION - ALGORITHM END
function sf003_generateScoreData() {
  var numParts = 3;
  var scoreData = {};
  //Obj for each part
  for (var i = 0; i < numParts; i++) {
    scoreData[i.toString()] = {};
  }
  //Make data for each part
  for (var i = 0; i < numParts; i++) {
    var itos = i.toString();
    var t_partObj = scoreData[itos];
    // Decide # cascading rings
    var numCascadingRings = rrandInt(3, 5);
    t_partObj['numRings'] = numCascadingRings;
    // Decide # Events
    var numEvents = rrandInt(2, 4);
    t_partObj['numEvents'] = numEvents;
    // Decide event durations
    var maxDurEvents = rrandInt(21, 33);
    var eventDursSet = mkCascadingSet_wTotal(maxDurEvents, numEvents);
    var eventDurs = roundSet(eventDursSet[0]);
    var totalEventDurs = Math.round(eventDursSet[1]);
    t_partObj['eventDurs'] = eventDurs;
    //Decide Event Gaps
    var maxAllGaps = 60 - totalEventDurs;
    var gaps = roundSet(mkCascadingSet(maxAllGaps, numEvents));
    t_partObj['gaps'] = gaps;
    //Decide segments to eliminate for each subsequent ring
    var maxSegmentsToDelete = 30;
    var numSegmentsToDeleteSet = roundSet(mkCascadingSet(maxSegmentsToDelete, numCascadingRings - 1));
    var segments = mkNumbers(60);
    var secToDel = [];
    numSegmentsToDeleteSet.forEach((it, ix) => { //set of num of segments to delete per ring
      var tar = [];
      for (var k = 0; k < it; k++) { // iterate it number of segments
        var segToDel = choose(segments);
        tar.push(segToDel);
        segments.forEach((it, ix) => { //remove from segments
          segToDel == it && segments.splice(ix, 1); //remove from segments
        });
      }
      secToDel.push(tar);
    });
    //Make [startDeg,stopDeg] sets for each arc in 1st ring
    var ring1ArcsArray = [];
    var degCt = 0;
    for (var j = 0; j < numEvents; j++) {
      var startStopDegs = [];
      var startDeg = degCt + gaps[j];
      degCt += gaps[j];
      startStopDegs.push(startDeg);
      var stopDeg = degCt + eventDurs[j];
      degCt += eventDurs[j];
      startStopDegs.push(stopDeg);
      ring1ArcsArray.push(startStopDegs);
    }
    //make an array of 60 numbers assigned to gap or event
    //take away seconds from each subsequent ring
    //make new sets using ix[0] and ix[last]
    var gapsEventsArray = [];
    var idx = 0;
    for (var j = 0; j < gaps.length; j++) {
      gapsEventsArray.push(mkNumbers(gaps[j], idx));
      idx = idx + gaps[j];
      gapsEventsArray.push(mkNumbers(eventDurs[j], idx));
      idx = idx + eventDurs[j];
    }
    //flatten and sort segments to delete array for each ring
    var allSecsToDelPerRing = [];
    for (var j = 0; j < secToDel.length; j++) {
      var ogArL = secToDel.length - 1;
      var ringSecsToDel = deepCopy(secToDel);
      ringSecsToDel.splice(j, ogArL - j);
      ringSecsToDel = ringSecsToDel.flat(2);
      numSort(ringSecsToDel);
      allSecsToDelPerRing.push(ringSecsToDel);
    }
    //Remove segments for each ring and generate new array:
    //[ numSecsInRing, arcsStartStop:[start, stop] ] //will need to increase speed for each subsequent ring based on new ring duration
    var allRingsNewArcs = [];
    var tempRingArr = [];
    tempRingArr.push(60);
    tempRingArr.push(ring1ArcsArray);
    allRingsNewArcs.push(tempRingArr); // [ numSecsInRing, arcsStartStop:[start, stop] ]
    allSecsToDelPerRing.forEach((it, ix) => {
      var t_newRingLenSec = 60 - it.length;
      var tempRingArr = [];
      tempRingArr.push(t_newRingLenSec);
      var newGapsEventsArray = deepCopy(gapsEventsArray);
      it.forEach((it4, ix4) => { //segments to delete for each ring
        newGapsEventsArray.forEach((it2, ix2) => {
          it2.forEach((it3, ix3) => {
            if (it4 == it3) { //it4=secToDel; it3=gapOReventSec
              it2.splice(ix3, 1);
            }
          });
        });
      });
      var t_ct = 0;
      var newRingArcs = [];
      var tstart, tstop;
      newGapsEventsArray.forEach((it31, ix31) => {
        if ((ix31 % 2) == 0) {
          t_ct = t_ct + it31.length;
          tstart = t_ct;
        } else {
          t_ct = t_ct + it31.length;
          tstop = t_ct;
          var tar9 = [];
          tar9.push(tstart);
          tar9.push(tstop);
          newRingArcs.push(tar9)
        }
      });
      tempRingArr.push(newRingArcs);
      allRingsNewArcs.push(tempRingArr); // [ numSecsInRing, arcsStartStop:[start, stop] ]
    });
    t_partObj['partScoreData'] = allRingsNewArcs;
  }
  return scoreData;

}
//</editor-fold> >> END SCORE DATA GENERATION END  ////////////////////////////

//<editor-fold> << DEFAULT SCORE DATA >> ----------------------------------- //
var defaultScoreData = {
  "0": {
    "numRings": 4,
    "numEvents": 3,
    "eventDurs": [7, 7, 3],
    "gaps": [12, 11, 18],
    "partScoreData": [
      [60, [
        [12, 19],
        [30, 37],
        [55, 58]
      ]],
      [54, [
        [12, 19],
        [29, 35],
        [49, 52]
      ]],
      [45, [
        [9, 16],
        [25, 30],
        [41, 44]
      ]],
      [38, [
        [7, 11],
        [19, 24],
        [34, 37]
      ]]
    ]
  },
  "1": {
    "numRings": 3,
    "numEvents": 4,
    "eventDurs": [7, 6, 4, 11],
    "gaps": [8, 6, 6, 10],
    "partScoreData": [
      [60, [
        [8, 15],
        [21, 27],
        [33, 37],
        [47, 58]
      ]],
      [54, [
        [8, 15],
        [19, 24],
        [29, 33],
        [43, 52]
      ]],
      [41, [
        [6, 11],
        [15, 20],
        [24, 28],
        [32, 39]
      ]]
    ]
  },
  "2": {
    "numRings": 5,
    "numEvents": 4,
    "eventDurs": [6, 5, 3, 4],
    "gaps": [11, 9, 8, 10],
    "partScoreData": [
      [60, [
        [11, 17],
        [26, 31],
        [39, 42],
        [52, 56]
      ]],
      [51, [
        [11, 17],
        [25, 30],
        [34, 37],
        [44, 48]
      ]],
      [43, [
        [9, 15],
        [21, 26],
        [29, 31],
        [38, 41]
      ]],
      [36, [
        [8, 12],
        [17, 20],
        [23, 25],
        [32, 35]
      ]],
      [30, [
        [7, 11],
        [16, 19],
        [21, 21],
        [28, 30]
      ]]
    ]
  }
}

// var newScoreDat = sf003_generateScoreData();
// var newScoreDatStr = JSON.stringify(newScoreDat);
// console.log(newScoreDat);
// console.log(newScoreDatStr);
//</editor-fold> >> END DEFAULT SCORE DATA END  ///////////////////////////////



















//// SAMPLE SECTIONERS
//<editor-fold> << ANIMATION ENGINE >> ------------------------------------- //
//</editor-fold> >> END ANIMATION ENGINE  /////////////////////////////////////
//<editor-fold>  < ANIMATION ENGINE - UPDATE >           //
//</editor-fold> END ANIMATION ENGINE - UPDATE END
// SUBSECTION L1 ---------------- >
// << SUBSECTION L2 ------------- >
// << << SUBSECTION L3 ---------- >
