'use strict';

// -----------------------------------------------------------------------------
// Functional tests for the Node.js API (lib/validator.js) — callback contract
// -----------------------------------------------------------------------------

const os = require('os');
const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert');

const { hasJava, fixture } = require('./helpers');
const nodeW3CValidator = require('../lib/validator');

const skip = hasJava ? false : 'Java runtime is not available';

test('reports err === null for a valid document', { skip }, (t, done) => {
	nodeW3CValidator(fixture('pass.html'), { format: 'json' }, (err) => {
		assert.strictEqual(err, null);
		done();
	});
});

test('reports an error and JSON output for an invalid document', { skip }, (t, done) => {
	nodeW3CValidator(fixture('fail.html'), { format: 'json' }, (err, output) => {
		assert.notStrictEqual(err, null);
		const report = JSON.parse(output);
		assert.ok(report.messages.length > 0);
		done();
	});
});

test('writeFile (sync) creates the file with the given contents', () => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nw3c-'));
	const filePath = path.join(dir, 'nested', 'out.txt');
	try {
		nodeW3CValidator.writeFile(filePath, 'hello');
		assert.strictEqual(fs.readFileSync(filePath, 'utf8'), 'hello');
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

// Bug B: writeFile's async branch calls `mkdirp(dir, cb)`, but mkdirp@1 removed
// the callback API, so it throws "invalid options argument" synchronously.
// Kept as TODO until Phase 3 replaces mkdirp with fs.mkdir({ recursive: true }).
test('writeFile (async) creates the file and invokes the callback', { todo: 'Bug B: mkdirp@1 has no callback API' }, (t, done) => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nw3c-'));
	const filePath = path.join(dir, 'nested', 'out.txt');
	nodeW3CValidator.writeFile(filePath, 'hello', (err) => {
		try {
			assert.ifError(err);
			assert.strictEqual(fs.readFileSync(filePath, 'utf8'), 'hello');
			done();
		} finally {
			fs.rmSync(dir, { recursive: true, force: true });
		}
	});
});
