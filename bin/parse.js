#!/usr/bin/env node

'use strict';

const fs = require('fs');
const Parser = require('../index');
const argv = process.argv.slice(2);

if (argv.length < 1) {
  console.log('Usage: v8-gc-log-parse <GC-log-filename>');
  process.exit(1);
}

const text = fs.readFileSync(argv[0], {encoding: 'utf8'});
const parser = new Parser();
const parsed = parser.parseAllToData(text);
process.stdout.write(JSON.stringify(parsed, null, 2) + '\n');
