'use strict';

const js = require('@eslint/js');
const stylistic = require('@stylistic/eslint-plugin');

module.exports = [
	{
		ignores: [
			'node_modules/**',
			'results/**',
			'tests/html/**',
			'lib/html/**'
		]
	},
	js.configs.recommended,
	{
		files: ['**/*.js'],
		plugins: {
			'@stylistic': stylistic
		},
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'commonjs',
			globals: {
				require: 'readonly',
				module: 'writable',
				process: 'readonly',
				console: 'readonly',
				__dirname: 'readonly',
				Buffer: 'readonly',
				structuredClone: 'readonly'
			}
		},
		rules: {
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
			'@stylistic/semi': ['error', 'always'],
			'@stylistic/space-before-function-paren': ['error', 'always'],
			'no-unused-vars': ['error', { args: 'none' }]
		}
	}
];
