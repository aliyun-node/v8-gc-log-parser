'use strict';

const Parser = require('./');
const parser = new Parser();
const fs = require('fs');

const simple_log = fs.readFileSync('/Users/yijun/Downloads/gc-log-19488-20190425-214815.txt').toString();
// const simple_log = fs.readFileSync('/Users/yijun/Downloads/gc-log-14933-20180604-173831.txt').toString();
// 
parser.parseAllToData(simple_log)
// console.log(parser.parseAllToData(simple_log));