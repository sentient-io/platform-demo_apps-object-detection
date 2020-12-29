// Store uploaded original image data
let originalImgData;
let state = {};
let data = {};

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
		let data = state.file.base64.split('base64,')[1];
		loadingStart();
		objectDetection(data)
			.then((result) => {
				// Display detect objets button and display restart button
				$(
					'#btn-main-function, #sample-images-container, #inline-picture-uploader'
				).hide();
				$('#detectObject, #btn-cancel').toggle();
				$('#btn-restart').show();

				//console.log(Object.values(result));

				// Draw result to canvas
				Object.values(result).forEach((e) => {
					let bbox = e[1]['Bounding Box'];
					let detail = {
						canvasID: 'uploadedImg',
						top: bbox.Top,
						bottom: bbox.Bot,
						left: bbox.Left,
						right: bbox.Right,
						object: e[0].split(' : ')[0],
					};
					canvasDrawBox(detail);
				});

				return groupDetectedObjects(result);
			})
			.then((result) => {
				return narrateDetectedObjects(result);
			})
			.then((result) => {
				$('#detectionDescription').html(result);
				//console.log(result);
				$('#loader').hide();
				$('#toggleBoxes').show();
			})
			.catch((err) => {
				//console.log(err);
				// Toggle popup window
				$('#alertTitle').html('Error ' + err.status);
				let errMsg = JSON.parse(err.responseText);
				$('#alertContent').html(errMsg.message);
				$('#alert').modal('toggle');
				loadingEnd();
			});
	}
};
handleCancel = () => {
	$('#single-pic-input').val('');
	$('#single-pic-preview').empty();
	$('#detectObject, #btn-cancel, #single-pic-uploader').toggle();
};

handleRestart = () => {
	$('#single-pic-input').val('');
	$('#s-img-preview, #s-img-preview-base, #detectionDescription').empty();
	$('#btn-restart, #toggleBoxes, #inline-picture-uploader').hide();
	$('#s-img-uploader, #sample-images-container').show();
};

canvasDrawBox = (location, picId, objectName, objectID, boxColor) => {
	//picId: base image
	// Location: array with 4 position number
	let y = location.Top * canvasResizeRatio;
	let x = location.Left * canvasResizeRatio;
	let width = location.Right * canvasResizeRatio - x;
	let height = location.Bot * canvasResizeRatio - y;

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
	//txtCtx.fillStyle = boxColor;
	txtCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';

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

toggleCanvasBox = () => {
	//console.log('toggled once');
	$('#s-img-preview-container, #s-img-preview-base').toggle();
};

selectImage = (e) => {
	let base64 = e.src;
	let id = e.id;
	state.file = { base64: base64, name: id, type: 'image/jpeg' };

	previewImg(e.src);
};
