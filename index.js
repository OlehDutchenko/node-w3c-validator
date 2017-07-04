'use strict';

/**
 * Description
 * @module
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const path = require('path');
const VNU = require('./lib/vnu');

// ----------------------------------------
// Private
// ----------------------------------------

const vnu = new VNU({
	format: 'json',
	skipNonHtml: true,
	verbose: true
});
const testFilePath = path.join(process.cwd(), './tmp/index.html');

// ----------------------------------------
// Public
// ----------------------------------------

vnu.validate(testFilePath, {
	format: 'text'
}, function (err, stdout, stderr) {
	if (err === null) {
		return console.log('ok');
	}

	console.log('error');
	console.log(stdout);
	console.log(stderr);
});

// ----------------------------------------
// Exports
// ----------------------------------------
