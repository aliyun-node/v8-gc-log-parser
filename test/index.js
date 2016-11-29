const test = require('tape');
const Parser = require('../');
const fs = require('fs');
const datadir = __dirname + '/data';

let files = {};

test('setup', function(t) {
  const filenames = fs.readdirSync(datadir);
  for (filename of filenames) {
    if (/\.in$/.test(filename)) {
      let key = filename.replace('.in', '');
      files[key] = files[key] || {};
      files[key].input = fs.readFileSync(datadir + '/' + filename, {
        encoding: 'utf8'
      });
    }
    if (/\.out$/.test(filename)) {
      let key = filename.replace('.out', '');
      files[key] = files[key] || {};
      files[key].output = fs.readFileSync(datadir + '/' + filename, {
        encoding: 'utf8'
      });
    }
  }
  t.end();
});

test('partial input', function(t) {
  t.plan(2);
  let parser = new Parser();
  let result = parser.parseAllToData(files.partial.input);
  t.equal(result.length, 5, 'parsed partial input should have right length');
  let expected = JSON.parse(files.partial.output);
  t.deepEqual(result, expected,
    'parsed partial input should have right content');
});

test('ignore ill-formed verbose traces', function(t) {
  t.plan(1);
  let parser = new Parser();
  let result = parser.parseAllToData(files.ill_formed_verbose.input);
  t.equal(result.length, 0,
    'should be able to ignore ill-formed verbose traces');
});

test('ignore ill-formed simple traces', function(t) {
  t.plan(1);
  let parser = new Parser();
  let result = parser.parseAllToData(files.ill_formed_trace.input);
  t.equal(result.length, 0,
    'should be able to ignore ill-formed simple traces');
});

test('ignore ill-formed nvp input', function(t) {
  t.plan(1);
  let parser = new Parser();
  let result = parser.parseAllToData(files.ill_formed_nvp.input);
  t.equal(result.length, 0,
    'should be able to ignore ill-formed nvp traces');
});

test('v6 trace_gc', function(t) {
  t.plan(2);
  let parser = new Parser();
  let result = parser.parseAllToData(files.v6_trace.input);
  t.equal(result.length, 3,
    'parsed v6 `--trace_gc` logs should have right length');
  let expected = JSON.parse(files.v6_trace.output);
  t.deepEqual(result, expected,
    'parsed v6 `--trace_gc` logs should have right content');
});

test('v4 trace_gc', function(t) {
  t.plan(2);
  let parser = new Parser();
  let result = parser.parseAllToData(files.v4_trace.input);
  t.equal(result.length, 3,
    'parsed v4 `--trace_gc` logs should have right length');
  let expected = JSON.parse(files.v4_trace.output);
  t.deepEqual(result, expected,
    'parsed v4 `--trace_gc` logs should have right content');
});

test('v012 trace_gc', function(t) {
  t.plan(2);
  let parser = new Parser();
  let result = parser.parseAllToData(files.v012_trace.input);
  t.equal(result.length, 3,
    'parsed v012 `--trace_gc` logs should have right length');
  let expected = JSON.parse(files.v012_trace.output);
  t.deepEqual(result, expected,
    'parsed v012 `--trace_gc` logs should have right content');
});

test('v6 trace_gc_nvp', function(t) {
  t.plan(2);
  let parser = new Parser();
  let result = parser.parseAllToData(files.v6_nvp.input);
  t.equal(result.length, 2,
    'parsed v6 `--trace_gc_nvp` logs should have right length');
  let expected = JSON.parse(files.v6_nvp.output);
  t.deepEqual(result, expected,
    'parsed v6 `--trace_gc_nvp` logs should have right content');
});

test('v4 trace_gc_nvp', function(t) {
  t.plan(2);
  let parser = new Parser();
  let result = parser.parseAllToData(files.v4_nvp.input);
  t.equal(result.length, 2,
    'parsed v4 `--trace_gc_nvp` logs should have right length');
  let expected = JSON.parse(files.v4_nvp.output);
  t.deepEqual(result, expected,
    'parsed v4 `--trace_gc_nvp` logs should have right content');
});

test('v012 trace_gc_nvp', function(t) {
  t.plan(1);
  let parser = new Parser();
  let result = parser.parseAllToData(files.v012_nvp.input);
  t.equal(result.length, 2,
    'parsed v012 `--trace_gc_nvp` logs should have right length');
  // let expected = JSON.parse(files.v012_nvp.output);
  // t.deepEqual(result, expected,
  //   'parsed v012 `--trace_gc_nvp` logs should have right content');
});

test('v6 `--trace_gc_verbose', function(t) {
  t.plan(2);
  let parser = new Parser();
  let result = parser.parseAllToData(files.v6_verbose.input);
  t.equal(result.length, 2,
    'parsed v6 `--trace_gc --trace_gc_verbose` logs '
    + 'should have right length');
  let expected = JSON.parse(files.v6_verbose.output);
  t.deepEqual(result, expected,
    'parsed v6 `--trace_gc --trace_gc_verbose` logs '
    + 'should have right content');
});

test('v4 `--trace_gc_verbose', function(t) {
  t.plan(2);
  let parser = new Parser();
  let result = parser.parseAllToData(files.v4_verbose.input);
  t.equal(result.length, 2,
    'parsed v4 `--trace_gc --trace_gc_verbose` logs '
    + 'should have right length');
  let expected = JSON.parse(files.v4_verbose.output);
  t.deepEqual(result, expected,
    'parsed v4 `--trace_gc --trace_gc_verbose` logs '
    + 'should have right content');
});

test('v012 `--trace_gc_verbose', function(t) {
  t.plan(2);
  let parser = new Parser();
  let result = parser.parseAllToData(files.v012_verbose.input);
  t.equal(result.length, 1,
    'parsed v012 `--trace_gc --trace_gc_verbose` logs '
    + 'should have right length');
  let expected = JSON.parse(files.v012_verbose.output);
  t.deepEqual(result, expected,
    'parsed v012 `--trace_gc --trace_gc_verbose` logs '
    + 'should have right content');
});

test('oom message', function(t) {
  t.plan(1);
  let parser = new Parser();
  let result = parser.parseAllToData(files.oom.input);
  t.equal(result.length, 0,
    'should be able to ignore oom message');
});

test('verbose misc', function(t) {
  t.plan(1);
  let parser = new Parser();
  let result = parser.parseAllToData(files.verbose_misc.input);
  t.equal(result.length, 0,
    'should be able to ignore unknown verbose trace');
});

test('v6 trace and verbose', function(t) {
  t.plan(2);
  let parser = new Parser();
  let result = parser.parseAllToData(files.v6_trace_verbose.input);
  t.equal(result.length, 8,
    'parsed v6 `--trace_gc_verbose --trace_gc` logs '
    + 'should have right length');
  let expected = JSON.parse(files.v6_trace_verbose.output);
  t.deepEqual(result, expected,
    'parsed v6 `--trace_gc_verbose --trace_gc` logs '
    + 'should have right content');
});

test('v6 verbose and nvp', function(t) {
  t.plan(2);
  let parser = new Parser();
  let result = parser.parseAllToData(files.v6_verbose_nvp.input);
  t.equal(result.length, 8,
    'parsed v6 `--trace_gc_verbose --trace_gc --trace_gc_nvp` logs '
    + 'should have right length');
  let expected = JSON.parse(files.v6_verbose_nvp.output);
  t.deepEqual(result, expected,
    'parsed v6 `--trace_gc_verbose --trace_gc --trace_gc_nvp` logs '
    + 'should have right content');
});
