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

const testFilePath = path.join(__dirname, '../tmp/');
const destFolder = path.join(__dirname, '../results/vnu.html');

// ----------------------------------------
// Public
// ----------------------------------------

nodeW3CValidator(testFilePath, {
	format: 'html',
	skipNonHtml: true,
	verbose: true,
	outputAsHtml: true
}, function (err, output) {
	if (err === null) {
		return console.log('ok');
	}
	nodeW3CValidator.writeFile(destFolder, output);
});

// ----------------------------------------
// Exports
// ----------------------------------------
