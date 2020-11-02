// 1MB is 1048576
let fileSizeLimit = 1048576 * 5;

let dropArea = document.getElementById('single-pic-uploader');
// Prevent default behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
	dropArea.addEventListener(eventName, preventDefaults, false);
});
function preventDefaults(e) {
	e.preventDefault();
	e.stopPropagation();
}

// Highlight effect when drag files over
['dragenter', 'dragover'].forEach((eventName) => {
	dropArea.addEventListener(eventName, highlight, false);
});
['dragleave', 'drop'].forEach((eventName) => {
	dropArea.addEventListener(eventName, unhighlight, false);
});
function highlight(e) {
	dropArea.classList.add('highlight');
}
function unhighlight(e) {
	dropArea.classList.remove('highlight');
}

//Get the data for the files that were dropped
dropArea.addEventListener('drop', handleDrop, false);
function handleDrop(e) {
	let dt = e.dataTransfer;
	let files = dt.files;
	uploadSinglePic(files);
}

//Draw full image to canvas
canvasDrawImage = (base64string, sWidth, sHeight, resize) => {
	// Takes base64string, source Width and Height
	// Resize will be the size of rendered canvas
	let dWidth;
	let dHeight;
	if (sWidth >= sHeight) {
		// When image is landscape
		dWidth = resize;
		dHeight = (sHeight * dWidth) / sWidth;
	} else {
		// When image is portrait
		dHeight = resize;
		dWidth = (sWidth * dHeight) / sHeight;
	}
	let canvas = document.createElement('canvas');
	canvas.setAttribute('width', dWidth);
	canvas.setAttribute('height', dHeight);
	let ctx = canvas.getContext('2d');
	var image = new Image();
	image.onload = () => {
		ctx.drawImage(image, 0, 0, sWidth, sHeight, 0, 0, dWidth, dHeight);
	};
	image.src = base64string;
	return canvas;
};

// Handle picture preview
uploadSinglePic = (files) => {
	if (files[0].size >= fileSizeLimit) {
		let errTitle = 'File Size Too Big';
		let errMsg =
			'For demo purpose, we are limiting file size to 5MB. Please try another image.';
		toggleAlert(errTitle, errMsg);
		// Clear record of uploaded file
		$('#single-pic-input').val('');
	} else {
		// Preview uploaded file
		let reader = new FileReader();
		reader.readAsDataURL(files[0]);

		reader.onloadend = () => {
			// Push original image to DOM to retain original pixel
			createSourcePic(reader.result);
			// Draw and resize uploaded image to canvas
			createPreviewPic(reader.result, 600);
		};

		$('#detectObject, #btn-cancel').toggle();
		$('#single-pic-uploader').hide();
	}
};

createSourcePic = (src) => {
	// When send data to API, use base64 string from sourcePic
	// Hidden original size image to retain original pixel

	let sImage = document.createElement('img');
	sImage.setAttribute('id', 'sourcePic');
	sImage.src = src;

	// Hide original image
	$(sImage).hide();

	// Append source image to dom
	$('#single-pic-preview').append(sImage);
};

createPreviewPic = (src, previewPicSize = 600) => {
	// Src is uploaded file src to create image element
	// previewPicSize : Number, determine the size of displayed iamge
	let image = new Image();
	image.src = src;
	image.onload = () => {
		// Update canvasResizeRatio for resizing returned boxes
		if (image.width >= image.height) {
			// Prevent upscaling small images
			if (image.width < previewPicSize) {
				previewPicSize = image.width;
			}
			canvasResizeRatio = previewPicSize / image.width;
		} else {
			if (image.height < previewPicSize) {
				previewPicSize = image.height;
			}
			canvasResizeRatio = previewPicSize / image.height;
		}
		//console.log(canvasResizeRatio)

		let canvas = canvasDrawImage(
			src,
			image.width,
			image.height,
			previewPicSize
		);

		// Render a baseCanvas for toggle boxes on canvas
		let baseCanvas = canvasDrawImage(
			src,
			image.width,
			image.height,
			previewPicSize
		);

		canvas.setAttribute('id', 'uploadedPic');
		baseCanvas.setAttribute('id', 'originalUploadedPic');
		$(baseCanvas).hide();

		$('#single-pic-preview').append(baseCanvas);
		$('#single-pic-preview').append(canvas);
	};
};
