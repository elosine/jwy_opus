// <editor-fold>       <<<< CONTROL PANEL - INIT >>>> ----------- //
//Piece Selector Panel Variables
var id = 'pieceSelector';
var w = 500;
var h = 500;
var btnW = 240;
var btnH = 40;
var listH = 50;
var btnL = (w / 2) - (btnW / 2);
// Make Canvas ------------- >
var canvasID = id + 'canvas';
var canvas = mkCanvasDiv(canvasID, w, h, 'black'); //see func below
// Make jsPanel ----------------- >
var panelID = id + 'panel';
var panel = mkPanel(panelID, canvas, w, h, "Piece Selector", ['center-top', '0px', '0px', 'none']);
// Other ----------------- >
var activateButtons = true;
var pieceName_IDList = [
  ['Soundflow 1', 'sf001'],
  ["Soundflow-2", 'sf002'],
  ['Soundflow 3', 'sf003']
];
var piecesAtags = [];
// </editor-fold>       END CONTROL PANEL - INIT ////-----////////

// <editor-fold>     <<<< CONTROL PANEL - GENERATE PIECE >>>> - //
var createPieceDropdownDiv = document.createElement("div");
createPieceDropdownDiv.className = 'dropdown';
canvas.appendChild(createPieceDropdownDiv);

var choosePieceButton = document.createElement("BUTTON");
choosePieceButton.className = 'btn btn-1';
choosePieceButton.innerText = 'Generate New Piece';
choosePieceButton.style.width = btnW.toString() + "px";
choosePieceButton.style.height = btnH.toString() + "px";
choosePieceButton.style.top = "0px";
choosePieceButton.style.fontSize = "18px";
choosePieceButton.style.left = btnL.toString() + "px";
choosePieceButton.addEventListener("click", function() {
  if (activateButtons) {
    document.getElementById("myDropdown").classList.toggle("show");
  }
});
createPieceDropdownDiv.appendChild(choosePieceButton);

var dropDownListDiv = document.createElement("div");
dropDownListDiv.id = 'myDropdown';
dropDownListDiv.className = 'dropdown-content';
var ddw = btnW - 4;
dropDownListDiv.style.width = ddw.toString() + "px";
var tlistH = pieceName_IDList.length * listH;
// dropDownListDiv.style.height = tlistH.toString() + "px";
var tlistT = btnH + 17;
dropDownListDiv.style.top = tlistT.toString() + "px";
var ddL = btnL + 10;
dropDownListDiv.style.left = ddL.toString() + "px";
createPieceDropdownDiv.appendChild(dropDownListDiv);

pieceName_IDList.forEach(function(it, ix) {
  var tempAtag = document.createElement('a');
  // tempAtag.setAttribute('href', "scores.html");
  tempAtag.textContent = it[0];
  tempAtag.style.fontFamily = "lato";
  tempAtag.id = 'pieceList' + ix.toString();
  tempAtag.addEventListener("click", function() {
    if (activateButtons) {
      socket.emit('mkNewPiece', {
        pieceType: it[1],
        pieceName: it[0]
      });
    }
  });
  dropDownListDiv.appendChild(tempAtag);
  piecesAtags.push(tempAtag);
});

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.btn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

// </editor-fold>       END CONTROL PANEL - GENERATE PIECE //////


// <editor-fold> <<<< SOCKET IO >>>> --------------------------------------- //

// <editor-fold>       <<<< SOCKET IO - SETUP >>>> -------------- //
var ioConnection;
if (window.location.hostname == 'localhost') {
  ioConnection = io();
} else {
  ioConnection = io.connect(window.location.hostname);
}
var socket = ioConnection;
// </editor-fold>      END SOCKET IO - SETUP ///////////////////////


// <editor-fold>       <<<< SOCKET IO - INIT NEW PIECE >>>> -------------- //
socket.on('newPieceBroadcast', function(data) {
  var newPieceID = data.newPieceIDArr[0];
  var newPieceType = data.newPieceIDArr[1];
  var newPieceName = data.newPieceIDArr[2];
  //pass parameters through html
  location.href = "scores.html?id=" + newPieceID + "&type=" + newPieceType + "&name=" + newPieceName;
});
// </editor-fold>    END SOCKET IO - INIT NEW PIECE ///////////////////////


//</editor-fold> END SOCKET IO ////////////////////////////////////////////////



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
  t_div.style.padding = "0px";
  t_div.style.margin = "0px";
  t_div.id = canvasID;
  return t_div;
}
// </editor-fold>      END MAKE CANVAS DIV ///////////////////////////
