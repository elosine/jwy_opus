var motivePaths = [
  [
    "/notation/quintuplet_accent.svg",
    "/notation/eight_accent_2ndPartial_27_34.svg",
    "/notation/eight_accent_1stPartial_27_34.svg",
    "/notation/triplet_accent_1st_partial_45_45.svg",
    "/notation/quarter_accent_12_35.svg"
  ],
  [
    "/notation/quadruplet_accent.svg",
    "/notation/eight_accent_2ndPartial_27_34.svg",
    "/notation/eight_accent_1stPartial_27_34.svg",
    "/notation/triplet_accent_1st_partial_45_45.svg",
    "/notation/quarter_accent_12_35.svg"
  ]
];

addImageProcess(src){
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = () => resolve(img.height)
    img.onerror = reject
    img.src = src
  })
}

You would then use the following to access that value

tmp.addImageProcess(imageUrl).then(height => {
  console.log(height)
})

or, if within an async function

async function logImageHeight(imageUrl) {
  console.log('height', await tmp.addImageProcess(imageUrl))
}




async function getNotationSizes() {
  for (const [idx, url] of motivePaths[0].entries()) {
    var newImg = new Image();
    newImg.src = url;
    const loadedImg = await newImg.onload;
    console.log(loadedImg);
  }
}



function getImageOgSize(url, callback) {
  var newImg = new Image();
  newImg.src = url;
  newImg.onload = function() {
    var imgSize = {
      w: this.naturalWidth,
      h: this.naturalHeight
    };
    if (typeof callback !== "undefined") callback(imgSize, url);
  };
}
// </editor-fold>      END FUNCTION GET ORIGINAL IMAGE SIZE //////////

// <editor-fold>       <<<< FUNCTION GET NOTATION SIZES >>>> ------ //
function getNotationSizes(pathArr, emptyDestArr, activateButtonsFlag) {
  pathArr.forEach(function(it, ix) {
    getImageOgSize(it, function(size, url) {
      var sizeArr = [];
      sizeArr.push(url);
      sizeArr.push(size.w);
      sizeArr.push(size.h);
      emptyDestArr.push(sizeArr);
      // Activate Buttons after last image has been processed
      if (activateButtonsFlag) {
        if (ix == (pathArr.length - 1)) {
          activateButtons = true;
          //make Dial objects and generate static elements
          makeDials();
        }
      }
    });
  });
}
