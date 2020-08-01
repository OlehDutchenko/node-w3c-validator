// -----------------------------------------------------------------------------
// Deps
// -----------------------------------------------------------------------------

const path = require('path');
const chalk = require('chalk');
const eslintFormatter = require('eslint-formatter-pretty');

/**
 * @param {string} filePath
 * @returns {string}
 */
const getFilePath = (filePath) => {
	if (/^file:/.test(filePath)) {
		filePath = '.' + path.normalize(filePath)
			.replace(/^file:[\\/]/, '')
			.replace(process.cwd(), '')
			.replace(/\\/g, '/');
	}
	return filePath;
};

/**
 * @param message
 * @returns {{warn: number, nonDocument: boolean, error: number, fatal: boolean}}
 */
const hasProblems = (message) => {
	const result = {
		nonDocument: false,
		fatal: false,
		warn: 0,
		error: 0
	};
	switch (message.type) {
		case 'info':
			if (message.subType === 'warning') {
				result.warn = 1;
			}
			break;
		case 'error':
			if (message.subType === 'fatal') {
				result.fatal = true;
			}
			result.error = 1;
			break;
		case 'non-document-error':
			result.nonDocument = true;
			result.warn = 1;
			break;
	}
	return result;
};

/**
 * @param {Message[]} messages
 * @return {Object<EslintResult>} files
 */
const parseMessages = (messages) => {
	const files = {};
	messages.forEach((message) => {
		try {
			const { url } = message;
			const { warn, error, fatal, nonDocument } = hasProblems(message);
			if (warn || error) {
				if (!files.hasOwnProperty(url)) {
					const filePath = getFilePath(message.url);
					files[url] = {
						filePath,
						messages: [],
						errorCount: 0,
						warningCount: 0
					};
				}

				const msgType = nonDocument ? chalk.magenta('Non Document Error  ')
					: error ? chalk.redBright('Error   ') : chalk.yellow('Warning ');
				files[url].messages.push({
					fatal,
					message: msgType + (message.message || 'Unknown error').replace(/(^\s+|\s+$)/, ''),
					severity: error ? 2 : 1,
					source: message.extract,
					line: message.firstLine || message.lastLine,
					column: message.firstColumn || message.lastColumn
				});
				files[url].errorCount += error;
				files[url].warningCount += warn;
			}
		} catch (e) {
			console.log(e.message);
		}
	});
	return files;
};

/**
 * @param {OutputJSONFormat} json
 * @returns {EslintReport} result
 */
const transformW3CtoEslint = (json) => {
	const files = parseMessages(json.messages);
	const report = {
		results: [],
		errorCount: 0,
		warningCount: 0
	};
	for (let url in files) {
		if (files.hasOwnProperty(url)) {
			const file = files[url];
			report.results.push(file);
			report.errorCount += file.errorCount;
			report.warningCount += file.warningCount;
		}
	}
	return report;
};

/**
 * @param {OutputJSONFormat} json
 */
const lintFormat = (json) => {
	const report = transformW3CtoEslint(json);
	return eslintFormatter(report.results);
};

module.exports = lintFormat;

// -----------------------------------------------------------------------------
// Defionitions
// -----------------------------------------------------------------------------

/**
 * @typedef {Object} OutputJSONFormat
 * @see {@link https://github.com/validator/validator/wiki/Output-%C2%BB-JSON}
 * @property {Message[]} messages
 * @property {string} [url]
 * @property {Source} [source]
 * @property {string} [language]
 */

/**
 * @typedef {Object} Message
 * @see {@link https://github.com/validator/validator/wiki/Output-%C2%BB-JSON#message-objects}
 * @property {'info' | 'error' | 'non-document-error'} type
 * @property {'warning' | 'fatal' | 'io' | 'schema' | 'internal'} [subType]
 * @property {string} [message]
 * @property {string} [extract]
 * @property {number} [offset]
 * @property {string} [url]
 * @property {number} [firstLine]
 * @property {number} [firstColumn]
 * @property {number} [lastLine]
 * @property {number} [lastColumn]
 */

/**
 * @typedef {Object} Source
 * @property {string} code
 * @property {string} type
 * @property {string} encoding
 */

/**
 * @typedef {Object} EslintReport
 * @property {EslintResult[]} results
 * @param {number} errorCount
 * @param {number} warningCount
 */

/**
 * @typedef {Object} EslintResult
 * @param {string} filePath
 * @param {EslintMessage[]} messages
 * @param {number} errorCount
 * @param {number} warningCount
 */

/**
 * @typedef {Object} EslintMessage
 * @property {boolean} [fatal]
 * @property {string} [ruleId]
 * @property {1|2} [severity]
 * @property {number} [line]
 * @property {number} [column]
 * @property {string} [message]
 * @property {string} [source]
 */
