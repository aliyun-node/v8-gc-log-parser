const Parser = require('../');
const fs = require('fs');
const datadir = __dirname + '/data';

let files = {};

beforeAll(() => {
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
});

test('partial input', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.partial.input);
  let expected = JSON.parse(files.partial.output);
  expect(result).toEqual(expected);
});

test('ignore ill-formed verbose traces', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.ill_formed_verbose.input);
  expect(result.length).toBe(0);
});

test('ignore ill-formed simple traces', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.ill_formed_trace.input);
  expect(result.length).toBe(0);
});

test('ignore ill-formed nvp input', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.ill_formed_nvp.input);
  expect(result.length).toBe(0);
});

test('v6 trace_gc', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.v6_trace.input);
  let expected = JSON.parse(files.v6_trace.output);
  expect(result).toEqual(expected);
});

test('v4 trace_gc', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.v4_trace.input);
  let expected = JSON.parse(files.v4_trace.output);
  expect(result).toEqual(expected);
});

test('v012 trace_gc', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.v012_trace.input);
  let expected = JSON.parse(files.v012_trace.output);
  expect(result).toEqual(expected);
});

test('v6 trace_gc_nvp', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.v6_nvp.input);
  let expected = JSON.parse(files.v6_nvp.output);
  expect(result).toEqual(expected);
});

test('v4 trace_gc_nvp', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.v4_nvp.input);
  let expected = JSON.parse(files.v4_nvp.output);
  expect(result).toEqual(expected);
});

test('v012 trace_gc_nvp', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.v012_nvp.input);
  let expected = JSON.parse(files.v012_nvp.output);
  expect(result).toEqual(expected);
});

test('v6 `--trace_gc_verbose', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.v6_verbose.input);
  let expected = JSON.parse(files.v6_verbose.output);
  expect(result).toEqual(expected);
});

test('v4 `--trace_gc_verbose', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.v4_verbose.input);
  let expected = JSON.parse(files.v4_verbose.output);
  expect(result).toEqual(expected);
});

test('v012 `--trace_gc_verbose', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.v012_verbose.input);
  let expected = JSON.parse(files.v012_verbose.output);
  expect(result).toEqual(expected);
});

test('oom message', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.oom.input);
  expect(result.length).toBe(0);
});

test('verbose misc', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.verbose_misc.input);
  expect(result.length).toBe(0);
});

test('v6 trace and verbose', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.v6_trace_verbose.input);
  let expected = JSON.parse(files.v6_trace_verbose.output);
  expect(result).toEqual(expected);
});

test('v6 verbose and nvp', () => {
  let parser = new Parser();
  let result = parser.parseAllToData(files.v6_verbose_nvp.input);
  let expected = JSON.parse(files.v6_verbose_nvp.output);
  expect(result).toEqual(expected);
});
