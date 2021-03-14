//<editor-fold> << GLOBAL VARIABLES >> ------------------------------------- //
//<editor-fold>  < GLOBAL VARS - 3JS SCENE >             //
var CAM_Z = 45;
var CAM_Y = -150;
var CAM_ROTATION_X = rads(0);
var RUNWAY_ROTATION_X = -25
var TRACK_DIAMETER = 6;
var TRACK_Y_OFFSET = 3;
var SCENE_W = 200;
var SCENE_H = 300;
var CRV_H = 170;
var RUNWAYLENGTH = 380;
var RUNWAYHALF = RUNWAYLENGTH / 2;
var RUNWAYSTART = RUNWAYLENGTH / 2;
var t_numFrets = 11;
//</editor-fold> END GLOBAL VARS - 3JS SCENE END
//<editor-fold>  < GLOBAL VARS - TIMING >                //
var FRAMERATE = 60.0;
var MSPERFRAME = 1000.0 / FRAMERATE;
var RUNWAY_PXPERSEC = 40.0;
var RUNWAY_PXPERFRAME = RUNWAY_PXPERSEC / FRAMERATE;
var RUNWAY_GOFRETPOS_Y = -RUNWAYLENGTH / 2;
var RUNWAYLENGTH_FRAMES = RUNWAYLENGTH / RUNWAY_PXPERFRAME;
var preStartTime = 10;
var timeAdjustment = preStartTime;
var clockAdj = 0;
var epochStartTime;
var framect = 0;
var delta = 0.0;
var lastFrameTimeMs = 0.0;
var clockTimeMS, clockTimeSec, clockTimeMin, clockTimeHrs;
var pauseState = 0;
var pausedTime = 0;
var epochStartTime;
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
//<editor-fold>  < GLOBAL VARS - SCORE DATA & EVENTS >   //
var scoreDataFileName = 'soundflow2_2021_2_19_16_3.txt';
var partsToRun = [];
var allScoreData = [];
var partsToRunData = [];
var partsToRunEvents;
var notationObjects = [];
//</editor-fold> END SCORE DATA END
//<editor-fold>  < GLOBAL VARS - MISC >                  //
var SVG_NS = "http://www.w3.org/2000/svg";
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
6) loadScoreData() -> generateScoreEvents() events stored in partsToRunEvents
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
  var playersArr = retrivedFileData.split("!");
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
  });
  // EXTRACT DATA FOR PARTS TO RUN ---------- >
  partsToRun.forEach((it, ix) => {
    var tar = [];
    eventsArray.forEach((it2, ix2) => {
      if (it == ix2) {
        var tar2 = deepCopy(it2);
        tar.push(it);
        tar.push(tar2);
        partsToRunData.push(tar);
      }
    });
  });
  partsToRunEvents = generateScoreEvents(partsToRunData);
  partsToRun.forEach((it, ix) => {
    var newNO = mkNotationObject_runwayCurveFollow(it, SCENE_W, SCENE_H, RUNWAYLENGTH, [ix, partsToRun.length]);
    notationObjects.push(newNO);
  });
  scoreCtrlPanel = mkCtrlPanel_ctrl('scoreCtrlPanel', 70, 186, 'Ctrl Panel', ['left-top', '0px', '0px', 'none'], 'xs');

  return eventsArray;
}

function generateScoreEvents(scoreData) {
  //scoreData =[ playerNum, scoreDataArr:[goTime,Dur] ]
  var allEventsMatrix = [];
  for (var i = 0; i < scoreData.length; i++) {
    var tempEvents = mkEvents(scoreData[i][1]);
    allEventsMatrix.push(tempEvents);
  }
  return allEventsMatrix;
}

function mkEvents(eventsData) {
  var tEventMatrix = [];
  var teventMeshIx = 0;
  for (var i = 0; i < eventsData.length; i++) {
    var tEventSet = [];
    var tTimeGopxGoFrm = [];
    var tTime = eventsData[i][0];
    var tDur = eventsData[i][1];
    tTime = tTime + preStartTime;
    var tEventLength = tDur * RUNWAY_PXPERSEC;
    var tNumPxTilGo = tTime * RUNWAY_PXPERSEC;
    var tiGoPx = RUNWAY_GOFRETPOS_Y + tNumPxTilGo;
    var tGoFrm = Math.round(tNumPxTilGo / RUNWAY_PXPERFRAME);
    var tempMatl = new THREE.MeshLambertMaterial({
      color: clr_neonMagenta,
    });
    var teventdurframes = Math.round(tDur * FRAMERATE);
    var tOffFrm = tGoFrm + teventdurframes;
    var tEventGeom = new THREE.CylinderGeometry(TRACK_DIAMETER + 3, TRACK_DIAMETER + 3, tEventLength, 32);
    var tEventMesh = new THREE.Mesh(tEventGeom, tempMatl);
    tEventMesh.position.y = tiGoPx + (tEventLength / 2.0);
    tEventMesh.position.z = -(RUNWAYLENGTH / 2);
    tEventMesh.position.x = 0;
    tEventMesh.name = "runwayEvent" + teventMeshIx;
    teventMeshIx++;
    var tnewCresEvent = [true, tEventMesh, tGoFrm, tTime, tNumPxTilGo, tiGoPx, tOffFrm, tEventLength];
    tEventMatrix.push(tnewCresEvent);
  }
  return tEventMatrix;
}
//</editor-fold> >> END SCORE DATA & EVENTS END  //////////////////////////////

// <editor-fold>  <<<< NOTATION OBJECTS >>>> ------------------------------- //
// <editor-fold>    <<<< NOTATION OBJECT - INIT >>>> ---------------- //
function mkNotationObject_runwayCurveFollow(ix, w, h, len, placementOrder /*[#, ofTotal]*/ ) {
  var notationObj = {};
  notationObj['ix'] = ix;
  // PLACEMENT OF PANEL IN BROWSER WINDOW ----------- >
  var roffsetX, roffsetY, rautopos;
  var coffsetX, coffsetY, cautopos;
  var partOrderNum = placementOrder[0];
  var totalParts = placementOrder[1];
  var txoffset
  var yoffset = 0;
  if (placementOrder[1] == 1) { //only one part
    roffsetX = '0px';
    roffsetY = '0px';
    rautopos = 'none';
    coffsetX = '0px';
    coffsetY = h.toString();
    cautopos = 'down';
  } else {
    if (totalParts < 7) { //6 parts or less
      txoffset = partOrderNum - (totalParts / 2) + 0.5;
    } else { //rows of 6
      if (partOrderNum < 6) { //top row
        yoffset = 0;
        txoffset = partOrderNum - (6 / 2) + 0.5;
      } else { //bottom row
        txoffset = partOrderNum - 6 - ((totalParts - 6) / 2) + 0.5;
        yoffset = SCENE_H + CRV_H + 20;
      }
    }
    roffsetX = (txoffset * (w + 7)).toString() + 'px';
    roffsetY = yoffset.toString() + 'px';
    rautopos = 'none';
    coffsetX = (txoffset * (w + 7)).toString() + 'px';
    coffsetY = (h + yoffset).toString() + 'px';
    cautopos = 'none';
  }
  // Curve Follower
  var CRV_W = w - 4;
  var crvCoords = plot(function(x) {
    return Math.pow(x, 2.4);
  }, [0, 1, 0, 1], CRV_W, CRV_H);
  var crvFollowData = [];
  // Generate ID
  var id = 'runwayCurveFollow' + ix;
  notationObj['id'] = id;
  // Make Canvases ------------- >
  //// Runway ////
  var runwayCanvasID = id + 'runwayCanvas';
  var runwayCanvas = mkCanvasDiv(runwayCanvasID, w, h, '#000000');
  notationObj['runwayCanvas'] = runwayCanvas;
  //// Curve Follower ////
  var crvFollowCanvasID = id + 'crvFollowCanvas';
  var crvFollowCanvas = mkSVGcanvas(crvFollowCanvasID, CRV_W, CRV_H);
  notationObj['crvFollowCanvas'] = crvFollowCanvas;
  // Make jsPanels ----------------- >
  //// Runway ////
  var runwayPanelID = id + 'runwayPanel';
  var runwayPanel = mkPanel(runwayPanelID, runwayCanvas, w, h, "Player " + ix.toString() + " - Runway", ['center-top', roffsetX, roffsetY, rautopos], 'xs');
  notationObj['runwayPanel'] = runwayPanel;
  //// Curve Follower ////
  var crvFollowPanelID = id + 'crvFollowPanel';
  var crvFollowPanel = mkPanel(crvFollowPanelID, crvFollowCanvas, CRV_W, CRV_H, "Player " + ix.toString() + " - Curve", ['center-top', coffsetX, coffsetY, cautopos], 'xs');
  notationObj['crvFollowPanel'] = crvFollowPanel;
  // </editor-fold>       END NOTATION OBJECT - INIT /////////
  // <editor-fold>  <<<< NOTATION OBJECT - 3JS >>>> ----------------- //
  // CAMERA ----------------- >
  var camera = new THREE.PerspectiveCamera(75, w / h, 1, 3000);
  camera.position.set(0, CAM_Y, CAM_Z);
  camera.rotation.x = rads(CAM_ROTATION_X);
  notationObj['camera'] = camera;
  // SCENE ----------------- >
  var scene = new THREE.Scene();
  notationObj['scene'] = scene;
  // LIGHTS ----------------- >
  var lights = [];
  var sun = new THREE.DirectionalLight(0xFFFFFF, 1.2);
  sun.position.set(100, 600, 700);
  scene.add(sun);
  lights.push(sun);
  var sun2 = new THREE.DirectionalLight(0x40A040, 0.6);
  sun2.position.set(-100, 350, 775);
  scene.add(sun2);
  lights.push(sun2);
  notationObj['lights'] = lights;
  // RENDERER ----------------- >
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(w, h);
  runwayCanvas.appendChild(renderer.domElement);
  notationObj['renderer'] = renderer;
  // </editor-fold>       END NOTATION OBJECT - INIT /////////
  // <editor-fold>  <<<< NOTATION OBJECT - STATIC ELEMENTS >>>> ----- //
  // RUNWAY ----------------------------------------------- //
  //// Runway -------------------------- >
  var conveyor = new THREE.Group();
  var t_runwayW = w * 0.67;
  var runwayMatl =
    new THREE.MeshLambertMaterial({
      color: 0x0040C0
    });
  var runwayGeom = new THREE.PlaneGeometry(
    t_runwayW,
    len,
  );
  var runway = new THREE.Mesh(runwayGeom, runwayMatl);
  runway.position.z = -len / 2;
  conveyor.add(runway);
  notationObj['runway'] = runway;
  //// Track -------------------------- >
  var trgeom = new THREE.CylinderGeometry(TRACK_DIAMETER, TRACK_DIAMETER, len, 32);
  var trmatl = new THREE.MeshLambertMaterial({
    color: 0x708090
  });
  var tTr = new THREE.Mesh(trgeom, trmatl);
  tTr.position.z = -(len / 2);
  tTr.position.y = (-TRACK_DIAMETER / 2) + TRACK_Y_OFFSET;
  tTr.position.x = 0;
  conveyor.add(tTr);
  notationObj['track'] = tTr;
  //// Frets --------------------------- >
  var fretGeom = new THREE.CylinderGeometry(2, 2, t_runwayW, 32);
  var fretMatl = new THREE.MeshLambertMaterial({
    color: clr_seaGreen
  });
  var t_fretGap = RUNWAYLENGTH / t_numFrets;
  for (var i = 0; i < t_numFrets; i++) {
    var t_fret = new THREE.Mesh(fretGeom, fretMatl);
    t_fret.rotation.z = rads(-90);
    t_fret.position.z = -(len / 2);
    t_fret.position.y = RUNWAYSTART - (t_fretGap * (i + 1));
    conveyor.add(t_fret);
  }
  //// Go Fret ------------------------ >
  var goFretGeom = new THREE.CylinderGeometry(4, 4, t_runwayW, 32);
  var goFretMatl = new THREE.MeshLambertMaterial({
    color: clr_neonMagenta
  });
  var goFret = new THREE.Mesh(goFretGeom, goFretMatl);
  goFret.rotation.z = rads(-90);
  goFret.position.z = -(len / 2);
  goFret.position.y = -RUNWAYLENGTH / 2;
  conveyor.add(goFret);
  // CURVE FOLLOWER --------------------------------------------- //
  //// Curve Follow Rect -------------- >
  var tcrvFollowRect = document.createElementNS(SVG_NS, "rect");
  tcrvFollowRect.setAttributeNS(null, "x", "0");
  tcrvFollowRect.setAttributeNS(null, "y", CRV_W.toString());
  tcrvFollowRect.setAttributeNS(null, "width", CRV_W);
  tcrvFollowRect.setAttributeNS(null, "height", 0);
  tcrvFollowRect.setAttributeNS(null, "fill", "rgba(255, 21, 160, 0.5)");
  tcrvFollowRect.setAttributeNS(null, "id", id + "crvFollowRect");
  // tcrvFollowRect.setAttributeNS(null, "transform", "translate( 0, -2)");
  crvFollowCanvas.appendChild(tcrvFollowRect);
  notationObj['crvFollowRect'] = tcrvFollowRect;
  //// Curve -------------------------- >
  var tSvgCrv = document.createElementNS(SVG_NS, "path");
  var tpathstr = "";
  for (var i = 0; i < crvCoords.length; i++) {
    if (i == 0) {
      tpathstr = tpathstr + "M" + crvCoords[i].x.toString() + " " + crvCoords[i].y.toString() + " ";
    } else {
      tpathstr = tpathstr + "L" + crvCoords[i].x.toString() + " " + crvCoords[i].y.toString() + " ";
    }
  }
  tSvgCrv.setAttributeNS(null, "d", tpathstr);
  tSvgCrv.setAttributeNS(null, "stroke", "rgba(255, 21, 160, 0.5)");
  tSvgCrv.setAttributeNS(null, "stroke-width", "4");
  tSvgCrv.setAttributeNS(null, "fill", "none");
  tSvgCrv.setAttributeNS(null, "id", id + "crv");
  // tSvgCrv.setAttributeNS(null, "transform", "translate( 0, -2)");
  crvFollowCanvas.appendChild(tSvgCrv);
  notationObj['crv'] = tSvgCrv;
  //// Curve Follower ---------------- >
  var tSvgCirc = document.createElementNS(SVG_NS, "circle");
  tSvgCirc.setAttributeNS(null, "cx", crvCoords[0].x.toString());
  tSvgCirc.setAttributeNS(null, "cy", crvCoords[0].y.toString());
  tSvgCirc.setAttributeNS(null, "r", "10");
  tSvgCirc.setAttributeNS(null, "stroke", "none");
  tSvgCirc.setAttributeNS(null, "fill", "rgba(255, 21, 160, 0.5)");
  tSvgCirc.setAttributeNS(null, "id", id + "crvCirc");
  // tSvgCirc.setAttributeNS(null, "transform", "translate( 0, -3)");
  crvFollowCanvas.appendChild(tSvgCirc);
  notationObj['crvCirc'] = tSvgCirc;
  //Make Follower Data for maping in animation [gate, currentCoord]
  var tcrvFset = [];
  tcrvFset.push(false);
  tcrvFset.push(0.0);
  crvFollowData.push(tcrvFset);
  // </editor-fold>     END NOTATION OBJECT - STATIC ELEMENTS //
  // <editor-fold>  <<<< NOTATION OBJECT - 3JS RENDER ACTIONS >>>> -- //
  // ROTATE GROUP ----------------- >
  conveyor.rotation.x = rads(RUNWAY_ROTATION_X);
  scene.add(conveyor);
  notationObj['conveyor'] = conveyor;
  // RENDER ----------------- >
  renderer.render(scene, camera);
  // </editor-fold>    END NOTATION OBJECT - 3JS RENDER ACTIONS >> -- //
  // <editor-fold>  <<<< NOTATION OBJECT - ANIMATE >>>> ------------- //
  notationObj['animate'] = function(eventMatrix) {
    //This loop runs through all events
    //All events need to be advanced position.y
    for (var i = 0; i < eventMatrix.length; i++) {
      var t_mesh = eventMatrix[i][1];
      var t_eventLen = eventMatrix[i][7];
      var t_mesh_tail = t_mesh.position.y + (t_eventLen / 2);
      //advance event if it is not past gofret
      if (t_mesh_tail > RUNWAY_GOFRETPOS_Y) {
        t_mesh.position.y -= RUNWAY_PXPERFRAME;
      }
    }
    //This loop runs through only events on scene
    for (var i = 0; i < eventMatrix.length; i++) {
      var t_mesh = eventMatrix[i][1];
      var t_eventLen = eventMatrix[i][7];
      var t_mesh_tail = t_mesh.position.y + (t_eventLen / 2);
      var t_goFrame = Math.round(eventMatrix[i][2]);
      var onSceneFrame = t_goFrame - RUNWAYLENGTH_FRAMES;
      // So you don't run through the entire events array, only the ones on scene
      if (framect <= onSceneFrame) {
        break;
      }
      var t_renderGate = eventMatrix[i][0];
      // - (t_eventLen/2) is because y=0 is the center of the object
      var t_mesh_head = t_mesh.position.y - (t_eventLen / 2);
      var t_endFrame = Math.round(eventMatrix[i][6]);
      //add the event to the scene if it is on the runway
      if (t_mesh_head < RUNWAYHALF && t_mesh_tail > RUNWAY_GOFRETPOS_Y) {
        if (t_renderGate) {
          eventMatrix[i][0] = false;
          conveyor.add(t_mesh);
          scene.add(conveyor);
        }
      }
      //Event Reaches Goline
      if (framect > t_goFrame && framect <= t_endFrame) {
        var crvFollowDataNorm = scale(framect, t_goFrame, t_endFrame, 0.0, 1.0);
        var tcoordsix = Math.floor(scale(crvFollowDataNorm, 0.0, 1.0, 0, crvCoords.length));
        tcoordsix = constrain(tcoordsix, 0, (crvCoords.length - 1));
        //circ
        tSvgCirc.setAttributeNS(null, "cx", crvCoords[tcoordsix].x.toString());
        tSvgCirc.setAttributeNS(null, "cy", crvCoords[tcoordsix].y.toString());
        //rect
        var temph = CRV_H - crvCoords[tcoordsix].y;
        tcrvFollowRect.setAttributeNS(null, "y", crvCoords[tcoordsix].y.toString());
        tcrvFollowRect.setAttributeNS(null, "height", temph.toString());
      }
      //end of event remove
      if (framect == t_endFrame) {
        //Reset Curve Follower
        tSvgCirc.setAttributeNS(null, "cx", crvCoords[0].x.toString());
        tSvgCirc.setAttributeNS(null, "cy", crvCoords[0].y.toString());
        tcrvFollowRect.setAttributeNS(null, "y", CRV_W.toString());
        tcrvFollowRect.setAttributeNS(null, "height", 0);
        //Remove runway event
        var obj2Rmv = scene.getObjectByName(t_mesh.name);
        conveyor.remove(obj2Rmv);
        //Remove Event from Array
        eventMatrix.splice(0, 1);
      }
    }
  }
  // </editor-fold>    END NOTATION OBJECT - ANIMATE >>>> ----------- //
  return notationObj;
}
// </editor-fold> <<<< END NOTATION OBJECT >>>> ---------------------------- //

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
      socket.emit('sf002_startpiece', {});
    }
  }
  var startBtn = mkButton(canvas, id + 'startbtn', btnW, btnH, 0, 0, 'Start', 12, startBtnFunc);
  panelObj['startBtn'] = startBtn;
  // SOCKET IO - START PIECE ------ >
  socket.on('sf002_startpiecebroadcast', function(data) {
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
      scoreCtrlPanel.timeField.disabled = 'true';
      startPiece();
    }
  });
  //</editor-fold> END START BUTTON END
  //<editor-fold>  < CONTROL PANEL - SET START TIME >      //
  var timeInputClickFunc = function() {
    timeField.focus();
    timeField.select();
  }
  var timeInputKeyupFunc = function(e) {
    if (e.keyCode === 13) {
      if (activateStartBtn) {
        var newStartTime = parseFloat(timeField.value);
        socket.emit('sf002_startTime', {
          newStartTime: newStartTime,
        });
      }
    }
  }
  var timeFieldID = id + 'timeinput';
  var timeField = mkInputField(canvas, timeFieldID, btnW - 14, 10, 65, 10, 'black', 14, timeInputClickFunc, timeInputKeyupFunc);
  panelObj['timeField'] = timeField;
  var timeFieldLbl = mkLabel2(canvas, id + 'timeFieldLbl', timeFieldID, btnW, 13, 18, 10, 'Time Sec:', 11, 'white');
  // SOCKET IO - SET START TIME --- >
  socket.on('sf002_startTimeBroadcast', function(data) {
    clockAdj = data.newStartTime;
    scoreCtrlPanel.timeField.disabled = 'true';
    var eventsToRmv = [];
    var frameAdj = Math.round(clockAdj * FRAMERATE);
    framect = frameAdj;
    //Clear events that have already passed
    notationObjects.forEach(function(it, ix) {
      var tar1 = [];
      tar1.push(ix);
      var tar2 = [];
      var t_eventMatrix = partsToRunEvents[ix];
      for (var i = 0; i < t_eventMatrix.length; i++) {
        var t_mesh = t_eventMatrix[i][1];
        var t_time = t_eventMatrix[i][3];
        //if they had already passed remove the meshes
        if (t_time > clockAdj) {
          //need to adjust the remaining event meshes pos.y
          //because animator uses this to advance events
          t_mesh.position.y = t_mesh.position.y - (RUNWAY_PXPERFRAME * frameAdj);
        } else {
          var obj2Rmv = it.scene.getObjectByName(t_mesh.name);
          it.conveyor.remove(obj2Rmv);
          //Collect indexes of events to remove and remove later
          tar2.push(i);
        }
      }
      tar1.push(tar2);
      eventsToRmv.push(tar1);
    });
    //Remove all pased events from eventsMatrix array
    eventsToRmv.forEach((it, ix) => {
      var i1 = it[0];
      var itemsToRmv = it[1];
      for (var i = itemsToRmv.length - 1; i >= 0; i--) {
        partsToRunEvents[i1].splice(itemsToRmv[i], 1);
      }
    });
  });
  //</editor-fold> END SET START TIME END
  //<editor-fold>  < CONTROL PANEL - PAUSE BUTTON >        //
  var pauseBtnFunc = function() {
    if (activatePauseBtn) {
      pauseState = (pauseState + 1) % 2;
      var t_now = new Date(ts.now());
      var pauseTime = t_now.getTime()
      if (pauseState == 1) { //Paused
        socket.emit('sf002_pause', {
          pauseState: pauseState,
          pauseTime: pauseTime
        });
      } else if (pauseState == 0) { //unpaused
        var globalPauseTime = pauseTime - pausedTime;
        socket.emit('sf002_pause', {
          pauseState: pauseState,
          pauseTime: globalPauseTime
        });
      }
    }
  }
  var pauseBtn = mkButton(canvas, id + 'pausebtn', btnW, btnH, 81, 0, 'Pause', 12, pauseBtnFunc);
  panelObj['pauseBtn'] = pauseBtn;
  pauseBtn.className = 'btn btn-1_inactive';
  // SOCKET IO - PAUSE BROADCAST -- >
  socket.on('sf002_pauseBroadcast', function(data) {
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
      socket.emit('sf002_stop', {});
    }
  }
  var stopBtn = mkButton(canvas, id + 'stopbtn', btnW, btnH, 81 + btnH + 10, 0, 'stop', 12, stopBtnFunc);
  panelObj['stopBtn'] = stopBtn;
  // SOCKET IO - STOP ------------- >
  stopBtn.className = 'btn btn-1_inactive';
  socket.on('sf002_stopBroadcast', function(data) {
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
    it.animate(partsToRunEvents[ix]);
  });
}
//</editor-fold> END ANIMATION ENGINE - UPDATE END
//<editor-fold>     < ANIMATION ENGINE - DRAW >             //
function draw() {
  // RENDER ----------------------- >
  notationObjects.forEach(function(it, ix) {
    it.renderer.render(it.scene, it.camera);
  });
}
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
