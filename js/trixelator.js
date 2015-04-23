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

//get these tooltips up ins 
 $(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
	 
	 
//globals for the source
var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);
var inputCanvas = document.getElementById('inputCanvas');
var i_ctx = inputCanvas.getContext('2d');
var thumbnailCanvas = document.getElementById('thumbnailCanvas');
var t_ctx = thumbnailCanvas.getContext('2d');
var inputImage;

//globals for the options
var outputSizeMultiplier = 1;
var cellSize = 20;
var colorSampleRadius = 1;
var drawCells = false;
var sliceCount = 1;
var bisectDirection = "bis-rnd";
var noisePattern;

//globals for the output
var cellSize;
var outputCanvas = document.getElementById('outputCanvas');
var o_ctx = outputCanvas.getContext('2d');


//init sliders
	var cs_slider = $('#cell-size-slider').slider({
		formatter: function(value) {
			return 'Cell Size: ' + value;
		}
	});

	var os_slider = $('#output-size-slider').slider({
		formatter: function(value) {
			return 'Output Image Scale: x' + value;
		}
	});


//get image from loader
function handleImage(e){
    var reader = new FileReader();
	var canvasExtents = $('#preview').width();
	
    reader.onload = function(event){
        inputImage = new Image();
        inputImage.onload = function(){
			
            inputCanvas.width = thumbnailCanvas.width = inputImage.width;
            inputCanvas.height = thumbnailCanvas.height = inputImage.height;
			i_ctx.drawImage(inputImage,0,0);
			inputCanvas.style.display="none";
			
			if (thumbnailCanvas.width > canvasExtents)
			{
				//do something
			}
			
		//	t_ctx.scale(0.5,0.5);
            t_ctx.drawImage(inputImage,0,0);
        }
		
        inputImage.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);     
}

    $("#render").click(function(){
		
		cellSize = $('#cell-size-slider').slider().slider('getValue');
		outputSizeMultiplier = os_slider;
		
		outputCanvas.width = inputImage.width;
		outputCanvas.height = inputImage.height;
		
		bisectDirection = $('input[name="bisect-dir"]:checked').val();
		
		//if noise
		var noiseImg = document.getElementById("noise");
		noisePattern = o_ctx.createPattern(noiseImg, "repeat");
				
		draw_output_cells();
    }); 
	
	//define a coordinate
	function coord (x, y) {
		this.x = x;
		this.y = y;
	}
	
	//define a cell
	function cell (coords) {
		this.verts = coords;
	}
	
		
		//TODO: extend this to other shapes	
	function draw_output_cells(){
		var cells=[];
		var source = i_ctx.getImageData(0, 0, inputCanvas.width, inputCanvas.height);

		$('#render-span').addClass("glyphicon glyphicon-refresh");
		$('#render').text("Working...");		
		
		//TODO: cell shape
		
		//for square grids
		//calculate the output grid
		var grid_length = Math.round(source.width / cellSize);
		var grid_height = Math.round(source.height / cellSize);		
		
		for (var x = 0; x < grid_length; x ++)
		{
			for (var y = 0; y < grid_height; y++)
			{
					cells.push(
						new cell([
							new coord(x * cellSize, y * cellSize),
							new coord((x + 1) * cellSize, y * cellSize),
							new coord(x * cellSize, (y - 1) * cellSize),
							new coord((x + 1) * cellSize, (y - 1) * cellSize)
						])
					);					
			}
		}
		
		console.log(cells.length);
		
		draw_cells(cells);
		
		$('#render-span').removeClass("glyphicon glyphicon-refresh");
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
				
			switch (bisectDirection)
			{
				case ("bis-ccw"):
					//0 -> 3 -> 2
					drawTriangle(c.verts[0], c.verts[3], c.verts[2])
					//0 -> 1 -> 3
					drawTriangle(c.verts[0], c.verts[1], c.verts[3])					
					break;
				case ("bis-cw"):
					//0 -> 1 -> 2
					drawTriangle(c.verts[0], c.verts[1], c.verts[2])
					//1 -> 3 -> 2
					drawTriangle(c.verts[1], c.verts[3], c.verts[2])
					break;
				case ("bis-alt"):
					if (i % 2 === 0)
					{
						drawTriangle(c.verts[0], c.verts[3], c.verts[2])
						drawTriangle(c.verts[0], c.verts[1], c.verts[3])
					}
					else
					{
						drawTriangle(c.verts[0], c.verts[1], c.verts[2])
						drawTriangle(c.verts[1], c.verts[3], c.verts[2])						
					}
					break;
				case ("bis-rnd"):
					if (Math.random() > 0.5)
					{
						drawTriangle(c.verts[0], c.verts[3], c.verts[2])
						drawTriangle(c.verts[0], c.verts[1], c.verts[3])
					}
					else
					{
						drawTriangle(c.verts[0], c.verts[1], c.verts[2])
						drawTriangle(c.verts[1], c.verts[3], c.verts[2])						
					}
					break;
				default:
					alert("ERROR: malformed bisect direction request!")
					break;				
			}
					
		}
		
	}
	
	function drawTriangle (a, b, c)
	{
		
		o_ctx.fillStyle = o_ctx.strokeStyle = "#" + getPointColor(a,b,c);

		o_ctx.beginPath();
		o_ctx.lineWidth=1;
		o_ctx.moveTo(a.x, a.y);
		o_ctx.lineTo(b.x, b.y);
		o_ctx.lineTo(c.x, c.y);
		o_ctx.closePath();
					
		o_ctx.fill();
		o_ctx.stroke();		
		
		if ($('#noisy').is(":checked"))
		{	
			o_ctx.fillStyle = o_ctx.strokeStyle = noisePattern;
			o_ctx.fill();
//			o_ctx.stroke();	
		}
		
		if (!$('#cell-borders').is(":checked"))
		{
			o_ctx.stroke();
		}
	}
	
	function getPointColor (a,b,c)
	{
		//get triangle centroid
		var centroid = new coord(((a.x + b.x + c.x) / 3), ((a.y + b.y + c.y) / 3));
		//get pixel
		var p = i_ctx.getImageData(centroid.x, centroid.y, 1, 1).data; 
		//get color
		var hex = ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
		
		return hex;
	}
	
	function rgbToHex(r, g, b) 
	{
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
	}
	
	
});