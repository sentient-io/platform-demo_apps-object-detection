// Toggle popup alert window
toggleAlert = (alertTitle, alertMsg) => {
	$('#alertContent').html(alertMsg);
	$('#alertTitle').html(alertTitle);
	$('#alert').modal('toggle');
};

handleImageProcessing = () => {
	// Handel if no API key
	if (apikey == 'ENTER YOUR API KEY') {
		// Toggle popup window
		$('#alertTitle').html('Missing API Key');
		$('#alertContent').html(
			'For security purpose, we removed the API key <br> Please place your api key in app.js file'
		);
		$('#alert').modal('toggle');
	} else {
		// Return base64 string as data
		let data = document
			.getElementById('uploadedPic')
			.toDataURL()
			.split('base64,')[1];
		$('#detectObject, #btn-cancel').toggle();
		loadingStart();
		console.log(data);
		objectDetection(data);
	}
};
handleCancel = () => {
	$('#single-pic-input').val('');
	$('#single-pic-preview').empty();
	$('#detectObject, #btn-cancel, #single-pic-uploader').toggle();
};

handleRestart = () => {
	$('#single-pic-input').val('');
	$('#single-pic-preview, #detectionDescription').empty();
	$('#btn-restart, #single-pic-uploader').toggle();
};

canvasDrawBox = (location, picId, objectName, objectID, boxColor) => {
	//picId: base image
	// Location: array with 4 position number
	let y = location.Top;
	let x = location.Left;
	let width = location.Right - x;
	let height = location.Bot - y;

	// Prevent API from return negative value
	if (y < 0) {
		y = 0;
	} else if (x < 0) {
		x = 0;
	}

	let canvas = document.getElementById(picId);
	let ctx = canvas.getContext('2d');
	ctx.beginPath();
	ctx.lineWidth = '1';
	ctx.strokeStyle = boxColor;
	ctx.rect(x, y, width, height);
	ctx.stroke();

	// Draw object name with ID on canvas
	let txtCtx = canvas.getContext('2d');
	txtCtx.font = '12px sans-serif';
	txtCtx.textBaseline = 'top';
	txtCtx.fillStyle = boxColor;

	let txtWidth = txtCtx.measureText(objectName + ' - ' + objectID).width;
	txtCtx.fillRect(x, y, txtWidth + 10, 20);

	txtCtx.fillStyle = '#fff';
	txtCtx.fillText(objectName + ' - ' + objectID, x + 5, y + 5);
};

randomColor = (hue, saturate, light, randH, randS, randL, randScale) => {
	// Parametet takes a base H S L value,
	// The random value will be 0 to input value added to base vale
	// RandScalue is for Hue value only, make sure 2 colors are different enough
	let h = hue + Math.floor(Math.random() * randH) * randScale;
	let s = saturate + Math.floor(Math.random() * randS);
	let l = light + Math.floor(Math.random() * randL);
	return `${h}, ${s}%, ${l}%`;
};
