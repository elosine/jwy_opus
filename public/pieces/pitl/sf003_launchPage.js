//<editor-fold> << GLOBAL VARIABLES >> ------------------------------------- //
const W = 420;
const H = 180;
const BTN_W = 240;
const BTN_H = 40;
const TOP = 35;
const LEFT = 88;
const BTN_FNT_SZ = 14;
let checkboxesSet = [];
let scoreDataFileName = 'default';
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
let canvas = mkCanvasDiv('cid', W, H, 'black');
let panel = mkPanel('pid', canvas, W, H, "Soundflow #3 - Score Launcher", ['center-top', '0px', '0px', 'none'], 'xs', true);
let title = mkSpan(canvas, 'mainTitle', W, 24, 8, 105, 'Soundflow #3 - Justin Yang', 18, 'rgb(153,255,0)');
title.style.fontVariant = 'small-caps';
let launchScoreFunc = function() {
  let partsToRun = [];
  let partsStr = "";
  checkboxesSet.forEach((it, ix) => {
    if (it[0].checked) {
      partsToRun.push(ix);
    }
  });
  partsToRun.forEach((it, ix) => {
    if (ix == partsToRun.length - 1) {
      partsStr = partsStr + it.toString();
    } else {
      partsStr = partsStr + it.toString() + ";";
    }
  });
  // SCORE PAGE LAUNCHED WITH:
  // parts = '1;3;6'
  // dataFileName = 'soundflow2_2021_2_19_16_3.txt' //text file on server with score data in it loaded in score page
  location.href = "/pieces/sf003/sf003.html?parts=" + partsStr + "&scoreDataFileName=" + scoreDataFileName;
}
mkButton(canvas, 'ctlsBtn', BTN_W, BTN_H, TOP, LEFT, 'Launch Score', BTN_FNT_SZ, launchScoreFunc);
//<editor-fold>  < CHECKBOXES >                             //
let numCbs = 3;
for (let i = 0; i < numCbs; i++) {
  let cbar = [];
  let tt, tt2, tl, tl2;
  let cbSpace = 38;
  let cbSpace2 = 34;
  tl = 35;
  tl2 = 18;
  tt = 42 + (cbSpace * (i % 6));
  tt2 = 48 + (cbSpace * (i % 6));
  let cblbl = document.createElement("label");
  cblbl.innerHTML = "P" + i.toString();
  cblbl.style.fontSize = "14px";
  cblbl.style.color = "white";
  cblbl.style.fontFamily = "Lato";
  cblbl.style.position = 'absolute';
  cblbl.style.top = tt2.toString() + 'px';
  cblbl.style.left = tl2.toString() + 'px';
  canvas.appendChild(cblbl);

  let cb = document.createElement("input");
  cb.id = 'cb' + i.toString();
  cb.type = 'checkbox';
  cb.value = '0';
  cb.checked = '';
  cb.style.width = '25px';
  cb.style.height = '25px';
  cb.style.position = 'absolute';
  cb.style.top = tt.toString() + 'px';
  cb.style.left = tl.toString() + 'px';
  canvas.appendChild(cb);
  cbar.push(cb);
  cbar.push(cblbl);
  checkboxesSet.push(cbar);
}
//</editor-fold> END CHECKBOXES END
//<editor-fold>  < LOAD SCORE FROM SERVER CTRL PANEL >
// Measurements ------------------- >
let w2 = 300;
let h2 = 190;
let menuW = 280;
let menuH1 = 132;
let btnW2 = menuW;
let btnH2 = 35;
let gap = 8;
let H2 = gap + BTN_H + menuH1;
let H3 = H2 + gap + BTN_H + menuH1; //
let loadCP = mkCtrlPanel('load', w2, h2, 'Load Score Data From Server Panel', ['left-top', '0px', '0px', 'none'], 'xs');
let loadCanvas = loadCP.canvas;

let loadPieceFromServerFunc = function() {
  SOCKET.emit('sf003_loadPieceFromServer', {});
}
let loadPieceFromServerBtn = mkButton(loadCanvas, 'loadPieceFromServerButton', btnW2, btnH2, 0, 0, 'Load Score Server', 14, loadPieceFromServerFunc);

SOCKET.on('sf003_loadPieceFromServerBroadcast', function(data) {
  let t_pieceArr = data.availableScoreDataFiles;
  let t_menuArr = [];
  t_pieceArr.forEach((it, ix) => {
    if (it != '.DS_Store') {
      let tar = [];
      tar.push(it);
      let funtt = function() {
        scoreDataFileName = it;
      };
      tar.push(funtt);
      t_menuArr.push(tar);
    }
  });
  serverScoreMenu = mkMenu(loadCanvas, 'serverList', menuW, menuH1, btnH2 + gap, gap, t_menuArr);
  serverScoreMenu.classList.toggle("show");
});
loadCP.panel.smallify();
//</editor-fold> END LOAD SCORE FROM SERVER CTRL PANEL END
//</editor-fold> >> END INTERFACE END  ////////////////////////////////////////
