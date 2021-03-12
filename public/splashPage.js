// MAKE A JSPANEL TO LIST ALL PIECES ------------ >
var w = 300;
var h = 400;
var btnH = 40;
var btnW = w - 65;
var btnYgap = btnH + 14;
var yStart = 40;
var canvas = mkCanvasDiv('cid', w, h, 'black');
var panel = mkPanel('pid', canvas, w, h, "Score Loader", ['center-top', '0px', '0px', 'none'], 'xs', true, 'auto');

var title = mkSpan(canvas, 'mainTitle', w, 24, 8, 38, 'Justin Wen-Lo Yang - Scores', 18, 'rgb(153,255,0)');
title.style.fontVariant = 'small-caps';
var pieceName_btnFunc_Array = [
  ['Soundflow #1a', function() {
    location.href = "/pieces/sf001/sf001a_launchPage.html";
  }],
  ['Soundflow #1b', function() {
    location.href = "/pieces/sf001/sf001b_launchPage.html";
  }],
  ['Soundflow #2', function() {
    location.href = "/pieces/sf002/sf002_launchPage.html";
  }],
  ['Soundflow #3', function() {
    location.href = "/pieces/sf003/sf003_launchPage.html";
  }]
];
//Generate A Button for each Score using forEach piecename,
pieceName_btnFunc_Array.forEach((it, ix) => {
  var id = 'btn' + ix.toString();
  var pbut = mkButton(canvas, id, btnW, btnH, (btnYgap * ix) + yStart, 30, it[0], 14, it[1]);
});
