#!/usr/bin/env node

// ----------------------------------------
// Imports
// ----------------------------------------

const path = require('path');
const chalk = require('chalk');
const program = require('commander');
const pkg = require('../package.json');
const nodeW3CValidator = require('../lib/validator');

// ----------------------------------------
// Private
// ----------------------------------------

// setup
program
	.version(pkg.version)
	.usage('[options] <pattern>')
	.option(
		'-i, --input [path]',
		'Validate input path'
	)
	.option(
		'--exclude [path]',
		'Exclude from input path'
	)
	.option(
		'-a, --asciiquotes',
		'Specifies whether ASCII quotation marks are substituted for Unicode smart quotation marks in messages.'
	)
	.option(
		'-e, --errors-only',
		'Specifies that only error-level messages and non-document-error messages are reported (so that warnings and info messages are not reported)'
	)
	.option(
		'-q, --exit-zero-always',
		'Makes the checker exit zero even if errors are reported for any documents')
	.option(
		'--filterfile [filename]',
		'Specifies a filename. Each line of the file contains either a regular expression or starts with "#" to indicate the line is a comment. Any error message or warning message that matches a regular expression in the file is filtered out (dropped/suppressed)'
	)
	.option(
		'--filterpattern [pattern]',
		'Specifies a regular-expression pattern. Any error message or warning message that matches the pattern is filtered out (dropped/suppressed)'
	)
	.option(
		'-f, --format [gnu|xml|json|text|html|lint]',
		'Specifies the output format for reporting the results'
	)
	.option(
		'-s, --skip-non-html',
		'Skip documents that don’t have *.html, *.htm, *.xhtml, or *.xht extensions.'
	)
	.option(
		'-H, --html',
		'Forces any *.xhtml or *.xht documents to be parsed using the HTML parser'
	)
	.option(
		'--no-langdetect',
		'Disables language detection, so that documents are not checked for missing or mislabeled html[lang] attributes.'
	)
	.option(
		'--no-stream',
		'Forces all documents to be be parsed in buffered mode instead of streaming mode (causes some parse errors to be treated as non-fatal document errors instead of as fatal document errors)'
	)
	.option(
		'-v, --verbose',
		'Specifies "verbose" output (currently this just means that the names of files being checked are written to stdout)'
	)
	.option(
		'-o, --output [path]',
		'Write reporting result to the path'
	)
	.option(
		'-b, --buffersize <size>',
		'1024 * <size> Increase maxBuffer size for child_process.exec, if result output truncated'
	)
	.parse(process.argv);

/**
 * Properties list for auto detecting
 * @const {Array.<string>}
 * @private
 * @sourceCode
 */
const cliProps = [
	'asciiquotes',
	'errorsOnly',
	'exitZeroAlways',
	'format',
	'skipNonHtml',
	'html',
	'stream',
	'verbose',
	'buffersize'
];

/**
 * Detect user's specified properties
 * @returns {Object}
 * @private
 * @sourceCode
 */
function detectUserOptions () {
	let outputPath = program.output;
	let userOptions = {
		output: false,
		exec: {},
		filterfile: program.filterfile,
		filterpattern: program.filterpattern
	};

	cliProps.forEach((prop) => {
		let value = program[prop];

		if ((prop === 'stream' || prop === 'langdetect') && value) {
			return;
		}
		if (value !== undefined) {
			userOptions[prop] = value;

			if (prop === 'buffersize') {
				userOptions.exec.maxBuffer = 1024 * value;
			}
		}
	});
	if (typeof outputPath === 'string' && outputPath.length) {
		userOptions.output = outputPath;
	}
	return userOptions;
}

/**
 * Detect  input path where testing files lies
 * @returns {*}
 */
function detectUserInput () {
	let validatePath = program.input;

	if (typeof validatePath !== 'string') {
		validatePath = process.cwd();
	} else {
		if (!/^(http(s)?:)?\/\//i.test(validatePath)) {
			if (/^\//.test(validatePath)) {
				validatePath = path.resolve(validatePath);
			}
		}
	}
	return validatePath;
}

const userOptions = detectUserOptions();
const validatePath = detectUserInput();
if (program.exclude) {
	userOptions.exclude = program.exclude;
}

// ----------------------------------------
// Initialize
// ----------------------------------------

nodeW3CValidator(validatePath, userOptions, function (err, output) {
	if (err === null) {
		process.exit(0);
	}
	console.log(chalk.red('FOUND ERRORS'));
	let outputPath = userOptions.output;
	if (outputPath) {
		outputPath = path.resolve(outputPath);
		let message = [
			chalk.red('Resulting report will be written in path:'),
			chalk.blue(outputPath.split(path.sep).join('/'))
		].join('\n');
		console.log(message);
		nodeW3CValidator.writeFile(outputPath, output);
	} else {
		console.log(chalk.red('Resulting report:'));
		console.log(output);
	}
	console.log(' ');
	process.exit(1);
});
