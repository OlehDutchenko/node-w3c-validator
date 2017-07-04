'use strict';

/**
 * VNU class for validation of given path,
 * based on `vnu-jar`
 * @module
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const exec = require('child_process').exec;
const vnuJar = require('vnu-jar');
const _ = require('lodash');

const renderHtml = require('./render-html');

// ----------------------------------------
// Private
// ----------------------------------------

/**
 * vnu command
 * @const {string}
 * @private
 * @sourceCode
 */
const vnuCmd = `java -Xss1024k -jar ${vnuJar}`;

/**
 * List of command line arguments without value
 * @const {Array.<string>}
 * @private
 * @sourceCode
 */
const booleanArgs = [
	'errorsOnly',
	'exitZeroAlways',
	'noStream',
	'skipNonHtml',
	'verbose',
	'version'
];

/**
 * List of available formats.
 * @const {Map}
 * @private
 * @sourceCode
 */
const formatList = new Map([
	['gnu', true],
	['xml', true],
	['json', true],
	['text', true]
]);

/**
 * Transform string from camelCase style to dash
 * @param {string} str
 * @returns {string}
 * @private
 * @sourceCode
 */
function camel2dash (str) {
	return str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
}

/**
 * Get arguments from given object
 * @param {Object} [options={}]
 * @returns {Array}
 * @private
 * @sourceCode
 */
function getArgsFromObject (options = {}) {
	let argv = [];
	if (options.outputAsHtml) {
		options.format = 'json';
	}

	let format = options.format;

	if (formatList.get(format)) {
		argv.push(`--format ${format}`);
	}

	if (options.asciiquotes === 'yes') {
		argv.push('--asciiquotes yes');
	}

	booleanArgs.forEach(key => {
		if (options[key]) {
			argv.push(`--${camel2dash(key)}`);
		}
	});

	return argv;
}

// ----------------------------------------
// Public
// ----------------------------------------

/**
 * Validate given path
 * @param {string} validationPath
 * @param {Object} clientOptions
 * @param {Function} done
 */
function validate (validationPath, clientOptions, done) {
	let options = _.cloneDeep(clientOptions);
	let execPath = [vnuCmd].concat(getArgsFromObject(options), validationPath);

	exec(execPath.join(' '), function (err, stdout, stderr) {
		let output = stdout;

		if (err !== null) {
			output = stderr;

			if (options.outputAsHtml) {
				output = renderHtml(output);
			}
		}
		done(err, output);
	});
}

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = validate;
