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
	 
//globals for the source
var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);
var inputCanvas = document.getElementById('inputCanvas');
var i_ctx = inputCanvas.getContext('2d');

//globals for the options
var outputSizeMultiplier = 1;
var cellSize = 20;
var colorSampleRadius = 1;
var drawCells = false;
var sliceCount = 1;

//globals for the output
var cellSize;
var outputCanvas = document.getElementById('outputCanvas');
var o_ctx = outputCanvas.getContext('2d');


//init sliders
	var cs_slider = $('#cell-size-slider').slider({
		formatter: function(value) {
			return 'Current value: ' + value;
		}
	}).on("slide", function(slideEvt) {
		cellSize = (slideEvt.value);
	});

	var os_slider = $('#output-size-slider').slider({
		formatter: function(value) {
			return 'Current value: ' + value;
		}
	}).on("slide", function(slideEvt) {
		outputSizeMultiplier = (slideEvt.value);
	});


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

    $("#render").click(function(){
		
		outputCanvas.width = inputCanvas.width;
		outputCanvas.height = inputCanvas.height;
				
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

		$('#render-span').addClass("glyphicon glyphicon-refresh glyphicon-refresh-animate");
		$('#render').text("Working...");		
		
		
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
		
		$('#render-span').removeClass("glyphicon glyphicon-refresh glyphicon-refresh-animate");
		$('#render').text("Trixelate!");

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
	
	
});