//console.log('Img Uploader Ready');

/* +----------------+ */
/* |  Img Uploader  | */
/* +----------------+ */

// 1MB is 1048576
let fileSizeLimit = 1048576 * 5;
// Limit upload image resolution
let imgDimensionLimit = 416;

let dropArea = document.getElementById('s-img-uploader');
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
	uploadImg(files);
}

// Handle picture preview
uploadImg = (files) => {
	//console.log('Start upload image');
	if (files[0].size >= fileSizeLimit) {
		let errTitle = 'File Size Too Big';
		let errMsg =
			'For demp purpose, we are limiting file size to 5MB. Please try another image.';
		toggleAlert(errTitle, errMsg);
		// Clear record of uploaded file
		$('#single-pic-input').val('');
		//console.log('Error, file size too large');
	} else {
		// Filter out un-supported image format
		checkImgFormat({ inputFormat: files[0].type.split('/')[1] })
			.then(() => {
				// Preview uploaded file
				let reader = new FileReader();
				reader.readAsDataURL(files[0]);
				// Push uploaded image details to state
				state.file = { name: files[0].name, type: files[0].type };

				reader.onloadend = () => {
					// Draw and resize uploaded image to canvas
					previewImg(reader.result, 600);
					// Push original base64 string to state
					state.file.base64 = reader.result;
				};
				//console.log('Image uploaded');
			})
			.catch((error) => {
				//console.log(error);
			});
	}
};

previewImg = (src, previewPicSize = 600) => {
	let image = new Image();
	image.src = src;
	image.onload = () => {
		state.file.sWidth = image.width;
		state.file.sHeight = image.height;
		// Update canvasResizeRatio for resizing returned boxes
		if (image.width < imgDimensionLimit || image.height < imgDimensionLimit) {
			let errTitle = 'Low Image Resolution';
			let errMsg = `Upload image dimension: ${image.width} x ${image.height}px. <br> Please use image with at least ${imgDimensionLimit} x ${imgDimensionLimit}px.`;
			toggleAlert(errTitle, errMsg);
			// Clear record of uploaded file
			handleRestart();
			// //console.log(
			// 	'Low image resolution, please use image with at least 416 x 416px'
			// );
			// return;
		} else if (image.width >= image.height) {
			// Prevent upscaling small images
			if (image.width < previewPicSize) {
				previewPicSize = image.width;
			}
			state.file.resizeRatio = previewPicSize / image.width;
		} else {
			if (image.height < previewPicSize) {
				previewPicSize = image.height;
			}
			state.file.resizeRatio = previewPicSize / image.height;
		}
		////console.log(canvasResizeRatio)

		$('#s-img-uploader').hide();
		// Remove existing preview canvas
		$('#uploadedImg, #uploadedImgBase').remove();
		// Toggle cancel and function button
		$('#btn-main-function, #btn-cancel, #inline-picture-uploader').show();
		// Src is uploaded file src to create image element
		// previewPicSize : Number, determine the size of displayed iamge
		let canvas = canvasDrawImage(
			src,
			image.width,
			image.height,
			previewPicSize
		);

		let baseCanvas = canvasDrawImage(
			src,
			image.width,
			image.height,
			previewPicSize
		);

		canvas.setAttribute('id', 'uploadedImg');

		baseCanvas.setAttribute('id', 'uploadedImgBase');
		$('#s-img-preview').append(canvas);
		$('#s-img-preview-base').append(baseCanvas);
		// Scroll to button area after image uploaded
		window.scroll({
			top: $('#s-img-preview').offset().top - 100,
			left: 0,
			behavior: 'smooth',
		});
	};
};

/* +--------------------------------+ */
/* |  Check Supported Image Format  | */
/* +--------------------------------+ */
checkImgFormat = (param) => {
	let inputFormat = param.inputFormat;
	let acceptedFromat = [
		'bmp',
		'dib',
		'exr',
		'hdr',
		'jpeg',
		'jpg',
		'jpe',
		'jp2',
		'png',
		'pic',
		'pbm',
		'pgm',
		'ppm',
		'pxm',
		'pnm',
		'ras',
		'sr',
		'tiff',
		'tif',
		'webp',
	];
	return new Promise((resolve, reject) => {
		if (acceptedFromat.includes(inputFormat)) {
			resolve();
		} else {
			let errTitle = 'Unsupported File Format';
			let errMsg = `Uploader file foramt: ${inputFormat}. <br><br>Supported formats: bmp, dib, exr, hdr, jpeg, jpg, jpe, jp2, png, pic, pbm, pgm, ppm, pxm, pnm, ras, sr, tiff, tif, webp.`;
			toggleAlert(errTitle, errMsg);
			// Clear record of uploaded file
			$('#single-pic-input').val('');
			reject('Error, unsupported file format.');
		}
	});
};
