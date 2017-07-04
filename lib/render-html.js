'use strict';

/**
 * Render JSON data into html page
 * @module
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const fs = require('fs');
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
const layout = fs.readFileSync('./lib/html/layout.html').toString();

/**
 * Get part of end replace spacial symbols there
 * @param {string} str
 * @param {number} indexA
 * @param {number} [indexB]
 * @returns {string}
 * @private
 * @sourceCode
 */
function extractParts (str, indexA, indexB) {
	return str.substr(indexA, indexB).replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
	let messages = JSON.parse(jsonString).messages;

	if (!messages.length) {
		return jsonString;
	}

	for (let i = 0; i < messages.length; i++) {
		let item = messages[i];
		let msg = item.message;
		let extract = item.extract;

		msg = msg.replace(/“/g, '<code>');
		msg = msg.replace(/”/g, '</code>');
		item.message = msg;

		item.badge = item.subType || item.type;
		item.classes = item.type;

		if (item.subType) {
			item.classes = `${item.type} ${item.subType}`;
		}

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

	let data = {
		messages,
		title: messages[0].url.replace(/\\/, '/').split('/').pop()
	};

	return _.template(layout)(data);
}

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = renderHtml;
