'use strict';

/**
 * Demonstration of usage, as node.js module
 * @module
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const path = require('path');
const nodeW3CValidator = require('../lib/validator');

// ----------------------------------------
// Private
// ----------------------------------------

const testFilePath = path.join(__dirname, '/**/*.html');
const resultFolder = path.join(__dirname, '../results/vnu.html');

// ----------------------------------------
// Public
// ----------------------------------------

nodeW3CValidator(testFilePath, {
	format: 'html'
}, function (err, output) {
	if (err === null) {
		return console.log('ok');
	}
	console.log('Resulting report will be written in path:');
	console.log(resultFolder);
	nodeW3CValidator.writeFile(resultFolder, output);
});

// ----------------------------------------
// Exports
// ----------------------------------------
