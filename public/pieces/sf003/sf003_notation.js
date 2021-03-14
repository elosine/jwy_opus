//<editor-fold> << DEFAULT SCORE DATA >> ----------------------------------- //
let defaultScoreData = {
  "0": {
    "numRings": 4,
    "numEvents": 4,
    "eventDurs": [7, 6, 4, 2],
    "gaps": [10, 9, 9, 9],
    "partScoreData": [
      [60, [
        [10, 17, 0],
        [26, 32, 1],
        [41, 45, 0],
        [54, 56, 1]
      ]],
      [53, [
        [9, 13, 1],
        [22, 28, 0],
        [36, 39, 0],
        [48, 50, 0]
      ]],
      [44, [
        [8, 11, 1],
        [20, 24, 0],
        [31, 34, 0],
        [40, 42, 1]
      ]],
      [34, [
        [6, 8, 0],
        [15, 18, 0],
        [22, 25, 1],
        [31, 33, 1]
      ]]
    ]
  },
  "1": {
    "numRings": 5,
    "numEvents": 2,
    "eventDurs": [9, 7],
    "gaps": [16, 9],
    "partScoreData": [
      [60, [
        [16, 25, 0],
        [34, 41, 1]
      ]],
      [57, [
        [16, 25, 0],
        [34, 41, 0]
      ]],
      [49, [
        [13, 20, 1],
        [29, 36, 0]
      ]],
      [42, [
        [12, 18, 1],
        [25, 32, 0]
      ]],
      [35, [
        [9, 14, 0],
        [21, 26, 0]
      ]]
    ]
  },
  "2": {
    "numRings": 3,
    "numEvents": 3,
    "eventDurs": [9, 6, 8],
    "gaps": [9, 9, 6],
    "partScoreData": [
      [60, [
        [9, 18, 1],
        [27, 33, 1],
        [39, 47, 1]
      ]],
      [52, [
        [9, 16, 0],
        [23, 28, 0],
        [34, 40, 1]
      ]],
      [39, [
        [8, 13, 1],
        [17, 21, 1],
        [26, 30, 0]
      ]]
    ]
  }
}

// let newScoreDat = sf003_generateScoreData();
// let newScoreDatStr = JSON.stringify(newScoreDat);
// console.log(newScoreDat);
// console.log(newScoreDatStr);
//</editor-fold> >> END DEFAULT SCORE DATA END  ///////////////////////////////

//<editor-fold> << GLOBAL VARIABLES >> ------------------------------------- //
//<editor-fold>  < GLOBAL VARS - TIMING >                //
const FRAMERATE = 60.0;
const MSPERFRAME = 1000.0 / FRAMERATE;
let frameCount = 0;
let pieceTimeAdjustment = 0;
let pieceStartTime_epochTime;
let delta = 0.0;
let lastFrame_pieceEpochTimeMs = 0.0;
let displayClock_TimeMS, displayClock_TimeSec, displayClock_TimeMin, displayClock_TimeHrs;
let pauseState = 0;
let pausedTime = 0;
// FUNCTION: startPiece() ------- >
function startPiece() {
  let tsNow_Date = new Date(TS.now());
  let tsNow_epochTime = tsNow_Date.getTime();
  lastFrame_pieceEpochTimeMs = tsNow_epochTime;
  pieceStartTime_epochTime = tsNow_epochTime;
  requestAnimationFrame(animationEngine);
}
//</editor-fold> END GLOBAL VARS - TIMING END
//<editor-fold>  < GLOBAL VARS - GATES >                 //
let animation_isGo = true;
let startBtn_isActive = true;
let pauseBtn_isActive = false;
let stopBtn_isActive = false;
let piece_canStart = true;
//</editor-fold> END GLOBAL VARS - GATES END
//<editor-fold>  < GLOBAL VARS - PIECE DATA & VARS>            //
let partsToRun = [];
let allScoreData = defaultScoreData;
let partsToRunData = [];
let notationObjects = [];
let numDials = 4;
let ring0W = 500;
let ring0H = 500;
//</editor-fold> END SCORE DATA END
//<editor-fold>  < GLOBAL VARS - MISC >                  //
const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = 'http://www.w3.org/1999/xlink';
let urlArgsDict;
let scoreCtrlPanel;
//</editor-fold> END GLOBAL VARS - MISC END
//<editor-fold>  < GLOBAL VARS - TIMESYNC ENGINE >       //
let tsServer;
if (window.location.hostname == 'localhost') {
  tsServer = '/timesync';
} else {
  tsServer = window.location.hostname + '/timesync';
}
const TS = timesync.create({
  server: tsServer,
  // server: '/timesync',
  interval: 1000
});
//</editor-fold> > END GLOBAL VARS - TIMESYNC ENGINE END
//<editor-fold>  < GLOBAL VARS - SOCKET IO >             //
let ioConnection;
if (window.location.hostname == 'localhost') {
  ioConnection = io();
} else {
  ioConnection = io.connect(window.location.hostname);
}
const SOCKET = ioConnection;
//</editor-fold> > END GLOBAL VARS - SOCKET IO END
//</editor-fold> >> END GLOBAL VARIABLES END  /////////////////////////////////

//<editor-fold> << START UP >> --------------------------------------------- //
function init() {
  // GET URL ARGS ---------------------------- >
  urlArgsDict = getUrlArgs();
  // DETERMINE PARTS TO RUN ---------------- >
  let partsStrArray = urlArgsDict.parts.split(';');
  partsStrArray.forEach((it, ix) => {
    partsToRun.push(parseInt(it));
  });
  // LOAD SCORE DATA ---------------- >
  let fromURLarg_scoreDataFileName = urlArgsDict.scoreDataFileName || 'default';
  // if no scoreDataFileName is provided thru the URLargs, the defaultScoreData (above) will be used
  // if scoreDataFile name is provided the loadScoreData function is run
  if (fromURLarg_scoreDataFileName != 'default') {
    let scoreDataFilePath = 'savedScoreData/' + fromURLarg_scoreDataFileName;
    loadScoreData(scoreDataFilePath);
    // All loadScoreData() is asynchronous, so all subsequent steps are run
    // from loadScoreData() after scoreDataFile load
  } else{ //using the built in defaultScoreData if no data file is specified
    partsToRun.forEach((numOfPart, partsToRunIX) => {
      let partNum_str = numOfPart.toString();
      let newNO = mkNotationObject(numOfPart, ring0W, ring0H, allScoreData[partNum_str], [partsToRunIX, partsToRun.length] /*[#, ofTotal]*/ );
      notationObjects.push(newNO);
    });
    startPiece();
  }


}
//</editor-fold> >> END START UP END //////////////////////////////////////////

//<editor-fold> << SCORE DATA & EVENTS >> ---------------------------------- //
function retriveFile(path) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
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
  let eventsArray = [];
  let retrivedFileDataObj = await retriveFile(path);
  let retrivedFileData = retrivedFileDataObj.fileData;
  allScoreData = JSON.parse(retrivedFileData);

  partsToRun.forEach((numOfPart, partsToRunIX) => {
    let partNum_str = numOfPart.toString();
    let newNO = mkNotationObject(numOfPart, ring0W, ring0H, allScoreData[partNum_str], [partsToRunIX, partsToRun.length] /*[#, ofTotal]*/ );
    notationObjects.push(newNO);
  });
  startPiece();
  // scoreCtrlPanel = mkCtrlPanel_ctrl('scoreCtrlPanel', 70, 162, 'Ctrl Panel', ['left-top', '0px', '0px', 'none'], 'xs');
}

//</editor-fold> >> END SCORE DATA & EVENTS END  //////////////////////////////

//<editor-fold> << NOTATION OBJECT >> -------------------------------------- //
//<editor-fold>  < NOTATION OBJECT - INIT >              //
function mkNotationObject(ix, w, h, scoreDataObj, placementOrder /*[#, ofTotal]*/ ) {
  // PLACEMENT OF PANEL IN BROWSER WINDOW ---- >
  let offsetX;
  let partOrderNum = placementOrder[0];
  let totalParts = placementOrder[1];
  let txoffset;
  if (placementOrder[1] == 1) { //only one part
    roffsetX = '0px';
  } else {
    txoffset = partOrderNum - (totalParts / 2) + 0.5;
    offsetX = (txoffset * (w + 7)).toString() + 'px';
  }
  // GLOBAL FUNCTION VARIABLES ---------------- >
  let notationObj = {};
  notationObj['ix'] = ix;
  let id = 'cascadingRings' + ix;
  notationObj['id'] = id;
  let thisScoreData = scoreDataObj.partScoreData;
  let numRings = scoreDataObj.numRings;
  // << MEASUREMENTS -------------- >
  let cx = w / 2;
  let cy = h / 2;
  let pad = 13;
  let r1 = (w / 2) - pad;
  let circumferenceOG = 2 * Math.PI * r1;
  let circumference1Sec = circumferenceOG / 60;
  let ringStrokeWidth = 4;
  let dialStrokeWidth = 4;
  let dialLength = 18;
  let halfDL = dialLength / 2;
  let initDeg = -90;
  // let arcStrokeWidth = 9;
  let arcStrokeWidth = 8;
  let halfArcStrokeWidth = arcStrokeWidth / 2;
  // << RING VARIABLES ------------ >
  let rings = [];
  let dials = [];
  let ringDursSecs = [];
  let ringDegsPerSec = [];
  let ringDegsPerFrame = [];
  let ringRadii = [];
  let ringCYs = [];
  let ringArcs = [];
  let ringArcsStartDegs = [];
  let ringArcsStopDegs = [];
  let ringArcsEventGates = [];
  let arcsEachRing_startStopArr = [];
  let ringArcTypes = [];
  thisScoreData.forEach((it, ringix) => {
    let ringDur = it[0];
    let degsPerSec = 360 / ringDur;
    let degsPerFrame = degsPerSec / FRAMERATE;
    let newCircumference = circumference1Sec * ringDur;
    let newRadius = newCircumference / (2 * Math.PI);
    let newCY = cy - (r1 - newRadius) + (ringix * pad);
    ringDursSecs.push(ringDur);
    ringDegsPerSec.push(degsPerSec);
    ringDegsPerFrame.push(degsPerFrame);
    ringRadii.push(newRadius);
    ringCYs.push(newCY);
    arcsEachRing_startStopArr.push(it[1]);
  });
  let lastRingIX = numRings - 1;
  let lastRingRadius = ringRadii[lastRingIX];
  let lastRingCY = ringCYs[lastRingIX];
  // << CANVAS -------------------- >
  let canvasID = id + 'canvas';
  let canvas = mkSVGcanvas(canvasID, w, h);
  notationObj['canvas'] = canvas;
  // << PANEL --------------------- >
  let panelID = id + 'panel';
  let panel = mkPanel(panelID, canvas, w, h, "Player " + ix.toString(), ['center-top', offsetX, '0px', 'none'], 'xs');
  notationObj['panel'] = panel;
  // << ANIMATION VARS ------------ >
  let currRing = 0;
  let cycleCt = 0;
  let initialRingOrderSet = mkPalindromeSet(0, numRings);
  initialRingOrderSet.splice(0, 1); //1st ring is already 0
  let thisFrame_currDeg = initDeg;
  let previousFrame_moduloDeg = initDeg;
  //</editor-fold> END NOTATION OBJECT - INIT END
  //<editor-fold>  < STATIC ELEMENTS >                           //
  //<editor-fold>  < STATIC ELEMENTS - RINGS >           //
  // FOR EACH RING ---------------------------- >
  for (let ringix = 0; ringix < numRings; ringix++) {
    let thisRing_degsPerSec = ringDegsPerSec[ringix];
    let thisRing_cy = ringCYs[ringix];
    let thisRing_radius = ringRadii[ringix];
    let thisRing_arcs = [];
    let thisRing_arcsStartDegs = [];
    let thisRing_arcsStopDegs = [];
    let thisRing_arcsEventGates = [];
    let thisRing_arcTypes = [];
    //</editor-fold> END STATIC ELEMENTS - RINGS END
    //<editor-fold>  < STATIC ELEMENTS - ARCS >          //
    arcsEachRing_startStopArr[ringix].forEach((startStopSecondsArr, startStopArrix) => {
      let arcStartDeg = startStopSecondsArr[0] * thisRing_degsPerSec;
      thisRing_arcsStartDegs.push(arcStartDeg - 90); //describeArc below makes 12'0clock = 0degrees so have to make -90 for everything else
      let arcStopDeg = startStopSecondsArr[1] * thisRing_degsPerSec;
      thisRing_arcsStopDegs.push(arcStopDeg - 90);
      thisRing_arcsEventGates.push(true);
      let arcType = startStopSecondsArr[2];
      thisRing_arcTypes.push(arcType);
      let arcClr = arcType == 0 ? 'magenta' : clr_neonGreen;
      // << << ARCS PROPER -------------------- >
      let arc = document.createElementNS(SVG_NS, "path");
      arc.setAttributeNS(null, "d", describeArc(cx, thisRing_cy, thisRing_radius, arcStartDeg, arcStopDeg)); //describeArc makes 12'0clock =0degrees
      arc.setAttributeNS(null, "stroke-width", arcStrokeWidth);
      arc.setAttributeNS(null, "stroke", arcClr);
      arc.setAttributeNS(null, "fill", "none");
      arc.setAttributeNS(null, "stroke-linecap", 'round');
      if (ringix == 0) {
        if (arcType == 0) {
          arc.setAttributeNS(null, 'filter', 'url(#magenta)');
        } else {
          arc.setAttributeNS(null, 'filter', 'url(#neongreen)');
        }
      }
      canvas.appendChild(arc);
      thisRing_arcs.push(arc);
    });
    ringArcs.push(thisRing_arcs);
    ringArcsStartDegs.push(thisRing_arcsStartDegs);
    ringArcsStopDegs.push(thisRing_arcsStopDegs);
    ringArcsEventGates.push(thisRing_arcsEventGates);
    ringArcTypes.push(thisRing_arcTypes);
    //</editor-fold> END STATIC ELEMENTS - ARCS END
    //<editor-fold>  < STATIC ELEMENTS - DIALS >         //
    let newY1 = thisRing_cy - thisRing_radius;
    let ogx1 = ((thisRing_radius + halfDL) * Math.cos(rads(initDeg))) + cx;
    let ogy1 = ((thisRing_radius + halfDL) * Math.sin(rads(initDeg))) + thisRing_cy;
    let ogx2 = ((thisRing_radius - halfDL) * Math.cos(rads(initDeg))) + cx;
    let ogy2 = ((thisRing_radius - halfDL) * Math.sin(rads(initDeg))) + thisRing_cy;
    let dial = document.createElementNS(SVG_NS, "line");
    dial.setAttributeNS(null, "x1", ogx1);
    dial.setAttributeNS(null, "y1", ogy1);
    dial.setAttributeNS(null, "x2", ogx2);
    dial.setAttributeNS(null, "y2", ogy2);
    dial.setAttributeNS(null, "stroke", "yellow");
    dial.setAttributeNS(null, "stroke-width", dialStrokeWidth);
    dial.setAttributeNS(null, "stroke-linecap", 'round');
    if (ringix == 0) {
      dial.setAttributeNS(null, 'filter', 'url(#neonyellow)');
    }
    let dialID = id + 'dial' + ringix;
    dial.setAttributeNS(null, "id", dialID);
    canvas.appendChild(dial);
    dials.push(dial);
  }
  notationObj['rings'] = rings;
  notationObj['ringArcs'] = ringArcs;
  notationObj['dials'] = dials;
  //</editor-fold> END STATIC ELEMENTS - DIALS END
  //<editor-fold>  < STATIC ELEMENTS - CURVE FOLLOW >    //
  let accelLineStrokeWidth = 3;
  let eventFollowerPadding = 8;
  let efDeg = 50;
  let efTopLeftDeg = 270 - efDeg;
  let efBottomLeftDeg = 90 + efDeg;
  let accelRectX = (lastRingRadius * Math.cos(rads(efTopLeftDeg))) + cx + eventFollowerPadding;
  let accelRectY = (lastRingRadius * Math.sin(rads(efTopLeftDeg))) + lastRingCY + eventFollowerPadding;
  let accelRectBottomY = (lastRingRadius * Math.sin(rads(efBottomLeftDeg))) + lastRingCY - eventFollowerPadding;
  let accelRectH = accelRectBottomY - accelRectY;
  let accelRectW = cx - (eventFollowerPadding / 2) - accelRectX;
  let accelRightX = accelRectX + accelRectW;
  var accelFollowRectID = id + 'accelFollowCanvas';
  // << BACKGROUND RECT ------------------------- >
  var accelBgRect = document.createElementNS(SVG_NS, "rect");
  accelBgRect.setAttributeNS(null, "x", accelRectX.toString());
  accelBgRect.setAttributeNS(null, "y", accelRectY.toString());
  accelBgRect.setAttributeNS(null, "width", accelRectW.toString());
  accelBgRect.setAttributeNS(null, "height", accelRectH.toString());
  accelBgRect.setAttributeNS(null, "fill", "white");
  accelBgRect.setAttributeNS(null, "id", accelFollowRectID.toString());
  canvas.appendChild(accelBgRect);
  notationObj['accelBgRect'] = accelBgRect;
  // << CURVE FOLLOW RECT ----------------------- >
  var accelCfRect = document.createElementNS(SVG_NS, "rect");
  accelCfRect.setAttributeNS(null, "x", accelRectX.toString());
  accelCfRect.setAttributeNS(null, "y", accelRectBottomY.toString());
  accelCfRect.setAttributeNS(null, "width", accelRectW.toString());
  accelCfRect.setAttributeNS(null, "height", '0');
  accelCfRect.setAttributeNS(null, "fill", "rgba(255, 21, 160, 0.5)");
  accelCfRect.setAttributeNS(null, "id", accelFollowRectID.toString());
  canvas.appendChild(accelCfRect);
  notationObj['accelCfRect'] = accelCfRect;
  // << LINEAR CURVE ---------------------------- >
  let accelLine = document.createElementNS(SVG_NS, "line");
  accelLine.setAttributeNS(null, "x1", accelRectX.toString());
  accelLine.setAttributeNS(null, "y1", accelRectBottomY.toString());
  accelLine.setAttributeNS(null, "x2", accelRightX.toString());
  accelLine.setAttributeNS(null, "y2", accelRectY.toString());
  accelLine.setAttributeNS(null, "stroke", "rgba(255, 21, 160, 0.5)");
  accelLine.setAttributeNS(null, "stroke-width", accelLineStrokeWidth.toString());
  accelLine.setAttributeNS(null, "stroke-linecap", 'round');
  let accelLineID = id + 'accelLine';
  accelLine.setAttributeNS(null, "id", accelLineID);
  canvas.appendChild(accelLine);
  notationObj['accelLine'] = accelLine;
  // << CURVE FOLLOWER --------------------------- >
  var accelCrvFollowCirc = document.createElementNS(SVG_NS, "circle");
  accelCrvFollowCirc.setAttributeNS(null, "cx", accelRectX.toString());
  accelCrvFollowCirc.setAttributeNS(null, "cy", accelRectBottomY.toString());
  accelCrvFollowCirc.setAttributeNS(null, "r", "6");
  accelCrvFollowCirc.setAttributeNS(null, "stroke", "none");
  accelCrvFollowCirc.setAttributeNS(null, "fill", "rgba(255, 21, 160, 0.5)");
  accelCrvFollowCirc.setAttributeNS(null, "id", id + "accelCirc");
  canvas.appendChild(accelCrvFollowCirc);
  notationObj['accelCirc'] = accelCrvFollowCirc;
  // DECEL FOLOW --------------------------------- >
  let decelRectX = cx + (eventFollowerPadding / 2);
  let decelRectY = accelRectY;
  let decelRectBottomY = accelRectBottomY;
  let decelRectH = accelRectH;
  let decelRectW = accelRectW;
  var decelFollowRectID = id + 'decelFollowCanvas';
  let decelRightX = decelRectX + decelRectW;
  // << BACKGROUND RECT ------------------------- >
  var decelBgRect = document.createElementNS(SVG_NS, "rect");
  decelBgRect.setAttributeNS(null, "x", decelRectX.toString());
  decelBgRect.setAttributeNS(null, "y", decelRectY.toString());
  decelBgRect.setAttributeNS(null, "width", decelRectW.toString());
  decelBgRect.setAttributeNS(null, "height", decelRectH.toString());
  decelBgRect.setAttributeNS(null, "fill", "white");
  decelBgRect.setAttributeNS(null, "id", decelFollowRectID.toString());
  canvas.appendChild(decelBgRect);
  notationObj['decelBgRect'] = decelBgRect;
  // << CURVE FOLLOW RECT ----------------------- >
  var decelCfRect = document.createElementNS(SVG_NS, "rect");
  decelCfRect.setAttributeNS(null, "x", decelRectX.toString());
  decelCfRect.setAttributeNS(null, "y", decelRectBottomY.toString());
  decelCfRect.setAttributeNS(null, "width", decelRectW.toString());
  decelCfRect.setAttributeNS(null, "height", 0);
  decelCfRect.setAttributeNS(null, "fill", "rgba(57, 255, 20, 0.5)");
  decelCfRect.setAttributeNS(null, "id", decelFollowRectID.toString());
  canvas.appendChild(decelCfRect);
  notationObj['decelCfRect'] = decelCfRect;
  // << LINEAR CURVE ---------------------------- >
  let decelLine = document.createElementNS(SVG_NS, "line");
  decelLine.setAttributeNS(null, "x1", decelRectX.toString());
  decelLine.setAttributeNS(null, "y1", decelRectY.toString());
  decelLine.setAttributeNS(null, "x2", decelRightX.toString());
  decelLine.setAttributeNS(null, "y2", decelRectBottomY.toString());
  decelLine.setAttributeNS(null, "stroke", "rgba(57, 255, 20, 0.5)");
  decelLine.setAttributeNS(null, "stroke-width", accelLineStrokeWidth.toString());
  decelLine.setAttributeNS(null, "stroke-linecap", 'round');
  let decelLineID = id + 'decelLine';
  decelLine.setAttributeNS(null, "id", decelLineID);
  canvas.appendChild(decelLine);
  notationObj['decelLine'] = decelLine;
  // << CURVE FOLLOWER --------------------------- >
  var decelCrvFollowCirc = document.createElementNS(SVG_NS, "circle");
  decelCrvFollowCirc.setAttributeNS(null, "cx", decelRectX.toString());
  decelCrvFollowCirc.setAttributeNS(null, "cy", decelRectY.toString());
  decelCrvFollowCirc.setAttributeNS(null, "r", "6");
  decelCrvFollowCirc.setAttributeNS(null, "stroke", "none");
  decelCrvFollowCirc.setAttributeNS(null, "fill", "rgba(57, 255, 20, 0.5)");
  decelCrvFollowCirc.setAttributeNS(null, "id", id + "decelCirc");
  canvas.appendChild(decelCrvFollowCirc);
  notationObj['decelCirc'] = decelCrvFollowCirc;
  //</editor-fold> END STATIC ELEMENTS - CURVE FOLLOW END
  //<editor-fold>  < STATIC ELEMENTS - NOTATION >    //
  var accelNotationSVG = document.createElementNS(SVG_NS, "image");
  accelNotationSVG.setAttributeNS(XLINK_NS, 'xlink:href', "notation/accel_feathered_84_40.svg");
  let notationY = lastRingCY - 20;
  let notationX = cx - (decelRectW/2) - 42 - (eventFollowerPadding/2);
  accelNotationSVG.setAttributeNS(null, "transform", "translate( " + notationX.toString() + "," + notationY.toString() + ")");
  let notationSVGID = id + 'accelNotationSVG';
  accelNotationSVG.setAttributeNS(null, "id", notationSVGID);
  accelNotationSVG.setAttributeNS(null, 'visibility', 'visible');
  canvas.appendChild(accelNotationSVG);
  let decelNotationSVG = document.createElementNS(SVG_NS, "image");
  decelNotationSVG.setAttributeNS(XLINK_NS, 'xlink:href', "notation/decel_feathered_81_40.svg");
  let dnotationY = lastRingCY - 20;
  let dnotationX = cx + (decelRectW/2) - 40 + (eventFollowerPadding/2);
  decelNotationSVG.setAttributeNS(null, "transform", "translate( " + dnotationX.toString() + "," + dnotationY.toString() + ")");
  let dnotationSVGID = id + 'decelNotationSVG';
  decelNotationSVG.setAttributeNS(null, "id", dnotationSVGID);
  decelNotationSVG.setAttributeNS(null, 'visibility', 'visible');
  canvas.appendChild(decelNotationSVG);
  //</editor-fold> END STATIC ELEMENTS - NOTATION END
  //</editor-fold> END NOTATION OBJECT - STATIC ELEMENTS END
  //<editor-fold>  < NOTATION OBJECT - ANIMATION >         //
  notationObj['animate'] = function(time) {
    thisFrame_currDeg += ringDegsPerFrame[currRing];
    let thisFrame_moduloCurrDeg = ((thisFrame_currDeg + 90) % 360) - 90; //do this hack so you do not modulo negative number
    // MOVE DIAL ------------------------------- >
    let thisFrame_dialX1 = ((ringRadii[currRing] + halfDL) * Math.cos(rads(thisFrame_currDeg))) + cx;
    let thisFrame_dialY1 = ((ringRadii[currRing] + halfDL) * Math.sin(rads(thisFrame_currDeg))) + ringCYs[currRing];
    let thisFrame_dialX2 = ((ringRadii[currRing] - halfDL) * Math.cos(rads(thisFrame_currDeg))) + cx;
    let thisFrame_dialY2 = ((ringRadii[currRing] - halfDL) * Math.sin(rads(thisFrame_currDeg))) + ringCYs[currRing];
    dials[currRing].setAttributeNS(null, "x1", thisFrame_dialX1);
    dials[currRing].setAttributeNS(null, "y1", thisFrame_dialY1);
    dials[currRing].setAttributeNS(null, "x2", thisFrame_dialX2);
    dials[currRing].setAttributeNS(null, "y2", thisFrame_dialY2);
    // TRIGGER AT 12 O'CLOCK ----------------- >
    if (previousFrame_moduloDeg > 0 && thisFrame_moduloCurrDeg < 0) { //At 12 o'clock, thisFrame_moduloCurrDeg transitions from 270 to -90
      ringArcs[currRing].forEach((arc, arcix) => {
        arc.setAttributeNS(null, 'filter', 'none');
      });
      dials[currRing].setAttributeNS(null, 'filter', 'none');
      //Rings will go from first to last and back then in random order
      if (cycleCt < initialRingOrderSet.length) {
        currRing = initialRingOrderSet[cycleCt];
        cycleCt++;
      } else {
        currRing = rrandIntFloor(0, numRings);
      }
      ringArcs[currRing].forEach((arc, arcix) => {
        if (ringArcTypes[currRing][arcix] == 0) {
          arc.setAttributeNS(null, 'filter', 'url(#magenta)');
        } else {
          arc.setAttributeNS(null, 'filter', 'url(#neongreen)');
        }
      });
      dials[currRing].setAttributeNS(null, 'filter', 'url(#neonyellow)');
    }
    // TRIGGER @ ARC START ------------------- >
    // << FOR EACH ARC IN RING --------------- >
    ringArcsStartDegs[currRing].forEach((arcStartDeg, arcIX) => {
      if (arcStartDeg > previousFrame_moduloDeg && arcStartDeg <= thisFrame_moduloCurrDeg) {
        if (ringArcsEventGates[currRing][arcIX]) {
          ringArcsEventGates[currRing][arcIX] = false;
        }
      }
      // << MOVE CURVE FOLLOWER -------------- >
      if (!ringArcsEventGates[currRing][arcIX]) {
        let arcStopDeg = ringArcsStopDegs[currRing][arcIX];
        let arcPosNorm1 = norm(thisFrame_moduloCurrDeg, arcStartDeg, arcStopDeg);
        let arcPosNorm = clamp(arcPosNorm1, 0.0, 1.0);
        switch (ringArcTypes[currRing][arcIX]) {
          case 0: //accel
            let accelCrvFollow_newCx = scale(arcPosNorm, 0.0, 1.0, accelRectX, accelRightX);
            let accelCrvFollow_newCy = scale(arcPosNorm, 0.0, 1.0, accelRectBottomY, accelRectY);
            accelCrvFollowCirc.setAttributeNS(null, "cx", accelCrvFollow_newCx.toString());
            accelCrvFollowCirc.setAttributeNS(null, "cy", accelCrvFollow_newCy.toString());
            let accelRect_newY = scale(arcPosNorm, 0.0, 1.0, accelRectBottomY, accelRectY);
            let accelRect_newH = accelRectBottomY - accelRect_newY;
            accelCfRect.setAttributeNS(null, "y", accelRect_newY.toString());
            accelCfRect.setAttributeNS(null, "height", accelRect_newH.toString());
            break;
          case 1: //decel
            let decelCrvFollow_newCx = scale(arcPosNorm, 0.0, 1.0, decelRectX, decelRightX);
            let decelCrvFollow_newCy = scale(arcPosNorm, 0.0, 1.0, decelRectY, decelRectBottomY);
            decelCrvFollowCirc.setAttributeNS(null, "cx", decelCrvFollow_newCx.toString());
            decelCrvFollowCirc.setAttributeNS(null, "cy", decelCrvFollow_newCy.toString());
            let decelRect_newY = scale(arcPosNorm, 0.0, 1.0, decelRectY, decelRectBottomY);
            let decelRect_newH = decelRectBottomY - decelRect_newY;
            decelCfRect.setAttributeNS(null, "y", decelRect_newY.toString());
            decelCfRect.setAttributeNS(null, "height", decelRect_newH.toString());
            break;
        }
      }
    });
    // TRIGGER @ ARC STOP -------------------- >
    ringArcsStopDegs[currRing].forEach((arcStopDeg, arcIX) => {
      if (arcStopDeg > previousFrame_moduloDeg && arcStopDeg <= thisFrame_moduloCurrDeg) {
        if (!ringArcsEventGates[currRing][arcIX]) {
          ringArcsEventGates[currRing][arcIX] = true;
          switch (ringArcTypes[currRing][arcIX]) {
            case 0: //accel
              accelCrvFollowCirc.setAttributeNS(null, "cx", accelRectX.toString());
              accelCrvFollowCirc.setAttributeNS(null, "cy", accelRectBottomY.toString());
              accelCfRect.setAttributeNS(null, "y", accelRectBottomY.toString());
              accelCfRect.setAttributeNS(null, "height", '0');
              break;
            case 1: //accel
              decelCrvFollowCirc.setAttributeNS(null, "cx", decelRectX.toString());
              decelCrvFollowCirc.setAttributeNS(null, "cy", decelRectY.toString());
              decelCfRect.setAttributeNS(null, "y", decelRectY.toString());
              decelCfRect.setAttributeNS(null, "height", '0');
              break;
          }
        }
      }
    });
    //store deg as previous for next frame
    previousFrame_moduloDeg = thisFrame_moduloCurrDeg;
  }
  //</editor-fold> END NOTATION OBJECT - ANIMATION END
  return notationObj;
}
//</editor-fold> >> END NOTATION OBJECT  //////////////////////////////////////

//<editor-fold> << CONTROL PANEL >> ---------------------------------------- //
function mkCtrlPanel_ctrl(id, w, h, title, posArr, headerSize) {
  let panelObj = mkCtrlPanel(id, w, h, title, posArr, headerSize);
  let panel = panelObj.panel;
  let canvas = panelObj.canvas;
  let btnW = w - 15;
  let btnH = 36;
  //<editor-fold>  < CONTROL PANEL - START BUTTON >        //
  let startBtnFunc = function() {
    if (startBtn_isActive) {
      let tsNow_Date = new Date(TS.now());
      let absStartTime = tsNow_Date.getTime();
      SOCKET.emit('sf003_startpiece', {});
    }
  }
  let startBtn = mkButton(canvas, id + 'startbtn', btnW, btnH, 0, 0, 'Start', 12, startBtnFunc);
  panelObj['startBtn'] = startBtn;
  // SOCKET IO - START PIECE ------ >
  SOCKET.on('sf003_startpiecebroadcast', function(data) {
    if (piece_canStart) {
      piece_canStart = false;
      startBtn_isActive = false;
      stopBtn_isActive = true;
      pauseBtn_isActive = true;
      animation_isGo = true;
      scoreCtrlPanel.stopBtn.className = 'btn btn-1';
      scoreCtrlPanel.startBtn.className = 'btn btn-1_inactive';
      scoreCtrlPanel.pauseBtn.className = 'btn btn-1';
      scoreCtrlPanel.panel.smallify();
      startPiece();
    }
  });
  //</editor-fold> END START BUTTON END
  //<editor-fold>  < CONTROL PANEL - PAUSE BUTTON >        //
  let pauseBtnFunc = function() {
    if (pauseBtn_isActive) {
      pauseState = (pauseState + 1) % 2;
      let tsNow_Date = new Date(TS.now());
      let pauseTime = tsNow_Date.getTime()
      if (pauseState == 1) { //Paused
        SOCKET.emit('sf003_pause', {
          pauseState: pauseState,
          pauseTime: pauseTime
        });
      } else if (pauseState == 0) { //unpaused
        let globalPauseTime = pauseTime - pausedTime;
        SOCKET.emit('sf003_pause', {
          pauseState: pauseState,
          pauseTime: globalPauseTime
        });
      }
    }
  }
  let pauseBtn = mkButton(canvas, id + 'pausebtn', btnW, btnH, 51, 0, 'Pause', 12, pauseBtnFunc);
  panelObj['pauseBtn'] = pauseBtn;
  pauseBtn.className = 'btn btn-1_inactive';
  // SOCKET IO - PAUSE BROADCAST -- >
  SOCKET.on('sf003_pauseBroadcast', function(data) {
    pauseState = data.pauseState;
    if (pauseState == 0) { //unpaused
      pieceTimeAdjustment = data.pauseTime + pieceTimeAdjustment;
      scoreCtrlPanel.pauseBtn.innerText = 'Pause';
      scoreCtrlPanel.pauseBtn.className = 'btn btn-1';
      scoreCtrlPanel.panel.smallify();
      animation_isGo = true;
      requestAnimationFrame(animationEngine);
    } else if (pauseState == 1) { //paused
      pausedTime = data.pauseTime
      animation_isGo = false;
      scoreCtrlPanel.pauseBtn.innerText = 'Resume';
      scoreCtrlPanel.pauseBtn.className = 'btn btn-2';
    }
  });
  //</editor-fold> END PAUSE BUTTON END
  //<editor-fold>  < CONTROL PANEL - STOP BUTTON >         //
  let stopBtnFunc = function() {
    if (stopBtn_isActive) {
      SOCKET.emit('sf003_stop', {});
    }
  }
  let stopBtn = mkButton(canvas, id + 'stopbtn', btnW, btnH, 51 + btnH + 16, 0, 'stop', 12, stopBtnFunc);
  panelObj['stopBtn'] = stopBtn;
  // SOCKET IO - STOP ------------- >
  stopBtn.className = 'btn btn-1_inactive';
  SOCKET.on('sf003_stopBroadcast', function(data) {
    location.reload();
  });
  //</editor-fold> END STOP BUTTON END
  return panelObj;
}
//</editor-fold> >> CONTROL PANEL  ////////////////////////////////////////////

//<editor-fold> << ANIMATION ENGINE >> ------------------------------------- //
//<editor-fold>  < ANIMATION ENGINE - ENGINE >           //
function animationEngine(timestamp) { //timestamp not used timesync instead
  let tsNow_Date = new Date(TS.now());
  tsNow_pieceEpochTime = tsNow_Date.getTime() - pieceTimeAdjustment;
  calcDisplayClock(tsNow_pieceEpochTime);
  delta += tsNow_pieceEpochTime - lastFrame_pieceEpochTimeMs;
  lastFrame_pieceEpochTimeMs = tsNow_pieceEpochTime;
  while (delta >= MSPERFRAME) {
    update(MSPERFRAME, tsNow_pieceEpochTime);
    draw();
    delta -= MSPERFRAME;
  }
  if (animation_isGo) requestAnimationFrame(animationEngine);
}
//</editor-fold> END ANIMATION ENGINE - ENGINE END
//<editor-fold>     < ANIMATION ENGINE - UPDATE >           //
function update(aMSPERFRAME, currTimeMS) {
  frameCount++;
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
let displayClock_div = mkCanvasDiv('displayClock_div', 65, 20, 'yellow');
let displayClock_panel = mkClockPanel(displayClock_div);

function calcDisplayClock(pieceEpochTime) {
  let pieceTimeMS = pieceEpochTime - pieceStartTime_epochTime;
  displayClock_TimeMS = pieceTimeMS % 1000;
  displayClock_TimeSec = Math.floor(pieceTimeMS / 1000) % 60;
  displayClock_TimeMin = Math.floor(pieceTimeMS / 60000) % 60;
  displayClock_TimeHrs = Math.floor(pieceTimeMS / 3600000);
  displayClock_div.innerHTML = pad(displayClock_TimeHrs, 2) + ":" + pad(displayClock_TimeMin, 2) + ":" + pad(displayClock_TimeSec, 2);
}
//</editor-fold> END UTILITIES - CLOCK END
//<editor-fold>   < UTILITIES - COLORS >                 //
var clr_seaGreen = "rgb(0, 255, 108)";
var clr_neonMagenta = "rgb(255, 21, 160)";
var clr_neonBlue = "rgb(6, 140, 225)";
var clr_electricBlue = "rgb(125, 249, 225)";
var clr_forest = "rgb(11, 102, 35)";
var clr_jade = "rgb(0, 168, 107)";
var clr_neonGreen = "rgb(57, 255, 20)";
var clr_limegreen = "rgb(153, 255, 0)";
var clr_yellow = "rgb(255, 255, 0)";
var clr_orange = "rgb(255, 128, 0)";
var clr_red = "rgb(255, 0, 0)";
var clr_purple = "rgb(255, 0, 255)";
var clr_neonRed = "rgb(255, 37, 2)";
var clr_safetyOrange = "rgb(255, 103, 0)";
var clr_green = "rgb(0, 255, 0)";
var clr_deepPink = "#FF1493";
var clr_turquoise = "#30D5C8";
//</editor-fold> END UTILITIES - COLORS END
//</editor-fold>  > END UTILITIES  ////////////////////////////////////////////

//SCORE DATA GENERATOR LIVES IN private/privateServerFiles/pieces/sf003/sf003_manageScoreData.js








//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

//// SAMPLE SECTIONERS
//<editor-fold> << ANIMATION ENGINE >> ------------------------------------- //
//</editor-fold> >> END ANIMATION ENGINE  /////////////////////////////////////
//<editor-fold>  < ANIMATION ENGINE - UPDATE >           //
//</editor-fold> END ANIMATION ENGINE - UPDATE END
// SUBSECTION L1 --------------------------- >
// << SUBSECTION L2 ------------------------ >
// << << SUBSECTION L3 --------------------- >
