# node-w3c-validator

![node](https://img.shields.io/badge/node-6.3.1-yellow.svg)
[![npm](https://img.shields.io/badge/npm-install-orange.svg)](https://www.npmjs.com/package/node-w3c-validator)
[![license](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/dutchenkoOleg/node-w3c-validator/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/dutchenkoOleg/node-w3c-validator.svg?branch=master)](https://travis-ci.org/dutchenkoOleg/node-w3c-validator)

> _Wrapper for [The Nu Html Checker (v.Nu)](https://www.npmjs.com/package/vnu-jar)_

[![js happiness style](https://cdn.rawgit.com/JedWatson/happiness/master/badge.svg)](https://github.com/JedWatson/happiness)

---

## Attention

> You need to install the "Java" for working with `node-w3c-validator`  
> Visit https://java.com for downloading the "Java" if you not have it


---

## Table of Contents

1. [CLI](https://github.com/dutchenkoOleg/node-w3c-validator#cli)
   - [Options](https://github.com/dutchenkoOleg/node-w3c-validator#options)
1. [Node.js API](https://github.com/dutchenkoOleg/node-w3c-validator#nodejs-api)
    - [nodeW3CValidator()](https://github.com/dutchenkoOleg/node-w3c-validator#nodew3cvalidatorpathto-options-done)
    - [nodeW3CValidator.writeFile()](https://github.com/dutchenkoOleg/node-w3c-validator#nodew3cvalidatorwritefilefilepath-outputdata-done)
    - [Usage Example](https://github.com/dutchenkoOleg/node-w3c-validator#usage-example)
1. [Errors and Warnings suppressing](https://github.com/dutchenkoOleg/node-w3c-validator#errors-and-warnings-suppressing)
1. [Changelog](https://github.com/dutchenkoOleg/node-w3c-validator#changelog)
1. [Contributing](https://github.com/dutchenkoOleg/node-w3c-validator#contributing)
    - [Contributors 💪](https://github.com/dutchenkoOleg/node-w3c-validator#contributors-)
1. [Code of Conduct](https://github.com/dutchenkoOleg/node-w3c-validator#code-of-conduct)

---

## CLI

Install as global package

```shell
npm i -g node-w3c-validator
```

Usage

```shell
node-w3c-validator -i ./dist/*.html -f html -o ./reports/result.html -s
```

You may pass a [glob](https://www.npmjs.com/package/glob) pattern too

```shell
node-w3c-validator -i ./dist/**/*.html -f html -o ./reports/result.html -s
```

### Options

#### `-i, --input <path>`

Validate input path.

default: `process.cwd()`

#### `--exclude <path>`

Exclude from input path.

default: `unset`

#### `-a, --asciiquotes`

Specifies whether ASCII quotation marks are substituted for Unicode smart
quotation marks in messages.

default: `unset`

#### `-e, --errors-only`

Specifies that only error-level messages and non-document-error messages are reported (so that warnings and info messages are not reported).

default: `unset`, _all message reported, including warnings & info messages_

#### `-q, --exit-zero-always`

Makes the checker exit zero even if errors are reported for any documents

#### `-f, --format <format>`

Specifies the output format for reporting the results

default: `unset`
possible values: `gnu | xml | json | text | html | lint`  

> `lint` format is available from 1.4.0 version.  
> `lint` format is designed for convenient error output to the terminal.  
> it uses a [eslint-formatter-pretty](https://github.com/sindresorhus/eslint-formatter-pretty#readme) under the hood


![lint format screenshot](https://raw.githubusercontent.com/dutchenkoOleg/node-w3c-validator/master/tests/assets/lint-format-screenshot-upd.png)


#### `--filterfile <filename>`

Specifies a filename. Each line of the file contains either a regular expression or starts with "#" to indicate the line is a comment. Any error message or warning message that matches a regular expression in the file is filtered out (dropped/suppressed)

default: `unset`, _checker does no message filtering_

#### `--filterpattern <pattern>`

Specifies a regular-expression pattern. Any error message or warning message that matches the pattern is filtered out (dropped/suppressed)

default: `unset`, _checker does no message filtering_

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

#### `-b, --buffersize <size>`

Increase [maxBuffer](https://nodejs.org/docs/latest-v10.x/api/child_process.html#child_process_child_process_exec_command_options_callback) size to prevent [`!!! OUTPUT ERROR` or `Unexpected end of JSON input` errors](https://github.com/dutchenkoOleg/node-w3c-validator/issues/3). This is because [child_process stdout being truncated](https://github.com/nodejs/node/issues/19218) when validator check a lot of files.

##### CLI `-b, --buffersize`

```bash
# increase buffer size (1024 * 500)
node-w3c-validator -i static/**/*.html -b 500
```

##### Node.js API `exec.buffersize`

```js
// increase buffer size (1024 * 500)
nodeW3CValidator(validatePath, {
    format: 'html',
    exec: {
        buffersize: 1024 * 500
    }
}, function (err, output) {
    // ...
});
```

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

_an exception_

`--buffersize 500`

transforms to

```js
exec: {
    buffersize: 1024 * 500
}
```


#### `done(err, output)`

Validation callback.

_Parameters:_

Name | Data type | Description
 --- | --- | ---
 `err` | `Error / null` | if no errors - will be `null`, otherwise - Error object
 `output` | `string` | string with reporting result, if no errors - can be as empty string

### nodeW3CValidator.writeFile(filePath, outputData[, done])

Write file

_Parameters:_

Name | Data type | Argument | Description
 --- | --- | --- | ---
 `filePath` | `string` |  | relative path to saving a file
 `outputData` | `string / Buffer` |  | file output content
 `done` | `Function` | _optional_ | if exist - it will asynchronous writes output to the filePath. See [fs.writeFile(file, data, callback)](https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback)

### Usage Example

```js
// imports
const nodeW3CValidator = require('node-w3c-validator');

// paths
const validatePath = './dist/*.html';
// or directly to the file - './dist/index.html'
// or a glob pattern - './dist/**/*.html'
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


## Errors and Warnings suppressing

You can ignore some errors or warnings by suppressing them.  
_**Note!** This feature can be used only on `html`, `json` and `lint` formats._

You need to specify `nodeW3Cvalidator` field in your project `package.json` file.

Here can be two arrays, for errors (`suppressErrors`) and warnigns(`suppressWarnings`).  
Values must be a string parts or fully value of "unwanted" message.  
Under the hood - node-w3c-validator will use `String.protorype.includes`  
method for filtering messages.

For example, you receive warning message:

```text
The “type” attribute for the “style” element is not needed and should be omitted.
```

Now you can suppress it

```json
{
  "nodeW3Cvalidator": {
    "suppressErrors": [],
    "suppressWarnings": [
      "The “type” attribute for the “style” element is not needed and should be omitted."
    ]
  }
}
```

Or like this with a part of message:

```json
{
  "nodeW3Cvalidator": {
    "suppressErrors": [],
    "suppressWarnings": [
      "is not needed and should be omitted"
    ]
  }
}
```

---

## Changelog

See [Releases history](https://github.com/dutchenkoOleg/node-w3c-validator/releases)

## Contributing

Please read [CONTRIBUTING.md](https://github.com/dutchenkoOleg/node-w3c-validator/blob/master/CONTRIBUTING.md)

#### Contributors 💪

- Michael Kühnel [@mischah](https://github.com/mischah)
- Debjeet Biswas [@detj](https://github.com/detj)
- Yunus Gaziev [@yunusga](https://github.com/yunusga)
- WezomDev [@WezomDev](https://github.com/WezomDev)

## Code of Conduct

Please read [CODE_OF_CONDUCT.md](https://github.com/dutchenkoOleg/node-w3c-validator/blob/master/CODE_OF_CONDUCT.md)
