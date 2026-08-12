'use strict';

// -----------------------------------------------------------------------------
// Shared test helpers
// -----------------------------------------------------------------------------

const path = require('path');
const { spawn, spawnSync } = require('child_process');

const binPath = path.join(__dirname, '..', 'bin', 'cmd.js');
const fixturesDir = path.join(__dirname, 'fixtures');

/**
 * Whether a Java runtime is available. The validator shells out to
 * `java -jar vnu.jar`, so the functional suites are skipped without it.
 * @const {boolean}
 */
const hasJava = spawnSync('java', ['-version']).error === undefined;

/**
 * Absolute path to a fixture file
 * @param {string} name
 * @returns {string}
 */
function fixture (name) {
	return path.join(fixturesDir, name);
}

/**
 * Run the CLI (bin/cmd.js) as a child process and collect its result.
 * @param {Array.<string>} args
 * @param {Object} [options]
 * @param {string} [options.cwd]
 * @returns {Promise.<{code: number, stdout: string, stderr: string}>}
 */
function runCli (args, options = {}) {
	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath, [binPath, ...args], {
			cwd: options.cwd || process.cwd(),
			env: { ...process.env, FORCE_COLOR: '0' }
		});

		let stdout = '';
		let stderr = '';

		child.stdout.on('data', (chunk) => {
			stdout += chunk;
		});
		child.stderr.on('data', (chunk) => {
			stderr += chunk;
		});
		child.on('error', reject);
		child.on('close', (code) => {
			resolve({ code, stdout, stderr });
		});
	});
}

module.exports = {
	binPath,
	fixturesDir,
	hasJava,
	fixture,
	runCli
};
