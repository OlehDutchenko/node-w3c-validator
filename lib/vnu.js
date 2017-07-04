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

const Transform = require('./transform');

// ----------------------------------------
// Private
// ----------------------------------------

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
 * Also it's a list of available formats from which you can transforming given output string
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
 * List of available formats that can be transformed
 * @const {Map}
 * @private
 * @sourceCode
 */
const outputFormatList = new Map([
	['xml', true],
	['json', true],
	['text', true],
	['html', true]
]);

// ----------------------------------------
// Public
// ----------------------------------------

class VNU {
	/**
	 * Create new sample
	 * @param {Object} [defaultOptions={}]
	 */
	constructor (defaultOptions = {}) {
		this.cmd = `java -Xss1024k -jar ${vnuJar} `;
		this.defaultOptions = _.cloneDeep(defaultOptions);
	}

	/**
	 * Get arguments from given object
	 * @param {Object} [options={}]
	 * @returns {Array}
	 * @static
	 */
	static getArgvFromObject (options = {}) {
		let argv = [];
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

	static transformOutput (output, inputFormat, outputFormat) {
		if (typeof output !== 'string') {
			throw new Error([
				'Error while transforming',
				`output must be an string, given sample is "${typeof output}"`
			].join('\n'));
		}

		if (!formatList.get(inputFormat)) {
			throw new Error([
				'Error while transforming',
				`unknown input format "${inputFormat}"`
			].join('\n'));
		}

		if (!outputFormatList.get(outputFormat)) {
			throw new Error([
				'Error while transforming',
				`unknown output format "${outputFormat}"`
			].join('\n'));
		}

		if (inputFormat === outputFormat) {
			return output;
		}

		return new Transform(output, inputFormat, outputFormat);
	}

	/**
	 * Validate given path
	 * @param {string} validationPath
	 * @param {Object} clientOptions
	 * @param {Function} done
	 */
	validate (validationPath, clientOptions, done) {
		let options = _.merge({}, this.defaultOptions, clientOptions);
		let execPath = [
			this.cmd
		].concat(VNU.getArgvFromObject(options), validationPath);

		exec(execPath.join(' '), done);
	}
}

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = VNU;
