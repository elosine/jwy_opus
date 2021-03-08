// MAKE A JSPANEL TO LIST ALL PIECES ------------ >
var w = 300;
var h = 400;
var btnH = 40;
var btnW = w - 16;
var btnYgap = btnH + 8;
var yStart = 40;
var canvas = mkCanvasDiv('cid', w, h, 'black');
var panel = mkPanel('pid', canvas, w, h, "Score Loader", ['center-top', '0px', '0px', 'none'], 'xs');
// Enable Scrolling within panel
panel.content.overflow = 'scroll';
var title = mkSpan(canvas, 'mainTitle', w, 24, 8, 38, 'Justin Wen-Lo Yang - Scores', 18, 'rgb(153,255,0)');
title.style.fontVariant = 'small-caps';
var pieceName_btnFunc_Array = [
  ['Soundflow #2', function(){
location.href = "/pieces/sf002/sf002_launchPage.html";
  }]
];
//Generate A Button for each Score using forEach piecename,
pieceName_btnFunc_Array.forEach((it, ix) => {
  var id = 'btn' + ix.toString();
  mkButton(canvas, id, btnW, btnH, (btnYgap*ix)+yStart, 0, it[0], 14, it[1]);
});
