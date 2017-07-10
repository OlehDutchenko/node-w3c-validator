# node-w3c-validator

![npm](https://img.shields.io/badge/node-6.3.1-yellow.svg)
[![license](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/dutchenkoOleg/node-w3c-validator/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/dutchenkoOleg/node-w3c-validator.svg?branch=master)](https://travis-ci.org/dutchenkoOleg/node-w3c-validator)

> _Wrapper for [The Nu Html Checker (v.Nu)](https://www.npmjs.com/package/vnu-jar)_  
> _**Status - Work In Progress**_

[![js happiness style](https://cdn.rawgit.com/JedWatson/happiness/master/badge.svg)](https://github.com/JedWatson/happiness)

---

## CLI

Install as global package

```shell
npm i -g node-w3c-validator
```

### Options

#### `-i, --input <path>`

Validate input path.

default: `process.cwd()` 

#### `-a, --asciiquotes`

Specifies whether ASCII quotation marks are substituted for Unicode smart
quotation marks in messages.

default: `unset` 

#### `-e, --errors-only`

Specifies that only error-level messages and non-document-error messages are reported (so that warnings and info messages are not reported).

default: `unset`, _all message reported, including warnings & info messages_

#### `-f, --format <format>`

Specifies the output format for reporting the results

default: `unset`  
possible values: `gnu | xml | json | text | html`

#### `-s, --skip-non-html`

Skip documents that don’t have `*.html`, `*.htm`, `*.xhtml`, or `*.xht` extensions.

default: `unset`, _all documents found are checked, regardless of extension_

#### `-H, --html`

Forces any `*.xhtml` or `*.xht` documents to be parsed using the HTML parser.

default: `unset`, _XML parser is used for `*.xhtml` and `*.xht` documents_

#### `--no-langdetect`

Disables language detection, so that documents are not checked for missing or mislabeled html[lang] attributes.

default: `unset`, _language detection & html[lang] checking are performed_

#### `--no-stream`

Forces all documents to be be parsed in buffered mode instead of streaming mode (causes some parse errors to be treated as non-fatal document errors instead of as fatal document errors).

default: `unset`, _non-streamable parse errors cause fatal document errors_

#### `-v, --verbose`

Specifies "verbose" output. (Currently this just means that the names of
files being checked are written to stdout.)

default: `unset`, _output is not verbose_

#### `-V, --version`

Shows the current version number.

#### `-o, --output <path>`

Write reporting result to the path

---

## Node.js API

Install in your project

```shell
npm i --save-dev node-w3c-validator
```

### nodeW3CValidator(pathTo, options, done);

_Parameters:_

Name | Data type | Description
 --- | --- | ---
 `pathTo` | `string` | The path to the folder or directly to the file, for verification, also it can be url to the Web document
 `options` | `Object` | Options for validating, sеe description below
 `done` | `Function` | Validation callback, sеe description below
 
 
#### `options`
 
You can use all available options from [CLI / Options](#cli). Only change props name to the camelCase style,   
 exeception `--no-stream` and `--no-langdetect` they must be declared without `no` part 
 
_example_
 
- `--errors-only` - `errorsOnly: true`
- `--no-langdetect` - `langdetect: false`
- `--format json` - `format: 'json'`

 
#### `done(err, output)`

Validation callback.

_Parameters:_

Name | Data type | Description
 --- | --- | ---
 `err` | `Error / Object.<null>` | if no errors - will be `null`, else - Error object
 `output` | `string` | string with reporting result, if no errors - can be as empty string

### nodeW3CValidator.writeFile(filePath, outputData[, done])

Write file

_Parameters:_

Name | Data type | Argument | Description
 --- | --- | --- | ---
 `filePath` | `string` |  | if no errors - will be `null`, else - Error object
 `outputData` | `string / Buffer` |  | file output content
 `done` | `Function` | _optional_ | if exist - it will asynchronous writes output to the filePath. See [fs.writeFile(file, data, callback)](https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback)


### Usage Example

```js
// imports
const path = require('path');
const nodeW3CValidator = require('node-w3c-validator');

// paths
const validatePath = './test/'; // or directly on file - './tmp/index.html'
const resultOutput = './reports/result.html';

// validate
nodeW3CValidator(validatePath, {
	format: 'html',
	skipNonHtml: true,
	verbose: true
}, function (err, output) {
	if (err === null) {
		return;
	}
	nodeW3CValidator.writeFile(resultOutput, output);
});
```

---

## Tests

1. `npm test` for testing js and scss code style
1. `npm run happiness-fix` for automatically fix most of problems with **js code style** 

## Changelog

Please read [CHANGELOG.md](https://github.com/dutchenkoOleg/node-w3c-validator/blob/master/CHANGELOG.md)

## Contributing

Please read [CONTRIBUTING.md](https://github.com/dutchenkoOleg/node-w3c-validator/blob/master/CONTRIBUTING.md)

## Code of Conduct

Please read [CODE_OF_CONDUCT.md](https://github.com/dutchenkoOleg/node-w3c-validator/blob/master/CODE_OF_CONDUCT.md)
