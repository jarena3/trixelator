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

 var dbtnDiv = document.getElementById("d-btn-div");
 dbtnDiv.style.display="none";
 
//get these tooltips up ins 
 $(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

$('.dropdown-toggle').dropdown()
	 
	 
//globals for the source
var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);
var inputCanvas = document.getElementById('inputCanvas');
var i_ctx = inputCanvas.getContext('2d');
var inputPreviewCanvas = document.getElementById('inputPreviewCanvas');
var ip_ctx = inputPreviewCanvas.getContext('2d');
var inputImage;

//globals for the options
var outputSizeMultiplier = 1;
var cellSize = 20;
var colorSampleRadius = 1;
var sliceCount = 1;
var noisePattern;

//globals for the output
var loadingModal = $('.loading');
var cellSize;
var outputCanvas = document.getElementById('outputCanvas');
var o_ctx = outputCanvas.getContext('2d');
var outputPreviewCanvas = document.getElementById('outputPreviewCanvas');
var op_ctx = outputPreviewCanvas.getContext('2d');


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
	var canvasExtents = $('#preview').width() * 0.9;
	
    reader.onload = function(event){
        inputImage = new Image();
        inputImage.onload = function(){
			
            inputCanvas.width = inputPreviewCanvas.width = inputImage.width;
            inputCanvas.height = inputPreviewCanvas.height = inputImage.height;
			i_ctx.drawImage(inputImage,0,0);
			inputCanvas.style.display="none";
			
			if (inputPreviewCanvas.width > canvasExtents)
			{
				var scaleFactor = canvasExtents / inputPreviewCanvas.width;
				inputPreviewCanvas.width = inputImage.width * scaleFactor;
				inputPreviewCanvas.height = inputImage.height * scaleFactor;
				ip_ctx.drawImage(inputImage, 0, 0, inputPreviewCanvas.width, inputPreviewCanvas.height);
			}
			else 
			{
				ip_ctx.drawImage(inputImage, 0, 0);
			}
			
        }
		
        inputImage.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);     
}

	//progress bar
	$('.js-loading-bar').modal({
	  backdrop: 'static',
	  show: false
	});

$('#render').click(function() {
	
	if (inputImage != null)
	{
		$('#warning-div').html('');
		
		loadingModal.modal('show');

		setTimeout(function() {
		render();
		}, 1000);

		setTimeout(function() {
		loadingModal.modal('hide');
		}, 1500);
	}
	else
	{
		$('#warning-div').append('<div class="alert alert-danger alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Error!</strong> No image selected! Select an image and try again.</div>');
	}
});


function render()
{
	dbtnDiv.style.display="initial";
	
	cellSize = $('#cell-size-slider').slider().slider('getValue');
	outputSizeMultiplier = $('#output-size-slider').slider().slider('getValue');
	
	outputCanvas.width = outputPreviewCanvas.width = inputImage.width * outputSizeMultiplier;
	outputCanvas.height = outputPreviewCanvas.height = inputImage.height * outputSizeMultiplier;
		
	var noiseImg = document.getElementById("noise");
	noisePattern = o_ctx.createPattern(noiseImg, "repeat");
			
	o_ctx.scale(outputSizeMultiplier, outputSizeMultiplier);
	
	
	switch ($('input[name="cell-shape"]:checked').val())
	{
		case("square"):
			draw_square_cells();
			break;
		case("v-hex"):
			draw_hex_cells(true); //bool = vert
			break;
		case("h-hex"):
			draw_hex_cells(false);
			break;
		default:
			alert("ERROR: malformed cell shape request!")
			break;	
	}
	
	
	var canvasExtents = $('#col-body').width() * 0.9;
	
	if (outputPreviewCanvas.width > canvasExtents)
	{
		var scaleFactor = canvasExtents / outputPreviewCanvas.width;
		outputPreviewCanvas.width = outputCanvas.width * scaleFactor;
		outputPreviewCanvas.height = outputCanvas.height * scaleFactor;
		op_ctx.drawImage(outputCanvas, 0, 0, outputPreviewCanvas.width, outputPreviewCanvas.height);
	}
	else 
	{
		op_ctx.drawImage(outputCanvas, 0, 0);
	}
	
	//pop download button
	resString = "" + outputCanvas.width + "x" + outputCanvas.height;
	
	$('#download-button').text("Download full resolution version (" + resString + "px)");
	
	var dBtn = document.getElementById('d-btn');
	dBtn.addEventListener('click', function (e) {
		dBtn.download = "trixelation_" + Date.now() + ".jpeg";
		var dataURL = outputCanvas.toDataURL('image/jpeg').replace("image/jpeg", "image/octet-stream");
			dBtn.href = dataURL;
});

}
	
	//define a coordinate
	function coord (x, y) 
	{
		this.x = x;
		this.y = y;
	}
	
	//define a cell
	function cell (coords) 
	{
		this.verts = coords;
	}
	
	function draw_hex_cells(vert)
	{
		//equalize hex res with square res
		cellSize *= 3;
		
		var centers=[];
		
		var source = i_ctx.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
		
		var grid_length = Math.round(source.width / cellSize);
		var grid_height = Math.round(source.height / cellSize);
		
		
		//adjust for hex contraction
		if (vert)
		{
			grid_length += 1;
			grid_height *= 2;
		}
		else
		{
			grid_length *= 2;
			grid_height += 1;
		}
		
		
		//collect hex centers	
		for (var x = 0; x < grid_length; x ++)
		{
			for (var y = 0; y < grid_height; y++)
			{
				if (vert)
				{
					var xOffset = (0.5 * cellSize)
					var yOffset = (0.25 * cellSize)
		
					if (y % 2 != 0)
					{
						centers.push(new coord(x * cellSize, (y * cellSize)-(yOffset * y)));
					}
					else
					{
						centers.push(new coord((x * cellSize) + xOffset, (y * cellSize)-(yOffset * y)));
					}
				}
				else
				{
					var xOffset = (0.25 * cellSize)
					var yOffset = (0.5 * cellSize)
					
					if (x % 2 != 0)
					{
						centers.push(new coord((x * cellSize) - (xOffset * x), (y * cellSize)-(yOffset)));
					}
					else
					{
						centers.push(new coord((x * cellSize) - (xOffset * x), (y * cellSize)));
					}
				}
			}
		}
		
		//draw triangles from hex center
		for (var i = 0; i < centers.length; i++)
		{
			var c = centers[i];
			var n = cellSize;
			
			var p=[];

			if (vert)
			{
				p.push(new coord(c.x, c.y + (0.50 * n)));
				p.push(new coord(c.x + (0.50 * n), c.y + (0.25 * n)));
				p.push(new coord(c.x + (0.50 * n), c.y - (0.25 * n)));
				p.push(new coord(c.x, c.y - (0.50 * n)));
				p.push(new coord(c.x - (0.50 * n), c.y - (0.25 * n)));
				p.push(new coord(c.x - (0.50 * n), c.y + (0.25 * n)));
				p.push(new coord(c.x, c.y + (0.50 * n)));				
			}
			else
			{
				p.push(new coord(c.x - (0.25 * n), c.y + (0.50 * n)));
				p.push(new coord(c.x + (0.25 * n), c.y + (0.50 * n)));
				p.push(new coord(c.x + (0.50 * n), c.y));
				p.push(new coord(c.x + (0.25 * n), c.y - (0.50 * n)));
				p.push(new coord(c.x - (0.25 * n), c.y - (0.50 * n)));
				p.push(new coord(c.x - (0.50 * n), c.y));
				p.push(new coord(c.x - (0.25 * n), c.y + (0.50 * n)));				
			}

			for (var j = 0; j < 6; j ++)
			{
				drawTriangle(p[j], c, p[j+1]);
			}
			
			
		}

		
		
	}
	
	function draw_square_cells()
	{
		var cells=[];
		var source = i_ctx.getImageData(0, 0, inputCanvas.width, inputCanvas.height);

		//calculate the output grid
		var grid_length = Math.round(source.width / cellSize);
		var grid_height = Math.round(source.height / cellSize);		
		
		//get the cells
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
		
		//draw the cells		
		for (var i = 0; i < cells.length; i++)
		{
			var c = cells[i];
				
			switch ($('input[name="bisect-dir"]:checked').val())
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
		if (!$('#cell-borders').is(":checked"))
		{
			o_ctx.lineWidth=0;
		}
		else
		{
			o_ctx.lineWidth=0.5;
		}
		
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
		}
		
	}
	
	function getPointColor (a,b,c)
	{
		//get triangle centroid
		var centroid = new coord(((a.x + b.x + c.x) / 3), ((a.y + b.y + c.y) / 3));
		//get pixel
		try
		{
			var p = i_ctx.getImageData(centroid.x, centroid.y, 1, 1).data; 
			//get color
			var hex = ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
			return hex;
		}
		catch(err)
		{
			//if we can't find a pixel, we're outside the supplied image, so toss up a transparent pixel
			return "#00FFFFFFF";
		}
	}
	
	function rgbToHex(r, g, b) 
	{
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
	}
	
});