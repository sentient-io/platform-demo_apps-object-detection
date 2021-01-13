/* +---------------------------+ */
/* | Call Object Detection API | */
/* +---------------------------+ */
objectDetection = (base64) => {
	return new Promise((resolve, reject) => {
		//console.log('Start Calling Object Detection API');

		$.ajax({
			method: 'POST',
			url:
				'https://apis.sentient.io/microservices/cv/objectdetection/v0.1/getpredictions',
			headers: { 'x-api-key': apikey, 'Content-Type': 'application/json' },
			data: JSON.stringify({ image_base64: base64 }),
			success: (result) => {
				//console.log('Object Detection Success');
				resolve(result);
			},
			error: (err) => {
				//console.log('Object Detection Error');
				reject(err);
			},
		});
	});
};

/* +-----------------------+ */
/* | Group Detected Object | */
/* +-----------------------+ */
/* Convert returned value to organised group */
groupDetectedObjects = (sParam) => {
	//console.log('Grouping Detected Objects');
	return new Promise((resolve, reject) => {
		let param;
		if (sParam.constructor == String) {
			param = JSON.parse(sParam);
		} else {
			param = sParam;
		}
		let result = {};
		for (key in param) {
			let object = param[key][0].split(' : ')[0];
			let confidence = param[key][0].split(' : ')[1];
			let sBoundingBox = param[key][1]['Bounding Box'];
			let location = {
				left: sBoundingBox.Left,
				top: sBoundingBox.Top,
				right: sBoundingBox.Right,
				bottom: sBoundingBox.Bot,
			};
			let size = {
				width: sBoundingBox.Right - sBoundingBox.Left,
				height: sBoundingBox.Bot - sBoundingBox.Top,
			};
			let detail = {
				object: object,
				confidence: confidence,
				location: location,
				size: size,
			};
			if (!result[`${object}`]) {
				detail.id = 1;
				result[`${object}`] = {};
				result[`${object}`][`${object}-1`] = detail;
			} else {
				let id = Object.keys(result[`${object}`]).length + 1;
				detail.id = id;
				result[`${object}`][`${object}-${id}`] = detail;
			}
		}
		data.detectedObjects = result;
		resolve(result);
	});
};

/* +--------------------+ */
/* | Filter By Category | */
/* +--------------------+ */
/* Filter all detectd object by category */
filterByCategory = (category, source) => {
	let result = {};

	category.forEach((index) => {
		if (source[index]) {
			result[`${index}`] = source[index];
		}
	});

	return result;
};

/* +-------------------------+ */
/* | Narrate Detected Object | */
/* +-------------------------+ */
narrateDetectedObjects = (sParam) => {
	return new Promise((resolve, reject) => {
		let sentence = '';
		let be = Object.keys(sParam).length == 1 ? 'is' : 'are';
		let categoryArry = Object.keys(sParam).sort();

		if (categoryArry[0] === undefined) {
			// Case : no detected object
			sentence = 'Sorry, no object detected, please try another picture.';
			state.noDetection = true;
		} else if (categoryArry.length === 1) {
			// Case : 1 type of object detected
			let objectCount = Object.values(sParam[categoryArry[0]]).length;
			objectCount > 1 ? (be = 'are') : be;
			let categoryName =
				objectCount > 1 ? singularToPlural(categoryArry[0]) : categoryArry[0];
			sentence =
				'There' + ' ' + be + ' ' + objectCount + ' ' + categoryName + '.';
		} else {
			// Case : multiple types of object detected
			//console.log(categoryArry);
			categoryArry.forEach((category) => {
				let objectCount = Object.values(sParam[category]).length;
				objectCount > 1 ? (be = 'are') : be;
				let categoryName =
					objectCount > 1 ? singularToPlural(category) : category;
				let comma = ', ';
				let and = '';
				// For second last item, remove comma
				category == categoryArry[categoryArry.length - 2]
					? (comma = ' ')
					: comma;
				// For last item, chagne comma to fullstop, add "and"
				category == categoryArry[categoryArry.length - 1]
					? ((comma = '.'), (and = 'and '))
					: comma;
				sentence += and + objectCount + ' ' + categoryName + comma;
			});
			sentence = 'There' + ' ' + be + ' ' + sentence;
		}
		data.description = sentence;
		resolve(sentence);
	});
};

/* +-------------------------------+ */
/* | Convert object name to plural | */
/* +-------------------------------+ */
singularToPlural = (word) => {
	let esPlural = ['bus', 'bench', 'wine glass', 'sandwich'];
	let noPlural = ['scissors', 'sheep'];
	let vesPlural = ['knife'];

	word = $.trim(word);

	//console.log(word);

	if (word === 'person') {
		return 'people';
	} else if (word === 'mouse') {
		return 'mice';
	} else if (esPlural.includes(word)) {
		return word + 'es';
	} else if (vesPlural.includes(word)) {
		return word.replace('fe', 'ves');
	} else if (noPlural.includes(word)) {
		return word;
	} else {
		return word + 's';
	}
};

/* +-------------------------------------+ */
/* | Render description sentence to HTML | */
/* +-------------------------------------+ */
displayDescription = (sParam) => {
	let description = document.createElement('div');
	$(description).html(`<p>${sParam}</p>`);
	$(description).addClass('s-img-narration-description');
	$(description).attr(
		'style',
		`max-width:${data.file.sWidth * data.file.resizeRatio + 20}px`
	);
	$('#s-img-preview').append(description);
};
