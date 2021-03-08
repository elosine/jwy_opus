// MAKE A JSPANEL TO LIST ALL PIECES ------------ >
var w = 420;
var h = 400;
var btnH = 40;
var btnW = 240;
var btnYgap = btnH + 22;
var yStart = 35;
var btnL = 150;
var cbs = [];
var canvas = mkCanvasDiv('cid', w, h, 'black');
var panel = mkPanel('pid', canvas, w, h, "Soundflow #2 - Score Launcher", ['center-top', '0px', '0px', 'none'], 'xs');
var title = mkSpan(canvas, 'mainTitle', w, 24, 8, 105, 'Soundflow #2 - Justin Yang', 18, 'rgb(153,255,0)');
title.style.fontVariant = 'small-caps';
var launchScoreWithControlsFunc = function() {
  var partsToRun = [];
  var partsStr = "";
  cbs.forEach((it, ix) => {
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
  console.log(partsStr);
  location.href = "/pieces/sf002/sf002_ctrls.html?parts=" + partsStr;
}
var launchScoreNoCtlsFunc =
  function() {
    location.href = "/pieces/sf002/sf002_client.html";
  }
mkButton(canvas, 'ctlsBtn', btnW, btnH, yStart, btnL, 'Launch Score w/Controls', 14, launchScoreWithControlsFunc);
mkButton(canvas, 'ctlsBtn', btnW, btnH, yStart + btnYgap, btnL, 'Launch Score w/o Controls', 14, launchScoreNoCtlsFunc);

//<editor-fold>  < CHECKBOXES >                             //
for (var i = 0; i < 12; i++) {
  var cbar = [];
  var tt, tt2, tl, tl2;
  var cbSpace = 35;
  var cbSpace2 = 34;
  if (i < 6) {
    tl = 35;
    tl2 = 18;
  } else if (i > 5 && i < 12) {
    tl = 103;
    tl2 = 77;
  }
  tt = 39 + (cbSpace * (i % 6));
  tt2 = 45 + (cbSpace * (i % 6));
  var cblbl = document.createElement("label");
  cblbl.innerHTML = "P" + i.toString();
  cblbl.style.fontSize = "14px";
  cblbl.style.color = "white";
  cblbl.style.fontFamily = "Lato";
  cblbl.style.position = 'absolute';
  cblbl.style.top = tt2.toString() + 'px';
  cblbl.style.left = tl2.toString() + 'px';
  canvas.appendChild(cblbl);

  var cb = document.createElement("input");
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
  cbs.push(cbar);
}
//</editor-fold> END CHECKBOXES END
