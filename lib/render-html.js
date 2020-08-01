'use strict';

/**
 * Render JSON data into html page
 * @module
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const chalk = require('chalk');

// ----------------------------------------
// Private
// ----------------------------------------

/**
 * HTML template
 * @const {string}
 * @private
 * @sourceCode
 */
const layout = fs.readFileSync(path.join(__dirname, './html/layout.html')).toString();

/**
 * Get part of string and replace special symbols there
 * @param {string} str
 * @param {number} indexA
 * @param {number} [indexB]
 * @returns {string}
 * @private
 * @sourceCode
 */
function extractParts (str, indexA, indexB) {
	let part = str.substr(indexA, indexB);

	part = part.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	part = part.replace(/\n/g, '<span class="invisible"> \u21A9</span>\n');
	part = part.replace(/\t/g, '<span class="invisible tab">\u2192</span>');
	return part;
}

// ----------------------------------------
// Public
// ----------------------------------------

/**
 * Render method
 * @param {string} jsonString
 * @returns {string}
 */
function renderHtml (jsonString) {
	let messages = '';

	try {
		let msg = JSON.parse(jsonString).messages;
		messages = msg;
	} catch (e) {
		console.log('');
		console.log(e.message);

		if (e.message === 'Unexpected token E in JSON at position 1') {
			console.log(chalk.red('Possible cause of error - incorrect path or files were not found'));
		}

		if (e.message === 'Unexpected end of JSON input') {
			console.log(chalk.red('Possible cause of error'));
			console.log('NodeJS maxBuffer to small for your task because child_process stdout being truncated.');
			console.log('Try increase maxBuffer size with:');
			console.log(` ${chalk.gray('-')} CLI --buffersize <size> (1024 * <size>)`);
			console.log(` ${chalk.gray('-')} NodeJs API options.exec.maxBuffer 1024 * <size>`);
			console.log(
				`${chalk.yellow('Readme:')} https://github.com/dutchenkoOleg/node-w3c-validator#-b---buffersize-size`
			);
			console.log('');
		}
		process.exit(1);
	}

	if (!messages.length) {
		return jsonString;
	}

	let views = {};
	let counts = {
		groups: {
			info: 0,
			warning: 0,
			error: 0,
			fatal: 0,
			'non-document-error': 0
		},
		msgGroups: {}
	};

	messages.forEach((item, i) => {
		let key = item.url;
		let msg = item.message;
		let extract = item.extract;

		if (key in views) {
			views[key].list.push(item);
		} else {
			let viewName = key
				.replace(/\\/, '/')
				.split('/')
				.pop();
			let viewAnchor = viewName.replace(/\/|\.|[а-я]|\s/gi, '-');

			views[key] = {
				msgGroup: 1,
				name: viewName,
				anchor: viewAnchor,
				path: key,
				list: [item],
				errorGroups: {},
				errorCounts: {
					info: 0,
					warning: 0,
					error: 0,
					fatal: 0,
					'non-document-error': 0
				}
			};
		}

		let view = views[key];

		if (item.subType === 'warning' || item.subType === 'fatal') {
			item.processType = item.subType;
		} else {
			item.processType = item.type;
		}

		view.errorCounts[item.processType]++;
		counts.groups[item.processType]++;

		let processMsg = `${item.processType}: ${msg}`;

		if (!counts.msgGroups[processMsg]) {
			counts.msgGroups[processMsg] = {
				urls: {},
				count: 0
			};
		}

		if (!view.errorGroups[processMsg]) {
			view.errorGroups[processMsg] = {
				key: view.msgGroup++,
				count: 0
			};
		}
		counts.msgGroups[processMsg].count++;
		if (item.url) {
			counts.msgGroups[processMsg].urls[item.url] = true;
		}
		view.errorGroups[processMsg].count++;
		item.processGroup = view.errorGroups[processMsg].key;

		msg = msg.replace(/“/g, '<code>');
		msg = msg.replace(/”/g, '</code>');
		item.message = msg;

		item.badge = item.subType || item.type;
		item.firstLine = item.firstLine > -1 ? item.firstLine : item.lastLine;
		item.firstColumn = item.firstColumn > -1 ? item.firstColumn : item.lastColumn;

		if (item.hiliteStart !== undefined && item.hiliteLength) {
			let arr = [];
			let start = item.hiliteStart;
			let length = item.hiliteLength;
			let end = start + length;

			if (start > 0) {
				arr.push(extractParts(extract, 0, start));
			}

			arr.push(`<mark>${extractParts(extract, start, length)}</mark>`);
			arr.push(extractParts(extract, end));
			messages[i].extract = arr.join('');
		}
	});

	return _.template(layout)({ views, counts });
}

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = renderHtml;
