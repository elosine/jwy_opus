//Piece Selector Panel Variables
var id = 'pieceSelector';
var w = 500;
var h = 150;
// Make Canvas ------------- >
var canvasID = id + 'canvas';
var canvas = mkCanvasDiv(canvasID, w, h, 'black'); //see func below
// Make jsPanel ----------------- >
var panelID = id + 'panel';
var panel = mkPanel(panelID, canvas, w, h, "Piece Selector", ['center-top', '0px', '0px', 'none']);


// <editor-fold>       <<<< MAKE JSPANEL >>>> --------------------- //
function mkPanel(panelid, svgcanvas, w, h, title, posArr) {
  var tpanel;
  var posString = posArr[0];
  var offsetX = posArr[1];
  var offsetY = posArr[2];
  var autoposition = posArr[3];
  jsPanel.create({
    // position: 'center-top',
    //  position: {
    //     bottom: 50,
    //     right: 50
    // },
    position: {
      my: posString,
      at: posString,
      offsetX: offsetX,
      offsetY: offsetY,
      autoposition: autoposition
    },
    id: panelid,
    contentSize: w.toString() + " " + h.toString(),
    header: 'auto-show-hide',
    headerControls: {
      minimize: 'remove',
      // smallify: 'remove',
      maximize: 'remove',
      close: 'remove'
    },
    contentOverflow: 'hidden',
    headerTitle: title,
    theme: "light",
    content: svgcanvas, //svg canvas lives here
    resizeit: {
      aspectRatio: 'content',
      resize: function(panel, paneldata, e) {}
    },
    callback: function() {
      tpanel = this;
    }
  });
  return tpanel;
}
// </editor-fold>      END MAKE JSPANEL /////////////////////////////


// <editor-fold>       <<<< MAKE CANVAS DIV >>>> ------------------ //
function mkCanvasDiv(canvasID, w, h, clr) {
  var t_div = document.createElement("div");
  t_div.style.width = w.toString() + "px";
  t_div.style.height = h.toString() + "px";
  t_div.style.background = clr;
  t_div.id = canvasID;
  return t_div;
}
// </editor-fold>      END MAKE CANVAS DIV ///////////////////////////
