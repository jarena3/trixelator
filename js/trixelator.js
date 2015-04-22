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
var outputSizeMultiplier = 2;
var cellSize = 20;
var colorSampleRadius = 1;
var drawCells = false;
var sliceCount = 1;

//globals for the output

var outputCanvas = document.getElementById('outputCanvas');
var o_ctx = outputCanvas.getContext('2d');
var output_pixel_width = inputCanvas.width * outputSizeMultiplier;
var output_pixel_height = inputCanvas.height * outputSizeMultiplier;


//get image from loader
function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
            inputCanvas.width = outputCanvas.width = img.width;
            inputCanvas.height = outputCanvas.height = img.height;
            i_ctx.drawImage(img,0,0);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);     
}

    $("#render").click(function(){
		invert_color_test();
		draw_output_cells();
    }); 
	
	
	//define a cell
	function cell (xStart, yStart) {
		this.x = xStart;
		this.y = yStart;
	}
	
	
		//TODO: extend this to other shapes	
	function draw_output_cells(){
		var cells=[];
		var source = i_ctx.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
		
		//calculate the output grid
		var grid_length = Math.round(source.width / cellSize);
		var grid_height = Math.round(source.height / cellSize);		
		
		for (var x = 0; x < grid_length; x ++)
		{
			for (var y = 0; y < grid_height; y++)
			{
				cells.push(new cell(x*cellSize, y*cellSize));
			}
		}
		
		console.log(cells.length);
		
		draw_cells(cells);

		
	}
	
	function draw_cells(cells)
	{
		for (var i = 0; i < cells.length; i++)
		{
			var c = cells[i];
			
			if (drawCells)
			{
				o_ctx.strokeRect(c.x, c.y, cellSize, cellSize);
				
				//draw bisection
				o_ctx.beginPath();
				o_ctx.moveTo(c.x, c.y);
				o_ctx.lineTo(c.x + cellSize, c.y + cellSize);
				o_ctx.stroke();
			}
			
			//draw triangle bottom
			o_ctx.fillStyle = getPointColorBottom(c);
			o_ctx.beginPath();
			o_ctx.moveTo(c.x, c.y-1);
			o_ctx.lineTo(c.x + cellSize+1, c.y + cellSize);
			o_ctx.lineTo(c.x, c.y + cellSize);
			o_ctx.closePath();
			o_ctx.fill();
			
			//draw triangle top
			o_ctx.fillStyle = getPointColorTop(c);
			o_ctx.beginPath();
			o_ctx.moveTo(c.x, c.y);
			o_ctx.lineTo(c.x + cellSize, c.y + cellSize);
			o_ctx.lineTo(c.x + cellSize, c.y);
			o_ctx.closePath();
			o_ctx.fill();
		}
		
	}
	
	function getPointColorBottom (c)
	{
		var centroidX = getTriangleCentroidCoordinate(c.x, c.x + cellSize, c.x);
		var centroidY = getTriangleCentroidCoordinate(c.y, c.y + cellSize, c.y + cellSize);
		var p = i_ctx.getImageData(centroidX, centroidY, 1, 1).data; 
		var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
		return hex;
	}
	
		function getPointColorTop (c)
	{
		var centroidX = getTriangleCentroidCoordinate(c.x, c.x + cellSize, c.x + cellSize);
		var centroidY = getTriangleCentroidCoordinate(c.y, c.y + cellSize, c.y);
		var p = i_ctx.getImageData(centroidX, centroidY, 1, 1).data; 
		var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
		return hex;
	}
	
	function getTriangleCentroidCoordinate(n1, n2, n3)
	{
		var result = Math.round((n1+n2+n3)/3);
		return result;
	}
	
	function rgbToHex(r, g, b) 
	{
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
	}
	
	
/*-----testing ---------------*/
	function invert_color_test() {
		
		// Get the CanvasPixelArray from the given coordinates and dimensions.
		var imgd = i_ctx.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
		var pix = imgd.data;

		// Loop over each pixel and invert the color.
		for (var i = 0, n = pix.length; i < n; i += 4) {
			pix[i  ] = 255 - pix[i  ]; // red
			pix[i+1] = 255 - pix[i+1]; // green
			pix[i+2] = 255 - pix[i+2]; // blue
			// i+3 is alpha (the fourth element)
		}

		// Draw the ImageData at the given (x,y) coordinates.
		o_ctx.putImageData(imgd, 0, 0);
	}
	
});