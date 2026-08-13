'use strict';

// -----------------------------------------------------------------------------
// Functional tests for the CLI (bin/cmd.js) — black-box, drives the real binary
// -----------------------------------------------------------------------------

const os = require('os');
const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert');

const { hasJava, fixture, runCli } = require('./helpers');

const skip = hasJava ? false : 'Java runtime is not available';

test('valid document exits 0 (lint format)', { skip }, async () => {
	const { code } = await runCli(['-i', fixture('pass.html'), '-f', 'lint']);
	assert.strictEqual(code, 0);
});

test('invalid document exits 1 and reports the errors (lint)', { skip }, async () => {
	const { code, stdout } = await runCli(['-i', fixture('fail.html'), '-f', 'lint']);
	assert.strictEqual(code, 1);
	assert.match(stdout, /not allowed/);
	assert.match(stdout, /missing a required instance/);
	assert.match(stdout, /alt/);
});

test('invalid document exits 1 and prints a report (json)', { skip }, async () => {
	const { code, stdout } = await runCli(['-i', fixture('fail.html'), '-f', 'json']);
	assert.strictEqual(code, 1);
	assert.match(stdout, /FOUND ERRORS/);
	assert.match(stdout, /"messages"/);
});

test('writes a valid JSON report to the -o output path', { skip }, async () => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nw3c-'));
	const outPath = path.join(dir, 'report.json');
	try {
		const { code } = await runCli([
			'-i', fixture('fail.html'),
			'-f', 'json',
			'-o', outPath
		]);
		assert.strictEqual(code, 1);
		assert.ok(fs.existsSync(outPath), 'report file should exist');
		const report = JSON.parse(fs.readFileSync(outPath, 'utf8'));
		assert.ok(report.messages.length > 0);
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

test('html format writes a full HTML report to -o', { skip }, async () => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nw3c-'));
	const outPath = path.join(dir, 'report.html');
	try {
		const { code } = await runCli([
			'-i', fixture('fail.html'),
			'-f', 'html',
			'-o', outPath
		]);
		assert.strictEqual(code, 1);
		const html = fs.readFileSync(outPath, 'utf8');
		assert.match(html, /<!doctype html>/i);
		assert.match(html, /node-w3c-validator/);
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

test('suppressErrors from package.json drops matching errors', { skip }, async () => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nw3c-'));
	const pkg = {
		name: 'suppress-fixture',
		nodeW3Cvalidator: {
			suppressErrors: ['is missing a required instance of child element']
		}
	};
	fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg));
	try {
		// one-error.html's only problem is the suppressed one → exit 0
		const { code } = await runCli(
			['-i', fixture('one-error.html'), '-f', 'json'],
			{ cwd: dir }
		);
		assert.strictEqual(code, 0);
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

// -----------------------------------------------------------------------------
// Non-JSON output formats — regression coverage for Bug A (Java-availability
// check used to JSON.parse(stderr) and misfire for gnu/text/xml and the
// default no-format run). Fixed in Phase 3 via execFile ENOENT detection.
// -----------------------------------------------------------------------------

test('valid document exits 0 with the default format', { skip }, async () => {
	const { code } = await runCli(['-i', fixture('pass.html')]);
	assert.strictEqual(code, 0);
});

test('gnu format output references the validated file', { skip }, async () => {
	const { code, stdout } = await runCli(['-i', fixture('fail.html'), '-f', 'gnu']);
	assert.strictEqual(code, 1);
	assert.match(stdout, /fail\.html/);
});
