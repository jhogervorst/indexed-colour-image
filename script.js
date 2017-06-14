var imageInput = $id('image');
var colorsInput = $id('colors');
var downloadButton = $id('download');
var outputCanvas = $id('canvas');
var outputContext = outputCanvas.getContext('2d');
var inputCanvas, inputContext;

var generateImage = debounce(function() {
	if (!inputCanvas) return;

	var imageData = inputContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
	var pixels = imageData.data;
	var divider = Math.round(255 / (colorsInput.value - 1));

	for (var i = 0; i < pixels.length; i += 4) {
		pixels[i  ] = Math.round((pixels[i  ]) / divider) * divider; // R
		pixels[i+1] = Math.round((pixels[i+1]) / divider) * divider; // G
		pixels[i+2] = Math.round((pixels[i+2]) / divider) * divider; // B
	}

	outputCanvas.width = inputCanvas.width;
	outputCanvas.height = inputCanvas.height;
	outputContext.putImageData(imageData, 0, 0);
}, 100);

colorsInput.onchange = colorsInput.oninput = function(event) {
	$id('colors-value').textContent = this.value;
	var generateImmediate = event.type != 'input';
	generateImage(generateImmediate);
};

colorsInput.onchange({});

downloadButton.onclick = function() {
	if (!inputCanvas) return false;

	downloadButton.download = imageInput.files[0].name.replace(/\.[^.]+$/, '') + ' (' + colorsInput.value + ' Indexed).png';
	downloadButton.href = outputCanvas.toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');
}

imageInput.onchange = function(event) {
	if (!event.target.files || !event.target.files.length) return;
	if (!event.target.files[0].type.match(/^image\//i)) {
		alert("Please select an image file.");
		return;
	}

	loadInputFromFile(event.target.files[0]);
};

function loadInputFromFile(file) {
	var fileReader = new FileReader();
	fileReader.onload = function(event) {
		loadInputFromDataURL(event.target.result);
	};
	fileReader.readAsDataURL(file);
};

function loadInputFromDataURL(dataURL) {
	var image = new Image();
	image.onload = function() {
		loadInputFromImage(image);
	};
	image.src = dataURL;
};

function loadInputFromImage(image) {
	if (!inputCanvas) {
		inputCanvas = document.createElement('canvas');
		inputContext = inputCanvas.getContext('2d');
	}

	inputCanvas.width = image.width;
	inputCanvas.height = image.height;
	inputContext.drawImage(image, 0, 0);

	generateImage(true);
};

function $id(id) {
	return document.getElementById(id);
};

// Modified from https://davidwalsh.name/javascript-debounce-function
function debounce(func, wait) {
	var timeout;
	return function(immediate) {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (immediate) func.apply(context, args);
	};
};
