objectDetection = (base64String) => {
	const data = JSON.stringify({
		image_base64: base64String,
	});

	const xhr = new XMLHttpRequest();

	// Disable line below because console error
	//xhr.withCredentials = true;

	xhr.addEventListener('readystatechange', function () {
		if (this.readyState === this.DONE) {
			loadingEnd();
			$('#btn-restart').toggle();
			parseDetectedObjects(this.responseText);
		}
	});

	xhr.open(
		'POST',
		'https://apis.sentient.io/microservices/cv/objectdetection/v0.1/getpredictions'
	);
	xhr.setRequestHeader('content-type', 'application/json');
	xhr.setRequestHeader('x-api-key', apikey);

	xhr.send(data);
};

parseDetectedObjects = (Objects) => {
	let objects = JSON.parse(Objects);
	let unsortedObjects = [];

	for (item in objects) {
		let objectName = objects[item][0].split(' : ')[0];
		let location = objects[item][1]['Bounding Box'];
		unsortedObjects.push([objectName, location]);
	}

	// Order items alphabetically
	let sortedObjects = unsortedObjects.sort((a, b) => {
		a[0].localeCompare(b[0], 'es', { sensitivity: 'base' });
	});

	// Group ordered items
	let pharsedObjects = sortedObjects.reduce((r, e) => {
		// get first letter of name of current element
		let category = e[0];
		// if there is no property in accumulator with this letter create it
		if (!r[category]) {
			r[category] = { category, objects: [e] };
		}
		// if there is push current element to children array for that letter
		else {
			// Push unique id to object
			r[category].objects.push(e);
		}
		// return accumulator
		return r;
	}, {});
	handelProcessedObjects(pharsedObjects);
	$('#detectionDescription').html(describeProcessedObjects(pharsedObjects));
};

handelProcessedObjects = (objects) => {
	for (category in objects) {
		let objectsArr = objects[category].objects;
		let color = randomColor(190, 100, 50, 13, 0, 0, 8);
		for (objectIndex in objectsArr) {
			canvasDrawBox(
				objectsArr[objectIndex][1],
				'uploadedPic',
				objectsArr[objectIndex][0],
				objectIndex,
				`hsl(${color})`
			);
		}
	}
};

describeProcessedObjects = (objects) => {
	console.log(`Describing detected objects`);

	let sentence = 'Detected';
	for (item in objects) {
		let amount = objects[item].objects.length;
		let category;
		if (amount === 1) {
			category = objects[item].category;
		} else {
			category = singularToPlural(objects[item].category);
		}

		sentence += ` ${amount} ${category},`;
	}

	console.log(sentence);
	// Replace last comma with full stop
	sentence = sentence.slice(0, -1) + '.';
	// Get the index of last comma and replace with "and"
	let lastCommaIndex = sentence.lastIndexOf(',');
	console.log(`Last comma index is ${lastCommaIndex}`)
	if (lastCommaIndex > 1) {
		sentence =
			sentence.slice(0, lastCommaIndex) +
			' and' +
			sentence.slice(lastCommaIndex + 1, sentence.length);
	}

	return sentence;
};

singularToPlural = (word) => {
	let esPlural = ['bus', 'bench', 'wine glass', 'sandwich'];
	let noPlural = ['scissors', 'sheep'];
	let vesPlural = ['giraffe', 'knife'];

	word = $.trim(word);

	console.log(word);

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
