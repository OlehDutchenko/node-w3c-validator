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
	// console.log(JSON.stringify(JSON.parse(jsonString), null, '  '));
	let messages = JSON.parse(jsonString).messages;

	if (!messages.length) {
		return jsonString;
	}

	let views = {};
	let group = 1;

	messages.forEach(item => {
		let key = item.url;

		if (key in views) {
			views[key].list.push(item);
		} else {
			let viewName = key.replace(/\\/, '/').split('/').pop();
			let viewAnchor = viewName.replace(/\/|\.|[а-я]|\s/gi, '-');

			views[key] = {
				name: viewName,
				anchor: viewAnchor,
				path: key,
				list: [
					item
				],
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

		if (item.subType === 'warning' || item.subType === 'fatal') {
			item.processType = item.subType;
		} else {
			item.processType =  item.type;
		}

		views[key].errorCounts[item.processType]++;

		let msg = item.message;

		if (!views[key].errorGroups[msg]) {
			views[key].errorGroups[msg] = {
				key: group++,
				count: 0
			};
		}
		views[key].errorGroups[msg].count++;
		item.processGroup = views[key].errorGroups[msg].key;
	});

	for (let i = 0; i < messages.length; i++) {
		let item = messages[i];
		let msg = item.message;
		let extract = item.extract;

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
	}

	console.log(JSON.stringify(views, null, '  '));

	return _.template(layout)({views});
}

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = renderHtml;
