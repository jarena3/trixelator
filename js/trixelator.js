/*
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
  $('[data-toggle="tooltip"]').tooltip();
})

$('.dropdown-toggle').dropdown();
	 
	 
//globals for the source
var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);
var inputPreviewCanvas = document.getElementById('inputPreviewCanvas');
var ip_ctx = inputPreviewCanvas.getContext('2d');
var inputImage;

//globals for the options
var cellSize = 20;
var colorSampleRadius = 1;
var sliceCount = 1;
var noisePattern;
var fill;
var sample;

//globals for the output
var loadingModal = $('.loading');
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
	
	 $('#cell-size-slider').slider().on('slide', function(slideEvt) {
			calculateComplexity();
	});

	
//get image from loader
function handleImage(e){
    var reader = new FileReader();
	var canvasExtents = $('#preview').width() * 0.9;
	
    reader.onload = function(event){
        inputImage = new Image();
        inputImage.onload = function(){
					
            inputPreviewCanvas.width = inputImage.width;
            inputPreviewCanvas.height = inputImage.height;

			inputCanvas.style.display="none";
			
			if (inputPreviewCanvas.width > 1000)
			{
				var scaleFactor = 1000 / inputPreviewCanvas.width;
				inputPreviewCanvas.width = inputImage.width = inputImage.width * scaleFactor;
				inputPreviewCanvas.height = inputImage.height = inputImage.height * scaleFactor;
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

		setTimeout(function() {
		calculateComplexity();
		}, 150);	
	
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
		$('#p-warning-div').html('');
		
		loadingModal.modal('show');

		setTimeout(function() {
		render();
		}, 500);

		setTimeout(function() {
		loadingModal.modal('hide');
		}, 1000);
	}
	else
	{
		$('#warning-div').append('<div class="alert alert-danger alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Error!</strong> No image selected! Select an image and try again.</div>');
	}
});


function render()
{
	var start = new Date().getTime();
	
	dbtnDiv.style.display="initial";
	
	sample = $('input[name="color-sample"]:checked').val();
	fill = $('input[name="fill"]:checked').val()
	
	cellSize = $('#cell-size-slider').slider().slider('getValue');
	
	outputCanvas.width = outputPreviewCanvas.width = inputImage.width;
	outputCanvas.height = outputPreviewCanvas.height = inputImage.height;
		
	var noiseImg = document.getElementById("noise");
	noisePattern = o_ctx.createPattern(noiseImg, "repeat");
			
	
	switch ($('input[name="cell-shape"]:checked').val())
	{
		case("square"):
			draw_square_cells();
			break;
		case("hex"):
			draw_hex_cells();
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
	

	if ($('input[name="format"]:checked').val() === "png")
	{	
		$('#download-button').text("Download full resolution PNG (" + resString + "px)");
	
		var dBtn = document.getElementById('d-btn');
		dBtn.addEventListener('click', function (e) {
			dBtn.download = "trixelation_" + Date.now() + ".png";
			var dataURL = outputCanvas.toDataURL('image/png').replace("image/png", "image/octet-stream");
				dBtn.href = dataURL;	
						});
	}
	else
	{
		$('#download-button').text("Download full resolution JPG (" + resString + "px)");
		
		var dBtn = document.getElementById('d-btn');
		dBtn.addEventListener('click', function (e) {
			dBtn.download = "trixelation_" + Date.now() + ".jpg";
			var dataURL = outputCanvas.toDataURL('image/jpg').replace("image/jpg", "image/octet-stream");
				dBtn.href = dataURL;	
						});
	}

		
	var end = new Date().getTime();
	var time = end - start;
	console.log('Execution time: ' + time);
}
/*
	//facebook post button
	$('#fb-d-btn').click(function() 
	{
		FB.api(
			"/me/photos",
			"POST",
			{
				"url": outputCanvas.toDataURL('image/jpg').replace("image/jpg", "image/octet-stream")
			},
			function (response) {
			  if (response && !response.error) {
				alert("Trixelation posted to facebook!");
			  }
			}
		);
	});*/
	
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
	
	function draw_hex_cells()
	{
		//equalize hex res with square res
		cellSize *= 2;
		
		var centers=[];
		
		var grid_length = Math.round(inputPreviewCanvas.width / cellSize);
		var grid_height = Math.round(inputPreviewCanvas.height / cellSize);
		
		var vert = true;
		if ($('input[name="tile-dir"]:checked').val() === "horiz")
		{
			vert = false;
		}
		
		
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

		//calculate the output grid
		var grid_length = Math.round(inputPreviewCanvas.width / cellSize);
		var grid_height = Math.round(inputPreviewCanvas.height / cellSize);		
		
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
		
		console.log(cells.length + " cells generated");
		
		//draw the cells
		var cl = cells.length;
		for (var i = 0; i < cl; i++)
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
		var centroid = new coord(((a.x + b.x + c.x) / 3), ((a.y + b.y + c.y) / 3));

		switch (fill)
		{
			case ("solid"):
				o_ctx.fillStyle = o_ctx.strokeStyle = getColor(centroid);
				break;
			case ("gradient-l"):
				var gradient = o_ctx.createLinearGradient(a.x,a.y,b.x,b.y);
				gradient.addColorStop(0,getColor(a));
				gradient.addColorStop(1,getColor(b));
				o_ctx.fillStyle = o_ctx.strokeStyle = gradient;
				break;
			case ("gradient-r"):
				var gradient = o_ctx.createRadialGradient(centroid.x, centroid.y, 1, centroid.x, centroid.y, cellSize/2);
				gradient.addColorStop(0,getColor(centroid));
				gradient.addColorStop(1,getColor(c));
				o_ctx.fillStyle = o_ctx.strokeStyle = gradient;
				break;
			default:
				break;
		}
			
		o_ctx.beginPath();
		if (!$('#cell-borders').is(":checked"))
		{
			o_ctx.lineWidth=0;
		}
		else
		{
			o_ctx.lineWidth=1;
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
	
	function getColor (point)
	{
		//get pixel
		var hex;
		
		try
		{
		
		switch (sample)
		{
			case ("1px"):
				var p = ip_ctx.getImageData(point.x, point.y, 1, 1).data;
				hex = rgbToHex(p[0], p[1], p[2]);
				break;
			case ("5px"):
				var p = ip_ctx.getImageData(point.x, point.y, 5, 5).data;
				var hex = rgbToHex(p[0], p[1], p[2]);
					for (var i = 4; i < p.length; i += 4)
					{
						hex = $.xcolor.average(hex, rgbToHex(p[i+0], p[i+1], p[i+2]));					
					}
				break;
			case ("10px"):
				var p = ip_ctx.getImageData(point.x, point.y, 10, 10).data;
				var hex = rgbToHex(p[0], p[1], p[2]);
					for (var i = 4; i < p.length; i += 4)
					{
						hex = $.xcolor.average(hex, rgbToHex(p[i+0], p[i+1], p[i+2]));
					}
				break;
			case ("rnd"):
				var p = ip_ctx.getImageData(getRandomInt(0, inputPreviewCanvas.width), getRandomInt(0, inputPreviewCanvas.height), 1, 1).data;
				hex = rgbToHex(p[0], p[1], p[2]);
				break;
			default:
				break;
		}
			return hex;
		}
		catch(err)
		{
			//if we can't find a pixel, we're outside the supplied image, so toss up a transparent pixel
			return "#00FFFFFFF";
		}
	}
	
	function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	function rgbToHex(r, g, b) {
		return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	}
	
 
	 $('.btn').on('click', function() {
		setTimeout(function() {
			calculateComplexity();
			}, 150);
	});
	
	 function calculateComplexity()
	 {

		if (inputImage != null)
		{
			var base = 100 * (5 / $('#cell-size-slider').slider().slider('getValue'));
						
			if (inputPreviewCanvas.width < 900)
			{
				base -= 10;
			}
			
			if (inputPreviewCanvas.width < 500)
			{
				base -= 15;
			}
								
			var multiplier = 1;
			
			switch (($('input[name="color-sample"]:checked').val()))
			{
				case ("5px"):
					multiplier += 3;
					break;
				case ("10px"):
					multiplier += 9;
					break;
				default:
					break;
			}
			
			switch (($('input[name="fill"]:checked').val()))
			{
				case ("solid"):
					break;
				default:
					multiplier += 1;
					break;
			}
			
			var complexity = base * multiplier;

			if (complexity > 100)
			{
				complexity = 100;
			}
				
			var bar = document.getElementById("bar");
			
			bar.style.width = complexity + "%";
			bar.setAttribute("aria-valuenow", complexity);

			if (complexity > 85)
			{
				bar.className = "progress-bar progress-bar-danger";
				if ($('#p-warning-div').html()=== '')
				{
				$('#p-warning-div').append('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Warning!</strong> This will take a little while to render, especially on older computers. Just a heads up.</div>');
				}
			}
			else if (complexity > 60)
			{
				bar.className = "progress-bar progress-bar-warning";
				$('#p-warning-div').html('');
			}
			else
			{
				bar.className = "progress-bar progress-bar-success";
				$('#p-warning-div').html('');
			}
					
		}		 
	 }
	 
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	
});