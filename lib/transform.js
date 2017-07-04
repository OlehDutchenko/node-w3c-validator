'use strict';

/**
 * Transform output string
 * @module
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const fs = require('fs');
const path = require('path');

// ----------------------------------------
// Private
// ----------------------------------------

function joinParts(part) {
	return part.join('\n').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ----------------------------------------
// Public
// ----------------------------------------

class Transform {
	constructor(output, inputFormat, outputFormat) {
		switch (inputFormat) {
			case 'text':
				this.fromText(output);
				break;
		}

		return this.str;
	}

	fromText (str) {
		let messages = [];
		let pass = -1;
		let cache = {};


		str = str.split('\n');

		str.forEach((item, i) => {
			if (pass === i) {
				return;
			}

			if (/^(warning:|error:|info:)/i.test(item)) {
				pass = i + 1;

				let msg = item.split(': ');
				let stats = str[pass];

				let data = {
					type: msg.shift().toLowerCase(),
					message: msg.join(': ')
				};

				if (data.type === 'warning') {
					data.subType = data.type;
					data.type = 'info';
				}

				stats = stats.replace(/ in resource (.+)$/i, (part, group) => {
					data.url = group;
					return '';
				}).replace('; ', ', ');

				stats = stats.replace(/(from line | column | to line )/gi, '').split(',');

				let lines = {
					from: {
						line: parseInt(stats[0]),
						column: parseInt(stats[1])
					},
					to: {
						line: parseInt(stats[2]),
						column: parseInt(stats[3])
					}
				};

				if (/^file:\//i.test(data.url)) {
					let filepath = path.normalize(data.url.replace(/^file:\//i, ''));
					let content;

					if (cache[filepath]) {
						content = cache[filepath];
					} else {
						content = fs.readFileSync(filepath);
						content = String(content).split('\n');

						cache[filepath] = content;
					}

					let start = lines.from.line - 1;

					if (start < 0) {
						start = 0;
					}
					let part = content.slice(start, lines.to.line);
					let partTail = part.concat();
					let last = part.length - 1;
					let startCol = lines.from.column - 15;

					part[last] = part[last].slice(0, lines.to.column);
					part[0] = part[0].slice(lines.from.column);
					partTail[last] = partTail[last].slice(0, lines.to.column + 6);

					if (startCol < 0 && start > 0) {
						partTail.unshift(content[start - 1].slice(startCol));
					} else if (startCol > 0) {
						partTail[0] = part[0].slice(startCol);
					}

					part = joinParts(part);
					partTail = joinParts(partTail);

					partTail = partTail.replace(part, (p) => {
						return `<mark>${p}</mark>`;
					});

					data.extract = partTail;
				}

				messages.push(data);
			}
		});

		console.log(JSON.stringify(messages, null, '  '));
	}
}

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = Transform;
