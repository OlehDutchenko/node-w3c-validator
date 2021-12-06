'use strict';

/**
 * validation module,
 * based on `vnu-jar`
 * @module
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const fileset = require('fileset');
const exec = require('child_process').exec;
const vnuJar = require('vnu-jar');
const _ = require('lodash');
const ora = require('ora');

const pkg = require('../package.json');

const renderHtml = require('./render-html');
const lintFormat = require('./lint-format');

// ----------------------------------------
// Private
// ----------------------------------------

/**
 * vnu command
 * @const {string}
 * @private
 * @sourceCode
 */
const vnuCmd = `java -Xss2048k -jar ${vnuJar}`;

/**
 * List of command line arguments without value
 * @const {Array.<string>}
 * @private
 * @sourceCode
 */
const booleanArgs = ['errorsOnly', 'exitZeroAlways', 'skipNonHtml', 'verbose', 'version'];

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
 * Get run options from user settled options
 * @param {Object} [userOptions={}]
 * @returns {Object}
 * @private
 * @sourceCode
 */
function getOptions (userOptions = {}) {
	let options = _.cloneDeep(userOptions);

	if (options.format === 'html') {
		options.outputAsHtml = true;
		options.verbose = true;
		options.format = 'json';
	} else if (options.format === 'lint') {
		options.outputAsLint = true;
		options.verbose = true;
		options.format = 'json';
	}

	return options;
}

/**
 * Get arguments from given object
 * @param {Object} options
 * @returns {Array}
 * @private
 * @sourceCode
 */
function getArgvFromObject (options) {
	let argv = [];
	let format = options.format;

	if (formatList.get(format)) {
		argv.push(`--format ${format}`);
	}

	if (options.asciiquotes) {
		argv.push('--asciiquotes yes');
	}

	if (options.stream === false) {
		argv.push('--no-stream');
	}

	if (options.langdetect === false) {
		argv.push('--no-langdetect');
	}

	if (options.filterfile) {
		argv.push(`--filterfile ${options.filterfile}`);
	}

	if (options.filterpattern) {
		argv.push(`--filterpattern ${options.filterpattern}`);
	}

	if (options.buffersize) {
		argv.push(`--buffersize ${options.buffersize}`);
	}

	booleanArgs.forEach((key) => {
		if (options[key]) {
			argv.push(`--${camel2dash(key)}`);
		}
	});

	return argv;
}

/**
 * @returns {Object}
 */
function getProjectPackageConfig () {
	try {
		const projectPkq = require(path.join(process.cwd(), './package.json'));
		return projectPkq.nodeW3Cvalidator || {};
	} catch (e) {
		return {};
	}
}

/**
 * @param jsonString
 * @returns {{output: string, dropError: boolean}}
 */
function suppress (jsonString) {
	try {
		/** @type {OutputJSONFormat} */
		const json = JSON.parse(jsonString);
		const {
			suppressErrors = [],
			suppressWarnings = []
		} = getProjectPackageConfig();
		if (suppressErrors.length || suppressWarnings.length) {
			json.messages = json.messages.filter((message) => {
				let drop = (
					suppressErrors.find((str) => message.message.includes(str)) ||
					suppressWarnings.find((str) => message.message.includes(str))
				);
				return drop === undefined;
			});
		}
		return {
			output: JSON.stringify(json),
			dropError: json.messages.length === 0
		};
	} catch (e) {
		return {
			output: jsonString,
			dropError: false
		};
	}
}

// ----------------------------------------
// Public
// ----------------------------------------

/**
 * Validate given path
 * @param {string} validationPath
 * @param {Object} userOptions
 * @param {Function} done
 */
function nodeW3CValidator (validationPath, userOptions, done) {
	const spinner = ora(`${pkg.name} - processing ...`).start();
	let exclude;
	if (userOptions.exclude) {
		exclude = userOptions.exclude;
		delete userOptions.exclude;
	}
	let options = getOptions(userOptions);
	let execPath = [vnuCmd].concat(getArgvFromObject(options), fileset.sync(validationPath, exclude));

	// console.log(execPath.join(' '));
	exec(execPath.join(' '), options.exec, function (err, stdout, stderr) {
		let output = stderr;

		if (options.format === 'json' && err) {
			const { output: newOutput, dropError } = suppress(output);
			if (dropError) {
				err = null;
			} else {
				output = newOutput;
			}
		}

		// Test for Java Installed
		try {
			JSON.parse(stderr); // JSON string with empty "messages"
		} catch (e) {
			console.log('\n');
			console.log(chalk.red('ERROR:'), 'An unexpected error has occurred');
			console.log('It looks like you haven\'t installed Java');
			console.log('- https://github.com/dutchenkoOleg/node-w3c-validator#attention');
			console.log('- https://java.com');
			process.exit(1);
		}

		if (err === null) {
			output = stdout;
			spinner.succeed(`${pkg.name} - no errors`);
		} else {
			try {
				if (options.outputAsHtml) {
					output = renderHtml(output);
				} else if (options.outputAsLint) {
					output = lintFormat(JSON.parse(output));
				}
				spinner.fail(`${pkg.name} - found errors`);
			} catch (e) {
				spinner.fail(chalk.red([
					'An error occurred while processing validator execution!',
					e.message
				].join('\n')));
				err = null;
			}
		}

		done(err, output);
	});
}

/**
 * Write file
 * @param {string} filePath
 * @param {string|Buffer} outputData
 * @param {function} [done] - if exist - it will asynchronous writes outputData to the filePath
 */
nodeW3CValidator.writeFile = function (filePath, outputData, done) {
	let dir = path.dirname(filePath);

	if (typeof done === 'function') {
		mkdirp(dir, (err) => {
			if (err) {
				throw new Error(err);
			}
			fs.writeFile(filePath, outputData, done);
		});
	} else {
		mkdirp.sync(dir);
		fs.writeFileSync(filePath, outputData);
	}
};

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = nodeW3CValidator;
