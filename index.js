'use strict';

/**
 * Description
 * @module
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const path = require('path');
const validate = require('./lib/validate');

// ----------------------------------------
// Private
// ----------------------------------------

const testFilePath = path.join(__dirname, './tmp/');
const destFolder = path.join(__dirname, './results/vnu.html');

console.log(testFilePath);

// ----------------------------------------
// Public
// ----------------------------------------

validate(testFilePath, {
	format: 'text',
	skipNonHtml: true,
	verbose: true,
	outputAsHtml: true
}, function (err, output) {
	if (err === null) {
		return console.log('ok');
	}
	validate.writeFile(destFolder, output);
});

// ----------------------------------------
// Exports
// ----------------------------------------
