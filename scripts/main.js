/* jshint devel:true */
"use strict";
document.body.classList.add('loaded');

window.onbeforeunload = function(e) {
  document.body.style.opacity = 0;
}

var headerTarget = document.getElementById("header-drop-box"),
    headerCanvas = document.getElementById("header-canvas"),
    headerStepper = document.getElementById('header-stepper'),
    headerCodeBox = document.querySelector('.header-code-box'),
    headerCells = headerTarget.querySelectorAll('.Cell'),
    headerImage,

    portraitTarget = document.getElementById("portrait-drop-box"),
    portraitCanvas = document.getElementById("portrait-canvas"),
    portraitStepper = document.getElementById('portrait-stepper'),
    portraitCodeBox = document.querySelector('.portrait-code-box'),
    portraitCells = portraitTarget.querySelectorAll('.Cell'),
    portraitImage,

    codeTemplate = img2pixel.toString(),

    actions = {
      firstPixelIsBlack: false,
      swapAt: []
    };

var loadHeaderImage = function(src){
  headerStepper.value = 125;
  headerImage = new Image();
  headerImage.onload = function(){
    renderHeader(120);
  };
  headerImage.width = 62;
  headerImage.height = 29;
  headerImage.src = src;
};

function renderHeader(threshold){
  imageToCanvasToCells(headerImage, headerCanvas, threshold, headerCodeBox, headerCells);
}

var loadPortraitImage = function(src){
  portraitStepper.value = 125;
  portraitImage = new Image();
  portraitImage.onload = function(){
    renderPortrait(125);
  };
  portraitImage.width = 20;
  portraitImage.height = 20;
  portraitImage.src = src;
};

function renderPortrait(threshold){
  imageToCanvasToCells(portraitImage, portraitCanvas, threshold, portraitCodeBox, portraitCells);
}

function imageToCanvasToCells(img, canvas, threshold, codebox, cells){
    var ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    var imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    function colorIsBlack(i, p){
      var avg =
        imgPixels.data[p] +
        imgPixels.data[p+1] +
        imgPixels.data[p+2];

      avg /= 3;

      return (avg > threshold) ? false : true;
    }

    function setColorAt(i, isBlack){
      if(isBlack)
        cells[i].style.backgroundColor = 'black';
      else
        cells[i].style.backgroundColor = 'white';
    }

    var currentColor = colorIsBlack(0, 0);
    setColorAt(0, currentColor);
    actions.firstPixelIsBlack = currentColor;
    actions.swapAt = [];

    for (var i=1, p=4;i<cells.length; i++, p+=4){
      var newColorIsBlack = colorIsBlack(i, p);
      setColorAt(i, currentColor);

      if(currentColor !== newColorIsBlack){
        actions.swapAt.push(i);
        currentColor = newColorIsBlack;
      }
    }

    var newTemplate = codeTemplate;
    newTemplate = newTemplate.replace('\'{firstPixelIsBlack}\'', actions.firstPixelIsBlack);
    newTemplate = newTemplate.replace('\'{swapAt}\'', actions.swapAt.toString());


    var selector = (img.width>20) ? '.PixelCoverPhoto .Cell' : '#ProfilePicture .Cell';
    newTemplate = newTemplate.replace('\'{selector}\'', selector);

    codebox.innerHTML = '(' + newTemplate + ')()';
}

var readImage = function(imgFile, isHeader){
  if(!imgFile.type.match(/image.*/)){
    console.log("The dropped file is not an image: ", imgFile.type);
    return;
  }
  var reader = new FileReader();

  reader.onload = function(e){
    if(isHeader){
      loadHeaderImage(e.target.result);
    }
    else {
      loadPortraitImage(e.target.result);
    }
  };
  reader.readAsDataURL(imgFile);
};


function headerOutputUpdate(threshold) {
  renderHeader(threshold);
}

function portraitOutputUpdate(threshold) {
  renderPortrait(threshold);
}

headerTarget.addEventListener("dragover", function(e) {e.preventDefault();}, true);
headerTarget.addEventListener("drop", function(e){
  e.preventDefault();
  readImage(e.dataTransfer.files[0], true);
}, true);

portraitTarget.addEventListener("dragover", function(e) {e.preventDefault();}, true);
portraitTarget.addEventListener("drop", function(e){
  e.preventDefault();
  readImage(e.dataTransfer.files[0], false);
}, true);


loadHeaderImage('images/drop-header.jpg');
loadPortraitImage('images/drop-portrait.jpg');

var stepInterval = setInterval(function(){
  headerStepper.value = parseInt(headerStepper.value) + 5;
  renderHeader(headerStepper.value);

  portraitStepper.value = parseInt(portraitStepper.value) + 5;
  renderPortrait(portraitStepper.value);

  if(headerStepper.value >= 65){
    clearInterval(stepInterval);
  }
}, 50);

function img2pixel(){
  var actions = {
        firstPixelIsBlack:'{firstPixelIsBlack}',
        swapAt:['{swapAt}']
      },
      cells = document.querySelectorAll('{selector}'),
      options = {
        'view': window,
        'bubbles': true,
        'cancelable': true
      },
      enter = new MouseEvent('mouseenter', options),
      down = new MouseEvent('mousedown', options),
      up = new MouseEvent('mouseup', options);

    function swapPixel(cell) {
      cell.dispatchEvent(enter);
      cell.dispatchEvent(down);
      cell.dispatchEvent(up);
    }

    function addNewPixels(){
      var colorIsBlack = actions.firstPixelIsBlack;

      for(var i = 0; i < cells.length-1;i++){
        if(colorIsBlack) swapPixel(cells[i]);

        if(i === actions.swapAt[0]){
          actions.swapAt.shift();
          colorIsBlack = !colorIsBlack;
        }
      }
    }

    function resetPixels(){
      for(var i = 0; i < cells.length-1;i++){
        if(cells[i].style.backgroundColor.indexOf('0') > -1) {
         swapPixel(cells[i]);
        }
      }
    }

    resetPixels();
    addNewPixels();
}

//http://stackoverflow.com/a/20079910/3809029
function selectText(query) {
  var node = document.querySelector(query);

  if ( document.selection ) {
    var range = document.body.createTextRange();
    range.moveToElementText( node  );
    range.select();
  }

  else if ( window.getSelection ) {
    var range = document.createRange();
    range.selectNodeContents( node );
    window.getSelection().removeAllRanges();
    window.getSelection().addRange( range );
  }
}