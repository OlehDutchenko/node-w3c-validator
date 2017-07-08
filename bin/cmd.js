#!/usr/bin/env node

// ----------------------------------------
// Imports
// ----------------------------------------

const program = require('commander');
const pkg = require('../package.json');
const nodeW3CValidator = require('../lib/validator');

// ----------------------------------------
// Private
// ----------------------------------------

program
	.version(pkg.version)
	.usage('[options] <pattern>')
	.option('-i, --input [path]', 'Validate input path')
	.option('-a, --asciiquotes', 'Specifies whether ASCII quotation marks are substituted for Unicode smart quotation marks in messages.')
	.option('-e, --errors-only', 'Specifies that only error-level messages and non-document-error messages are reported (so that warnings and info messages are not reported)')
	.option('-q, --exit-zero-always', 'Makes the checker exit zero even if errors are reported for any documents')
	// .option('--filterfile [filename]', 'Specifies a filename. Each line of the file contains either a regular expression or starts with "#" to indicate the line is a comment. Any error message or warning message that matches a regular expression in the file is filtered out (dropped/suppressed)')
	// .option('--filterpattern [pattern]', 'Specifies a regular-expression pattern. Any error message or warning message that matches the pattern is filtered out (dropped/suppressed)')
	.option('-f, --format [gnu|xml|json|text|html]', 'Specifies the output format for reporting the results')
	.option('-o, --output [path]', 'Write reporting result to the path')
	.option('-s, --skip-non-html', 'Skip documents that don’t have *.html, *.htm, *.xhtml, or *.xht extensions.')
	.option('-H, --html', 'Forces any *.xhtml or *.xht documents to be parsed using the HTML parser')
	.option('--no-stream', 'Forces all documents to be be parsed in buffered mode instead of streaming mode (causes some parse errors to be treated as non-fatal document errors instead of as fatal document errors)')
	.option('-v, --verbose', 'Specifies "verbose" output (currently this just means that the names of files being checked are written to stdout)')
	.parse(process.argv);

const props = [
	'asciiquotes',
	'errorsOnly',
	'exitZeroAlways',
	'format',
	'skipNonHtml',
	'html',
	'stream',
	'verbose'
];

function detectUserOptions () {
	let userOptions = {};

	props.forEach(prop => {
		let value = program[prop];

		if (value !== undefined) {
			userOptions[prop] = value;
		}
	});

	let outputPath = program.output;

	if (typeof outputPath === 'string') {
		userOptions.ouput = outputPath;
	}

	return userOptions;
}

function detectUserInput () {
	let validatePath = program.input;

	if (typeof validatePath !== 'string') {
		validatePath = process.cwd();
	}

	return validatePath;
}

function detectUserOutput (userOptions) {
	let outputPath = program.ouput;

	if (typeof outputPath === 'string') {
		userOptions.ouput = outputPath;
	}
}

// ----------------------------------------
// Public
// ----------------------------------------

const userOptions = detectUserOptions();
const validatePath = detectUserInput();

console.log(userOptions);
console.log(validatePath);

// ----------------------------------------
// Exports
// ----------------------------------------

// console.log(program);
