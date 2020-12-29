/* +----------------------+ */
/* | Draw image to canvas | */
/* +----------------------+ */
canvasDrawImage = (base64string, sWidth, sHeight, resize = 100) => {
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

/* +------------------------------------------+ */
/* | Draw box to canvas based on bounding box | */
/* +------------------------------------------+ */
canvasDrawBox = (e) => {
	return new Promise((resolve, reject) => {
		let canvasID, x, y, width, height, object, resizeRatio;
		e.canvasID ? (canvasID = e.canvasID) : reject();
		// Resize ratio will not be 1 if the preview image been resized
		state.file.resizeRatio
			? (resizeRatio = state.file.resizeRatio)
			: (resizeRatio = 1);

		x = e.left * resizeRatio;
		y = e.top * resizeRatio;

		// Prevent API from return negative value
		if (y < 0) {
			y = 0;
		} else if (x < 0) {
			x = 0;
		}

		width = e.right * resizeRatio - x;
		height = e.bottom * resizeRatio - y;

		width > 100 ? width : (width = 100);

		e.object ? (object = e.object) : (object = '??');

		let canvas = document.getElementById(canvasID);

		//console.log('canvas height:', canvas.offsetHeight);
		height > canvas.offsetHeight - 80
			? (height = canvas.offsetHeight - 80)
			: height;

		let ctx = canvas.getContext('2d');
		// Draw boxes
		ctx.beginPath();
		ctx.lineWidth = '1';
		ctx.strokeStyle = '#00deff';
		ctx.rect(x, y, width, height);
		ctx.stroke();
		// Draw text background
		ctx.fillStyle = 'rgba(0,222,255,0.7)';
		// x -1 and width + 2 to align with the stroke of bounding box
		ctx.fillRect(x - 1, y, width + 2, 24);
		// Draw text to canvas
		ctx.fillStyle = '#052a30';
		ctx.font = '14px sans-serif';
		ctx.fillText(`${object} `, x - 1 + 5, y + 15);
	});
};
