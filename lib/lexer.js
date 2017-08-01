'use strict';

const Sym = require('./sym');
const types = require('./types');

const INTEGER = types.INTEGER;
const NUMBER = types.NUMBER;
const DECIMAL = types.DECIMAL;
const STRING = types.STRING;
const LITERAL = types.LITERAL;
const HEX = types.HEX;

const MS = types.MS;
const MB = types.MB;
const KB = types.KB;
const ARROW = types.ARROW;
const SCAVENGE = types.SCAVENGE;
const MARK_SWEEP = types.MARK_SWEEP;
const MEMORY_ALLOCATOR = types.MEMORY_ALLOCATOR;
const OLD_SPACE = types.OLD_SPACE;
const NEW_SPACE = types.NEW_SPACE;
const OLD_POINTERS = types.OLD_POINTERS;
const OLD_DATA_SPACE = types.OLD_DATA_SPACE;
const CODE_SPACE = types.CODE_SPACE;
const MAP_SPACE = types.MAP_SPACE;
const CELL_SPACE = types.CELL_SPACE;
const PROPERTY_CELL_SPACE = types.PROPERTY_CELL_SPACE;
const LARGE_OBJECT_SPACE = types.LARGE_OBJECT_SPACE;
const ALL_SPACES = types.ALL_SPACES;
const TOTAL_TIME = types.TOTAL_TIME;
const EXTERNAL_MEMORY = types.EXTERNAL_MEMORY;
const USED = types.USED;
const AVAILABLE = types.AVAILABLE;
const COMMITED = types.COMMITED;
const PROMOTED = types.PROMOTED;
const PROMOTION = types.PROMOTION;
const START = types.START;

// TODO: DFAs and `startsWith` would be better
// Most regex start with ^[\t ]* and ends with \b
// (unless we are confident about the context) anyway
let dict = {
  [MS]: 'ms',
  [KB]: 'KB',
  [MB]: 'MB',
  [ARROW]: '->',
  [SCAVENGE]: 'Scavenge',
  [MARK_SWEEP]: 'Mark-sweep',
  [MEMORY_ALLOCATOR]: 'Memory allocator',
  [NEW_SPACE]: 'New space',
  [OLD_POINTERS]: 'Old pointers',
  [OLD_DATA_SPACE]: 'Old data space',
  [CODE_SPACE]: 'Code space',
  [MAP_SPACE]: 'Map space',
  [CELL_SPACE]: 'Cell space',
  [PROPERTY_CELL_SPACE]: 'PropertyCell space',
  [LARGE_OBJECT_SPACE]: 'Large object space',
  [ALL_SPACES]: 'All spaces',
  [OLD_SPACE]: 'Old space',
  [EXTERNAL_MEMORY]: 'External memory reported',
  [TOTAL_TIME]: 'Total time spent in GC',
  [USED]: 'used',
  [AVAILABLE]: 'available',
  [COMMITED]: 'committed',
  [PROMOTED]: 'promoted',
  [START]: 'start',
  [PROMOTION]: 'promotion'
};

class LexerMark {
  constructor(rowIndex, colIndex) {
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
  }
}

/* We don't have a lookahead because the grammar is ambiguous, or,
 * in technical jargons, is neither regular nor LL(1)/LR(1)
 * e.g.:
 * a) A word could very well be a keyword or the start of a sentence
 * b) A literal such as '/' could have no semantic meaning
 *  (just part of a phrase) or be an important separator
 * c) Whitespaces might count in some occasions(see above)
 * If we guess it wrong, it could be very tedious to reassemble a
 * phrase/sentence from the token we've parsed
 * The grammar is also subject to change so better make it
 * more flexible and context sensitive
 */
class Lexer {
  constructor(lines) {
    this.lines = lines;
    // the rest of the line we need to consume
    // we slice the lines because we use those quick an dirty regex
    // and need that ^
    // TODO: All the slicing and indexing can not be efficient,
    //       altough these strings should be flat from the start.
    //       Maybe we should use typed arrays instead?
    this.line = this.lines[0];
    this.rowIndex = 0;  // index of the current line
    this.colIndex = 0;  // this index into the current line
  }

  markPosition() {
    return new LexerMark(this.rowIndex, this.colIndex);
  }

  // TODO: panic mode when we have streaming support
  restorePosition(mark) {
    this.rowIndex = mark.rowIndex;
    this.colIndex = mark.colIndex;
    this.line = this.lines[this.rowIndex].slice(this.colIndex);
  }

  isEmptyLine() {
    let index = 0;
    while (index < this.line.length
      && (this.line[index] === '\t' || this.line[index] === ' ')) {
      index++;
    }
    return index === this.line.length;
  }

  isEOL() {
    return this.colIndex === this.lines[this.rowIndex].length;
  }

  isLastLine() {
    return this.rowIndex + 1 === this.lines.length;
  }

  skipLine() {
    this.rowIndex += 1;
    this.colIndex = 0;
    this.line = this.lines[this.rowIndex];
  }

  // [12345]
  scanPIDSource(source) {
    let PID = new Sym();
    if (this.scanWithRegex(PID, /^[\t ]*\[(\d{1,5})\]/, INTEGER)) {
      source.pid = PID.data;
      return true;
    }
    return false;
  }

  // [12345:0x123a14d]
  scanFullSource(source) {
    let PID = new Sym(), isolate = new Sym();
    let colIndex = this.colIndex;
    if (this.scanWithRegex(PID, /^[\t ]*\[(\d{1,5})\:/, INTEGER)) {
      source.pid = PID.data;
      if (this.scanHex(isolate)) {
        source.isolate = isolate.data;
        return true;
      }
    }
    this.colIndex = colIndex;
    return false;
  }

  // [I:0x1234a14d]
  scanIsolateMark(source) {
    let isolate = new Sym();
    if (this.scanWithRegex(isolate, /^[\t ]*\[I\:(0x[0-9a-zA-Z]+)\]/, STRING)) {
      source.isolate = isolate.data;
      return true;
    }
    return false;
  }

  // 10495 ms
  scanUpTime(uptime) {
    return this.scanWithRegex(uptime, /^[\t ]*(\d+) ms/, INTEGER);
  }

  // evacuate.update_pointers
  scanNVPName(name) {
    if (this.scanWithRegex(name, /^[\t ]*([0-9a-z\.\_]+)=/, STRING)) {
      this.advanceCol(-1);  // =
      return true;
    };
    return false;
  }

  scanUntil(str, sym) {
    let index = this.line.indexOf(str);
    if (index === -1) { return false; }
    sym.type = STRING;
    sym.data = this.line.slice(0, index);
    this.advanceCol(index);
    return true;
  }

  advanceCol(count) {
    this.colIndex += count;
    this.line = this.lines[this.rowIndex].slice(this.colIndex);
  }

  scanWithRegex(sym, regex, type) {
    if (this.isEOL()) {
      return false;
    }
    let match = this.line.match(regex);
    if (!match) { return false; }
    let data = match[1];
    if (sym) {
    sym.type = type;
      if (type === NUMBER || type === DECIMAL || type === INTEGER) {
        sym.data = Number(data);
      } else {
        sym.data = data;
      }
    }
    this.advanceCol(match[0].length);
    return true;
  }

  scanKeyWord(type, sym) {
    let str = dict[type];
    let length = this.startsWithIgnoreWS(str);
    if (length) {
      if (sym) {
        sym.type = type;
        sym.data = str;
      }
      this.advanceCol(length);
      return true;
    }
    return false;
  }

  scanLiteralIgnoreWS(str, result) {
    let length = this.startsWithIgnoreWS(str);
    if (length) {
      if (result) {
        result.type = LITERAL;
        result.data = str;
      }
      this.advanceCol(length);
      return true;
    }
    return false;
  }

  startsWithIgnoreWS(str) {
    let skip = 0;
    let index = 0;

    while (this.line[skip] === ' ' || this.line[skip] === '\t') {
      skip++;
    }
    while (skip + index < this.line.length
      && this.line[skip + index] === str[index]) {
      index++;
    }

    return index === str.length ? skip + index : 0;
  }

  scanHex(result) {
    return this.scanWithRegex(result, /^(0x[0-9a-zA-Z]+)\]/, HEX);
  }

  scanDecimal(result) {
    return this.scanWithRegex(result, /^[ \t]*([-]?\d+\.\d+)/, DECIMAL);
  }

  scanInteger(result) {
    return this.scanWithRegex(result, /^[ \t]*([-]?\d+)/, INTEGER);
  }

  scanNumber(result) {
    return (this.scanDecimal(result) || this.scanInteger(result));
  }

}

module.exports = Lexer;
