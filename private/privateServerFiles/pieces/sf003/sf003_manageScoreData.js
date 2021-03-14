//<editor-fold> << GLOBAL VARIABLES >> ------------------------------------- //
const W = 250;
const H = 260;
const BTN_W = 217;
const BTN_H = 50;
const LEFT = 8;
const H2 = 106;
const H3 = 177;
const TOP = 35;
const BTN_FNT_SZ = 14;
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

//<editor-fold> << INTERFACE >> -------------------------------------------- //
// CANVAS & PANEL & TITLE ------------------ >
let canvas = mkCanvasDiv('cid', W, H, 'black');
let panel = mkPanel('pid', canvas, W, H, "Soundflow #3 - Score Manager");
let title = mkSpan(canvas, 'mainTitle', W, 24, 8, 23, 'Soundflow #1 - Score Manager', 16, 'rgb(153,255,0)');
title.style.fontVariant = 'small-caps';
// FUNCTION TO GENERATE SCORE DATA --------- >
// This function is launched by the genScoreButton:
//// * Generates score data by running generateScoreData()
//// * This produces fileName_dataArray_Set - [ dataFileName(str), scoreData:[] ]
//// * The function will generate two buttons & their functions:
////// 1) Save Score Local
////// 1) Save Score Server
function genScoreDataFunc() {
  let fileName_dataArray_Set = generateScoreData();
  let fileName = fileName_dataArray_Set[0];
  let scoreData_str = fileName_dataArray_Set[1];
  genScoreBtn.innerText = 'Generate Another Score';
  // SAVE SCORE LOCAL ---------------------- >
  let saveScoreBtnFunc = function() {
    downloadStrToHD(scoreData_str, fileName, 'text/plain');
  }
  let saveScoreBtn = mkButton(canvas, 'saveScoreBtn', BTN_W, BTN_H, H2, LEFT, 'Save Score Local', BTN_FNT_SZ, saveScoreBtnFunc);
  // SAVE SCORE TO SERVER ------------------ >
  let saveScoreServerBtnFunc = function() {
    SOCKET.emit('sf003_saveScoreToServer', {
      pieceData: fileName_dataArray_Set
    });
  }
  let saveScoreServerBtn = mkButton(canvas, 'saveScoreServerBtn', BTN_W, BTN_H, H3, LEFT, 'Save Score Server', BTN_FNT_SZ, saveScoreServerBtnFunc);
}
// GENERATE SCORE BUTTON ------------------- >
let genScoreBtn = mkButton(canvas, 'genScoreBtn', BTN_W, BTN_H, TOP, LEFT, 'Generate Score', BTN_FNT_SZ, function() {
  genScoreDataFunc();
});
//</editor-fold> >> END INTERFACE END  ////////////////////////////////////////

//<editor-fold> << GENERATE SCORE DATA FUNCTION >> ------------------------- //
function generateScoreData() {
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
  let fileName_dataArray_Set = [];
  let numParts = 3;
  let scoreData = {};
  //Obj for each part
  for (let i = 0; i < numParts; i++) {
    scoreData[i.toString()] = {};
  }
  //Make data for each part
  for (let i = 0; i < numParts; i++) {
    let itos = i.toString();
    let t_partObj = scoreData[itos];
    // Decide # cascading rings
    let numCascadingRings = rrandInt(3, 5);
    t_partObj['numRings'] = numCascadingRings;
    // Decide # Events
    let numEvents = rrandInt(2, 4);
    t_partObj['numEvents'] = numEvents;
    // Decide event durations
    let maxDurEvents = rrandInt(21, 33);
    let eventDursSet = mkCascadingSet_wTotal(maxDurEvents, numEvents);
    let eventDurs = roundSet(eventDursSet[0]);
    let totalEventDurs = Math.round(eventDursSet[1]);
    t_partObj['eventDurs'] = eventDurs;
    //Decide Event Gaps
    let maxAllGaps = 60 - totalEventDurs;
    let gaps = roundSet(mkCascadingSet(maxAllGaps, numEvents));
    t_partObj['gaps'] = gaps;
    //Decide segments to eliminate for each subsequent ring
    let maxSegmentsToDelete = 30;
    let numSegmentsToDeleteSet = roundSet(mkCascadingSet(maxSegmentsToDelete, numCascadingRings - 1));
    let segments = mkNumbers(60);
    let secToDel = [];
    numSegmentsToDeleteSet.forEach((it, ix) => { //set of num of segments to delete per ring
      let tar = [];
      for (let k = 0; k < it; k++) { // iterate it number of segments
        let segToDel = choose(segments);
        tar.push(segToDel);
        segments.forEach((it, ix) => { //remove from segments
          segToDel == it && segments.splice(ix, 1); //remove from segments
        });
      }
      secToDel.push(tar);
    });
    //Make [startDeg,stopDeg] sets for each arc in 1st ring
    let ring1ArcsArray = [];
    let degCt = 0;
    for (let j = 0; j < numEvents; j++) {
      let startStopDegs = [];
      let startDeg = degCt + gaps[j];
      degCt += gaps[j];
      startStopDegs.push(startDeg);
      let stopDeg = degCt + eventDurs[j];
      degCt += eventDurs[j];
      startStopDegs.push(stopDeg);
      //Decide if accel/deceleration
      startStopDegs.push(flipCoin());
      ring1ArcsArray.push(startStopDegs);
    }
    //make an array of 60 numbers assigned to gap or event
    //take away seconds from each subsequent ring
    //make new sets using ix[0] and ix[last]
    let gapsEventsArray = [];
    let idx = 0;
    for (let j = 0; j < gaps.length; j++) {
      gapsEventsArray.push(mkNumbers(gaps[j], idx));
      idx = idx + gaps[j];
      gapsEventsArray.push(mkNumbers(eventDurs[j], idx));
      idx = idx + eventDurs[j];
    }
    //flatten and sort segments to delete array for each ring
    let allSecsToDelPerRing = [];
    for (let j = 0; j < secToDel.length; j++) {
      let ogArL = secToDel.length - 1;
      let ringSecsToDel = deepCopy(secToDel);
      ringSecsToDel.splice(j, ogArL - j);
      ringSecsToDel = ringSecsToDel.flat(2);
      numSort(ringSecsToDel);
      allSecsToDelPerRing.push(ringSecsToDel);
    }
    //Remove segments for each ring and generate new array:
    //[ numSecsInRing, arcsStartStop:[start, stop] ] //will need to increase speed for each subsequent ring based on new ring duration
    let allRingsNewArcs = [];
    let tempRingArr = [];
    tempRingArr.push(60);
    tempRingArr.push(ring1ArcsArray);
    allRingsNewArcs.push(tempRingArr); // [ numSecsInRing, arcsStartStop:[start, stop] ]
    allSecsToDelPerRing.forEach((it, ix) => {
      let t_newRingLenSec = 60 - it.length;
      let tempRingArr = [];
      tempRingArr.push(t_newRingLenSec);
      let newGapsEventsArray = deepCopy(gapsEventsArray);
      it.forEach((it4, ix4) => { //segments to delete for each ring
        newGapsEventsArray.forEach((it2, ix2) => {
          it2.forEach((it3, ix3) => {
            if (it4 == it3) { //it4=secToDel; it3=gapOReventSec
              it2.splice(ix3, 1);
            }
          });
        });
      });
      let t_ct = 0;
      let newRingArcs = [];
      let tstart, tstop;
      newGapsEventsArray.forEach((it31, ix31) => {
        if ((ix31 % 2) == 0) {
          t_ct = t_ct + it31.length;
          tstart = t_ct;
        } else {
          t_ct = t_ct + it31.length;
          tstop = t_ct;
          let tar9 = [];
          tar9.push(tstart);
          tar9.push(tstop);
          //Decide if accel/deceleration
          tar9.push(flipCoin());
          newRingArcs.push(tar9)
        }
      });
      tempRingArr.push(newRingArcs);
      allRingsNewArcs.push(tempRingArr); // [ numSecsInRing, arcsStartStopType:[start, stop, type] ]
    });
    t_partObj['partScoreData'] = allRingsNewArcs; // t_partObj is already added to scoreData-Obj above
  }
  // Make File Name
  var t_now = new Date();
  var month = t_now.getMonth() + 1;
  var scoreData_fileName = "sf003_" + t_now.getFullYear() + "_" + month + "_" + t_now.getUTCDate() + "_" + t_now.getHours() + "-" + t_now.getMinutes() + "-" + t_now.getSeconds() + '.txt';

  fileName_dataArray_Set.push(scoreData_fileName);
  //Make scoreData-Obj into string
  let scoreDataStr = JSON.stringify(scoreData);
  fileName_dataArray_Set.push(scoreDataStr);
  return fileName_dataArray_Set;
}

//</editor-fold> >> END GENERATE SCORE DATA FUNCTION END  /////////////////////
