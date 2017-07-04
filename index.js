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

const testFilePath = path.join(process.cwd(), './tmp/');

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

	console.log(output);
});

// ----------------------------------------
// Exports
// ----------------------------------------
