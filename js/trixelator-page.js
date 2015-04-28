$(document).on('change', '.btn-file :file', function() {
  var input = $(this),
      numFiles = input.get(0).files ? input.get(0).files.length : 1,
      label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
  input.trigger('fileselect', [numFiles, label]);
});

$(document).ready( function() {
	
	$('#hex-options').hide();
	
	var h = $('#cell-details-input').height();
	
	$('#cell-details-input').css('min-height', h + 'px');
	
    $('.btn-file :file').on('fileselect', function(event, numFiles, label) {
        
        var input = $(this).parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;
        
        if( input.length ) {
            input.val(log);
        } else {
            if( log ) alert(log);
        }
        
    });
	
	var madebys = ['Hewn from the living rock by ', 
					'Released from the tombs of ancient kings by ', 
					'Discovered in a cyclopean labyrinth by ', 
					'Lept, fully grown, from the head of ',
					'Based on a song by ',
					'Grown in a reeking vat by',
					'After loosing a roaring laughter, fell and terrible, was lashed together by ',
					'Assembled soullessly and robotically by automaton ID: ',
					'Based on the past life regressions of ',
					'Neither confirmed nor denied by ',
					'Behold ye the folly of ']
					
					
	$('#footer').prepend("" + madebys[getRandomInt(0, madebys.length)]);
	
	
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	 $('.shape-btn').on('click', function() {
		setTimeout(function() {
			setOptions();
			}, 150);
	});
	
	function setOptions()
	{
	switch ($('input[name="cell-shape"]:checked').val())
	{
		case("square"):
			if (!$('#square-options').is(":visible"))
			{
				showSquareOptions();
			}
			break;
		case("hex"):
			if (!$('#hex-options').is(":visible"))
			{
				showHexOptions();
			}
			break;
		default:
			alert("ERROR: malformed cell shape request!")
			break;	
	}
		
	}
	
	function showSquareOptions()
	{
		$('#hex-options').fadeOut(100);
		$('#square-options').delay(110).fadeIn(200);		
	}
	
	function showHexOptions()
	{
		$('#square-options').fadeOut(100);
		$('#hex-options').delay(110).fadeIn(200);
	}

});

