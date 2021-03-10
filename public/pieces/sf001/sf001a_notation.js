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
var numTicksPerDial = [12, 11, 13, 9];
var bpms = [87, 87, 87, 87];
var dialW = 360;
var dialH = 360;
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
/*
1) init() is run from the html page->body <body onload='init();'>
2) init() runs getUrlArgs() to get args from URL
3) init() Get parts to run from urlArgsDict populate partsToRun array
4) init() -> run loadScoreData() which loads score data for all 12 parts
5) loadScoreData() -> extract score data for only the parts you are running store in partsToRunData
6) loadScoreData() -> Make NotationObjects (basic graphic framework for each part) and Draw Static Elements
7) loadScoreData() -> Make Control Panel
*/
//<editor-fold>  < INIT() >                              //
function init() {
  urlArgsDict = getUrlArgs();
  var partsStrArray = urlArgsDict.parts.split(';');
  partsStrArray.forEach((it, ix) => {
    partsToRun.push(parseInt(it));
  });
  var t_scoreDataFileName = urlArgsDict.dataFileName || scoreDataFileName;
  var scoreDataFilePath = 'savedScoreData/' + t_scoreDataFileName;
  allScoreData = loadScoreData(scoreDataFilePath);
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
    var newNO = mkDialNO(it, dialW, dialH, numTicksPerDial[it], bpms[it], eventsArray[it], [ix, partsToRun.length]);
    notationObjects.push(newNO);
  });
  scoreCtrlPanel = mkCtrlPanel_ctrl('scoreCtrlPanel', 70, 162, 'Ctrl Panel', ['left-top', '0px', '0px', 'none'], 'xs');

  return eventsArray;
}


//</editor-fold> >> END SCORE DATA & EVENTS END  //////////////////////////////

// <editor-fold> <<<< DIAL NOTATION OBJECT >>>> ---------------------------- //
// <editor-fold>        <<<< DIAL NOTATION OBJECT - INIT >>>> -- //
function mkDialNO(ix, w, h, numTicks, ibpm, notesArr, placementOrder /*[#, ofTotal]*/ ) {
  var notationObj = {}; //returned object to add all elements and data
  notationObj['ix'] = ix;
  // PLACEMENT OF PANEL IN BROWSER WINDOW ----------- >
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
  var cx = w / 2;
  var cy = h / 2;
  var innerRadius = 70;
  var tickLength = 11;
  var tickWidth = 1;
  var noteSpace = 70;
  var midRadius = innerRadius + noteSpace;
  var bbRadius = 10;
  var bbLandLineY = cy + innerRadius - 20;
  var bbImpactY = bbLandLineY - bbRadius;
  var bbDescentLengthFrames = 13;
  var bbDescentLengthPx = (bbDescentLengthFrames * (bbDescentLengthFrames + 1)) / 2;
  var bbStartY = bbImpactY - bbDescentLengthPx; // 78 accomodates acceleration 1+2+3+4...12
  var bbLandLineR = 10;
  var bbLandLineX1 = cx - bbLandLineR;
  var bbLandLineX2 = cx + bbLandLineR;
  var bbOffFrame = 0;
  var bbDurFrames = 18;
  var bbVelocity = 1;
  var bbAccel = 1;
  // var bbDescentLength = bbImpactY - bbStartY; //80 velocity has to into this whole
  var bbLeadTime;
  var bbDir = 1;
  var defaultStrokeWidth = 4;
  var outerRadius = w / 2;
  var tickBlinkTimes = []; //timer to blink ticks
  var notes = [];
  var noteBoxes = [];
  var tickDegs = [];
  for (var i = 0; i < numTicks; i++) tickBlinkTimes.push(0); //populate w/0s
  // Calculate number of degrees per frame
  var beatsPerSec = ibpm / 60;
  var beatsPerFrame = beatsPerSec / FRAMERATE;
  var degreesPerBeat = 360 / numTicks;
  var degreesPerFrame = degreesPerBeat * beatsPerFrame;
  var framesPerBeat = 1.0 / beatsPerFrame;
  var initDeg = 270 - (5 * degreesPerBeat);
  var currDeg = initDeg;
  var lastDeg = currDeg;
  // 100 beats trial
  var bbBeatFrames = [];
  for (var i = 0; i < 3000; i++) {
    bbBeatFrames.push(Math.round(i * framesPerBeat) - bbDescentLengthFrames);
  }
  // Generate ID
  var id = 'dial' + ix;
  notationObj['id'] = id;
  // Make SVG Canvas ------------- >
  var canvasID = id + 'canvas';
  var svgCanvas = mkSVGcanvas(canvasID, w, h); //see func below
  notationObj['canvas'] = svgCanvas;
  // Make jsPanel ----------------- >
  var panelID = id + 'panel';
  var panel = mkPanel(panelID, svgCanvas, w, h, "Player " + ix.toString(), ['center-top', offsetX, '0px', 'none'], 'xs');
  notationObj['panel'] = panel;
  // </editor-fold>       END DIAL NOTATION OBJECT - INIT /////////
  // <editor-fold>      <<<< DIAL NOTATION OBJECT - STATIC ELEMENTS //
  //// Ring -------------------------------- //
  var ring = document.createElementNS(SVG_NS, "circle");
  ring.setAttributeNS(null, "cx", cx);
  ring.setAttributeNS(null, "cy", cy);
  ring.setAttributeNS(null, "r", innerRadius);
  ring.setAttributeNS(null, "stroke", "rgb(153, 255, 0)");
  ring.setAttributeNS(null, "stroke-width", defaultStrokeWidth);
  ring.setAttributeNS(null, "fill", "none");
  var ringID = id + 'ring';
  ring.setAttributeNS(null, "id", ringID);
  svgCanvas.appendChild(ring);
  notationObj['ring'] = ring;
  //// Dial ------------------------------- //
  var dialWidth = 1;
  var dial = document.createElementNS(SVG_NS, "line");
  var ogx1 = outerRadius * Math.cos(rads(initDeg)) + cx;
  var ogy1 = outerRadius * Math.sin(rads(initDeg)) + cy;
  dial.setAttributeNS(null, "x1", ogx1);
  dial.setAttributeNS(null, "y1", ogy1);
  dial.setAttributeNS(null, "x2", cx);
  dial.setAttributeNS(null, "y2", cy);
  dial.setAttributeNS(null, "stroke", "rgb(153,255,0)");
  dial.setAttributeNS(null, "stroke-width", dialWidth);
  var dialID = id + 'dial';
  dial.setAttributeNS(null, "id", dialID);
  svgCanvas.appendChild(dial);
  notationObj['dial'] = dial;
  //// Ticks ------------------------------- //
  var ticks = [];
  var tickRadius = innerRadius - (defaultStrokeWidth / 2) - 3; // ticks offset from dial 3px like a watch
  for (var i = 0; i < numTicks; i++) {
    var tickDeg = -90 + (degreesPerBeat * i); //-90 is 12 o'clock
    tickDegs.push(tickDeg); //store degrees for collision detection later
    var x1 = midRadius * Math.cos(rads(tickDeg)) + cx;
    var y1 = midRadius * Math.sin(rads(tickDeg)) + cy;
    var x2 = (tickRadius - tickLength) * Math.cos(rads(tickDeg)) + cx;
    var y2 = (tickRadius - tickLength) * Math.sin(rads(tickDeg)) + cy;
    var tick = document.createElementNS(SVG_NS, "line");
    tick.setAttributeNS(null, "x1", x1);
    tick.setAttributeNS(null, "y1", y1);
    tick.setAttributeNS(null, "x2", x2);
    tick.setAttributeNS(null, "y2", y2);
    tick.setAttributeNS(null, "stroke", "rgb(255,128,0)");
    tick.setAttributeNS(null, "stroke-width", tickWidth);
    var tickID = id + 'tick' + i;
    tick.setAttributeNS(null, "id", tickID);
    svgCanvas.appendChild(tick);
    ticks.push(tick);
  }
  notationObj['ticks'] = ticks;
  //// Bouncing Ball ------------------------------- //
  //bb landing line
  var bbLandLineWidth = 2;
  var bbLandLine = document.createElementNS(SVG_NS, "line");
  bbLandLine.setAttributeNS(null, "x1", bbLandLineX1);
  bbLandLine.setAttributeNS(null, "y1", bbLandLineY);
  bbLandLine.setAttributeNS(null, "x2", bbLandLineX2);
  bbLandLine.setAttributeNS(null, "y2", bbLandLineY);
  bbLandLine.setAttributeNS(null, "stroke", "rgb(153,255,0)");
  bbLandLine.setAttributeNS(null, "stroke-width", bbLandLineWidth);
  var bbLandLineID = id + 'bbLandLine';
  bbLandLine.setAttributeNS(null, "id", bbLandLineID);
  svgCanvas.appendChild(bbLandLine);
  notationObj['bbLandLine'] = bbLandLine;
  //Create array of 4 balls
  //Only visible x amount of time before
  //bb landing line
  var bb = document.createElementNS(SVG_NS, "circle");
  bb.setAttributeNS(null, "cx", cx);
  bb.setAttributeNS(null, "cy", bbStartY);
  bb.setAttributeNS(null, "r", bbRadius); //set bb radius
  bb.setAttributeNS(null, "stroke", "none");
  bb.setAttributeNS(null, "fill", "rgb(153, 255, 0)");
  var bbID = id + 'bb';
  bb.setAttributeNS(null, "id", bbID);
  bb.setAttributeNS(null, 'visibility', 'hidden');
  svgCanvas.appendChild(bb);
  notationObj['bouncingBall'] = bb;
  // </editor-fold>     END DIAL NOTATION OBJECT - STATIC ELEMENTS //
  // <editor-fold>      <<<< DIAL NOTATION OBJECT - GENERATE NOTATION >>>> //
  // Generate New Notation and Boxes
  for (var i = 0; i < notesArr.length; i++) {
    if (notesArr[i] != -1) {
      var url = notesArr[i][0];
      var svgW = notesArr[i][1];
      var svgH = notesArr[i][2];
      var deg = notesArr[i][3];
      var notationSVG = document.createElementNS(SVG_NS, "image");
      notationSVG.setAttributeNS(SVG_XLINK, 'xlink:href', url);
      var rectx = midRadius * Math.cos(rads(tickDegs[i])) + cx - (svgW / 2);
      var recty = midRadius * Math.sin(rads(tickDegs[i])) + cy - (svgH / 2);
      notationSVG.setAttributeNS(null, "transform", "translate( " + rectx.toString() + "," + recty.toString() + ")");
      var notationSVGID = id + 'notationSVG' + i;
      notationSVG.setAttributeNS(null, "id", notationSVGID);
      notationSVG.setAttributeNS(null, 'visibility', 'visible');
      notes.push(notationSVG);
      var noteBox = document.createElementNS(SVG_NS, "rect");
      noteBox.setAttributeNS(null, "width", svgW + 6);
      noteBox.setAttributeNS(null, "height", svgH + 6);
      var boxX = rectx - 3;
      var boxY = recty - 3;
      noteBox.setAttributeNS(null, "transform", "translate( " + boxX.toString() + "," + boxY.toString() + ")");
      var noteBoxID = id + 'noteBox' + i;
      noteBox.setAttributeNS(null, "id", canvasID);
      noteBox.setAttributeNS(null, 'visibility', 'visible');
      noteBox.setAttributeNS(null, "fill", "white");
      noteBoxes.push(noteBox);
      svgCanvas.appendChild(noteBox);
      svgCanvas.appendChild(notationSVG);
    } else { //not all ticks have a notation box. push 0 to empty ones
      notes.push(0);
      noteBoxes.push(0);
    }
  }
  // </editor-fold>     END DIAL NOTATION OBJECT - GENERATE NOTATION
  // <editor-fold>      <<<< DIAL NOTATION OBJECT - ANIMATION >>>> //
  var tickBlinkDur = 30;
  var growTickLen = 12; //expand tick stroke-width by this amount
  // ---------------------------------------------------------- >
  notationObj['animate'] = function(time) {
    // Animate Dial
    currDeg += degreesPerFrame; //advance degreesPerFrame
    var newDialX1 = outerRadius * Math.cos(rads(currDeg)) + cx;
    var newDialY1 = outerRadius * Math.sin(rads(currDeg)) + cy;
    dial.setAttributeNS(null, "x1", newDialX1);
    dial.setAttributeNS(null, "y1", newDialY1);
    // Animate Ticks
    var currDegMod = ((currDeg + 90) % 360) - 90; //do this hack so you are not mod negative number
    tickDegs.forEach(function(it, ix) {
      if (ix == 0) { //for tick at 12o'clock to accomodate for positive to negative transition
        if (lastDeg > 0 && currDegMod < 0) { //if last frame was pos and this frame neg
          ticks[ix].setAttributeNS(null, "stroke", "rgb(255,0,0)");
          ticks[ix].setAttributeNS(null, "stroke-width", tickWidth + growTickLen);
          tickBlinkTimes[ix] = (time + tickBlinkDur); //set blink timer time for this tick
          // Note Boxes
          if (noteBoxes[ix] != 0) {
            noteBoxes[ix].setAttributeNS(null, "stroke", "rgb(255,0,0)");
            noteBoxes[ix].setAttributeNS(null, "stroke-width", 4);
          }
        }
      } else {
        if (currDeg < 270) { // different color for count in
          if (it > lastDeg && it <= currDegMod) { //all other ticks looking to see that last frame dial was before this tick and in this frame dial is equal or past this tick
            ticks[ix].setAttributeNS(null, "stroke", "rgb(153,255,0)");
            ticks[ix].setAttributeNS(null, "stroke-width", tickWidth + growTickLen);
            tickBlinkTimes[ix] = (time + tickBlinkDur); //set blink timer time for this tick
          }
        } else {
          if (it > lastDeg && it <= currDegMod) { //all other ticks looking to see that last frame dial was before this tick and in this frame dial is equal or past this tick
            ticks[ix].setAttributeNS(null, "stroke", "rgb(255,0,0)");
            ticks[ix].setAttributeNS(null, "stroke-width", tickWidth + growTickLen);
            tickBlinkTimes[ix] = (time + tickBlinkDur); //set blink timer time for this tick
            // Note Boxes
            if (noteBoxes[ix] != 0) {
              noteBoxes[ix].setAttributeNS(null, "stroke", "rgb(255,0,0)");
              noteBoxes[ix].setAttributeNS(null, "stroke-width", 4);
            }
          }
        }
      }
    });
    // Start Bouncing Ball Timer
    for (var k = 0; k < bbBeatFrames.length; k++) {
      if (framect == bbBeatFrames[k]) {
        bbVelocity = 1;
        bbAccel = 1;
        bb.setAttributeNS(null, 'cy', bbStartY)
        bbOffFrame = framect + bbDurFrames;
        bbDir = 1;
        break;
      }
    }
    lastDeg = currDegMod;
    // Tick blink timer
    tickBlinkTimes.forEach(function(it, ix) {
      if (time > it) {
        ticks[ix].setAttributeNS(null, "stroke", "rgb(255,128,0)");
        ticks[ix].setAttributeNS(null, "stroke-width", tickWidth);
        // Note Boxes
        if (noteBoxes[ix] != 0) {
          noteBoxes[ix].setAttributeNS(null, "stroke", "white");
          noteBoxes[ix].setAttributeNS(null, "stroke-width", 0);
        }
      }
    })
    // Bouncing Ball Animation
    if (framect < bbOffFrame) {
      bb.setAttributeNS(null, 'visibility', 'visible');
      var bbCurrentY = parseInt(bb.getAttributeNS(null, 'cy'));
      bbVelocity = bbVelocity + bbAccel;
      var bbNewY = bbCurrentY + (bbVelocity * bbDir);
      if (bbNewY > bbImpactY) {
        bbDir = -1;
        bbVelocity = 10;
        bbAccel = -1;
      }
      bb.setAttributeNS(null, 'cy', bbNewY)
    } else {
      bb.setAttributeNS(null, 'visibility', 'hidden');
    }
  }
  return notationObj;
}
// </editor-fold>     END DIAL NOTATION OBJECT - ANIMATION ///////
// </editor-fold> END DIAL NOTATION OBJECT ////////////////////////////////////

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
      socket.emit('sf001_startpiece', {});
    }
  }
  var startBtn = mkButton(canvas, id + 'startbtn', btnW, btnH, 0, 0, 'Start', 12, startBtnFunc);
  panelObj['startBtn'] = startBtn;
  // SOCKET IO - START PIECE ------ >
  socket.on('sf001_startpiecebroadcast', function(data) {
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
        socket.emit('sf001_pause', {
          pauseState: pauseState,
          pauseTime: pauseTime
        });
      } else if (pauseState == 0) { //unpaused
        var globalPauseTime = pauseTime - pausedTime;
        socket.emit('sf001_pause', {
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
  socket.on('sf001_pauseBroadcast', function(data) {
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
      socket.emit('sf001_stop', {});
    }
  }
  var stopBtn = mkButton(canvas, id + 'stopbtn', btnW, btnH, 51 + btnH + 16, 0, 'stop', 12, stopBtnFunc);
  panelObj['stopBtn'] = stopBtn;
  // SOCKET IO - STOP ------------- >
  stopBtn.className = 'btn btn-1_inactive';
  socket.on('sf001_stopBroadcast', function(data) {
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
//<editor-fold>  < UTILITIES - THREE.js COLORS >         //
var clr_seaGreen = new THREE.Color("rgb(0, 255, 108)");
var clr_neonMagenta = new THREE.Color("rgb(255, 21, 160)");
var clr_neonBlue = new THREE.Color("rgb(6, 107, 225)");
var clr_forest = new THREE.Color("rgb(11, 102, 35)");
var clr_jade = new THREE.Color("rgb(0, 168, 107)");
var clr_neonGreen = new THREE.Color("rgb(57, 255, 20)");
var clr_limegreen = new THREE.Color("rgb(153, 255, 0)");
var clr_yellow = new THREE.Color("rgb(255, 255, 0)");
var clr_orange = new THREE.Color("rgb(255, 128, 0)");
var clr_red = new THREE.Color("rgb(255, 0, 0)");
var clr_purple = new THREE.Color("rgb(255, 0, 255)");
var clr_neonRed = new THREE.Color("rgb(255, 37, 2)");
var clr_safetyOrange = new THREE.Color("rgb(255, 103, 0)");
var clr_green = new THREE.Color("rgb(0, 255, 0)");
//</editor-fold> END UTILITIES - THREE.js COLORS END
//</editor-fold>  > END UTILITIES  ////////////////////////////////////////////




















//// SAMPLE SECTIONERS
//<editor-fold> << ANIMATION ENGINE >> ------------------------------------- //
//</editor-fold> >> END ANIMATION ENGINE  /////////////////////////////////////
//<editor-fold>  < ANIMATION ENGINE - UPDATE >           //
//</editor-fold> END ANIMATION ENGINE - UPDATE END
// SUBSECTION L1 ---------------- >
// << SUBSECTION L2 ------------- >
// << << SUBSECTION L3 ---------- >
