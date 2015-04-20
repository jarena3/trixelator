/*
 *
 * Trixelator by John Arena III
 * jarena3.github.io/trixelator
 * Copyright 2015
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */
 
 
 $(document).ready(function() {
//globals for for the source
var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);
var inputCanvas = document.getElementById('inputCanvas');
var i_ctx = inputCanvas.getContext('2d');

//globals for the options

//globals for the output

//get image from loader
function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
            inputCanvas.width = img.width;
            inputCanvas.height = img.height;
            i_ctx.drawImage(img,0,0);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);     
}
/*
// Get the CanvasPixelArray from the given coordinates and dimensions.
var imgd = i_ctx.getImageData(x, y, width, height);
var pix = imgd.data;

// Loop over each pixel and invert the color.
for (var i = 0, n = pix.length; i < n; i += 4) {
    pix[i  ] = 255 - pix[i  ]; // red
    pix[i+1] = 255 - pix[i+1]; // green
    pix[i+2] = 255 - pix[i+2]; // blue
    // i+3 is alpha (the fourth element)
}

// Draw the ImageData at the given (x,y) coordinates.
context.putImageData(imgd, x, y);*/
	
});