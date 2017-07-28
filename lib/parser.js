'use strict';

const Sym = require('./sym');
const Lexer = require('./lexer');
const types = require('./types');

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
const START = types.START;
const PROMOTION = types.PROMOTION;

// how to stringify those types
const keys = {
  [SCAVENGE]: 'scavenge',
  [MARK_SWEEP]: 'mark_sweep',
  [MEMORY_ALLOCATOR]: 'memory_allocator',
  [NEW_SPACE]: 'new_space',
  [OLD_POINTERS]: 'old_pointers',
  [OLD_DATA_SPACE]: 'old_data_space',
  [CODE_SPACE]: 'code_space',
  [MAP_SPACE]: 'map_space',
  [CELL_SPACE]: 'cell_space',
  [PROPERTY_CELL_SPACE]: 'property_cell_space',
  [LARGE_OBJECT_SPACE]: 'large_object_space',
  [ALL_SPACES]: 'all_spaces',
  [OLD_SPACE]: 'old_space',
  [TOTAL_TIME]: 'total_time_spent_in_gc',
  [EXTERNAL_MEMORY]: 'external_memory_reported',
  [USED]: 'used',
  [AVAILABLE]: 'available',
  [COMMITED]: 'committed',
  [PROMOTED]: 'promoted',
  [START]: 'start',
  [PROMOTION]: 'promotion'
};

/* The grammar is definitely not regular and not LL(1)/LR(1),
 * so we write a recursive-descent parser and use `this.lexer.markPosition()
 * and `this.lexer.restorePosition(mark)` for backtracking
 */
/* We don't use FIRST/FOLLOW sets strictly because we can choose
 * what kinds of logs we want to support,
 * so no need to trade complexity for flexibility
 */
/* Right now we don't build a meaningful AST(parseAll return undefined)
 * but it's planned for better tooling support
 */
/* Note:
 *  a) Trace and NVPTrace don't appear in the same log.
 *    There is an if-else in gc_tracer.cc
 *  b) We assume there won't be any normal stdout output inside
 *    a trace. This is especially important to the multi-line verbose trace.
 */
/*
 * TODO: some 'return false' should throw exceptions instead
 */
class GCLParser {
  constructor() {}

  parseAllToData(text) {
    // TODO: when parseAll returns an AST
    // we need a method to walk that and output data
    this.parseAll(text);
    return this.data;
  }

  parseAll(text) {
    let lines = text.split('\n').concat(['']);
    this.lexer = new Lexer(lines);
    this.data = [];

    let holder = {};
    // TODO: if there is only one line?
    while (!this.lexer.isLastLine()) {
      if (this._GCLog(holder)) {
        this.data.push(holder.data);
      } else {
        // this line is not a GC log and is skipped
      }
      // here we are at the start of the next line to parse
      if (!this.lexer.isLastLine() && this.lexer.isEmptyLine()) {
        this.lexer.skipLine();  // this may cosumes the last new line
      }
    }
    if (this.data.length && !this.version) {
      this.version = 'v6.x';
    }

    // TODO: should return an AST(indexes included) for tooling
    return;
  }

  // Source Trace '\n'
  // might not need '\n' to be more fault tolerant
  // and we can't assume the log ends with a new line
  _GCLog(holder) {
    let source = {}, trace = {};
    if (this._Source(source, trace) && this._Trace(source, trace)) {
      holder.data = Object.assign(source, trace);
      if (!this.lexer.isLastLine()) { this.lexer.skipLine(); }
      return true;
    }
    // unknown trace
    if (!this.lexer.isLastLine()) { this.lexer.skipLine(); }
    return false;
  }

  // Here the matching is delegated to the lexer using regex
  // since the format is easy to express in regex and
  // it's much cleaner that way
  // PIDSource | FullSource [IsolateMark]
  _Source(source, trace) {
    let pid = new Sym();
    let isolate = new Sym();
    let mark = this.lexer.markPosition();

    // '[' PID ']'
    if (this.lexer.scanPIDSource(source)) {
      source.version = 'v0.12.x';
      return true;
    }

    // '[' PID ':' Isolate ']'
    if (this.lexer.scanFullSource(source)) {
      // '[I:' Isolate ']'
      if (this.lexer.scanIsolateMark(source)) {
        trace.type = 'nvp';
        this.version = 'v4.x';
      }
      return true;
    }

    this.lexer.restorePosition(mark);
    return false;
  }

  // Note when this returns true
  // we are still at the end of the last line
  _Trace(source, trace) {
    let mark = this.lexer.markPosition();
    let uptime = new Sym();
    // UpTime ':'  GCTrace
    // UpTime ':'  NVPTrace
    // we use regex to scan uptime because it's easier
    if (this.lexer.scanUpTime(uptime) && this._Literal(':')) {
      trace.time_since_init = uptime.data;
      if (this._NVPTrace(source, trace)) {
        return true;
      }
      if (this._GCTrace(source, trace)) {
        return true;
      }
      this.lexer.restorePosition(mark);
      return false;
    }

    // VerboseTrace
    if (this._VerboseTrace(source, trace)) {
      return true;
    }

    this.lexer.restorePosition(mark);
    return false;
  }

  // NVP | NVP NVPTrace
  // we don't do recursion here in case of overflow
  _NVPTrace(source, trace) {
    let mark = this.lexer.markPosition();
    let nvp = {};

    // at least one nvp
    if (!this._NVP(nvp)) {
      this.lexer.restorePosition(mark);
      return false;
    }
    while (!this.lexer.isEOL() && this._NVP(nvp)) {
      ;
    }
    trace.data = nvp;
    trace.type = 'nvp';
    return true;
  }

  // NVP: NVPName '=' NVPValue
  _NVP(nvp) {
    let mark = this.lexer.markPosition();
    let name = new Sym(), value = new Sym();
    if (this._NVPName(name) && this._Literal('=') && this._NVPValue(value)) {
      nvp[name.data] = value.data;
      return true;
    }

    this.lexer.restorePosition(mark);
    return false;
  }

  // Number | Number '%' | 'ms' | 's'
  // too complicated for regex
  _NVPValue(value) {
    let mark = this.lexer.markPosition();
    if (this._Number(value)) {
      this._Literal('%');
      return true;
    }
    if (this._Literal('ms', value) || this._Literal('s', value)) {
      return true;
    }

    this.lexer.restorePosition(mark);
    return false;
  }

  // easier to express in regex
  _NVPName(name) {
    return this.lexer.scanNVPName(name);
  }

  // Collector MemoryChange ',' TimeSpent Explanation
  // too complicated for regex
  _GCTrace(source, trace) {
    let mark = this.lexer.markPosition();
    let collector = {};
    let change = {};
    let pause = {};
    let explanation = {};
    let data = {};
    if (this._Collector(collector) && this._MemoryChange(change)
      && this._Literal(',') && this._TimeSpent(pause)
      && this._Explanation(explanation)) {
      Object.assign(data, collector, change, pause, explanation);
      if (Object.keys(data).length) {
        trace.data = data;
        trace.type = 'trace';
      }
      return true;
    }

    this.lexer.restorePosition(mark);
    return false;
  }

  // 'Scavenge' | 'Mark-sweep'
  _Collector(collector) {
    let keyword = new Sym();
    if (this._KeyWord(SCAVENGE, keyword)
      || this._KeyWord(MARK_SWEEP, keyword)) {
      collector.collector = keys[keyword.type];
      return true;
    }
    return false;
  }

  // ObjectSize '(' MemorySize ')' Arrow ObjectSize '(' MemorySize ')' MB
  // too complicated for regex since we have decimal/integer numbers
  // and can't match things like '43.'
  _MemoryChange(change) {
    let mark = this.lexer.markPosition();
    let startObjectSize = new Sym(),
        endObjectSize = new Sym(),
        startMemorySize = new Sym(),
        endMemorySize = new Sym();
    if (this._Number(startObjectSize) && this._Literal('(')
      && this._Number(startMemorySize) && this._Literal(')')
      && this._KeyWord(ARROW)
      && this._Number(endObjectSize) && this._Literal('(')
      && this._Number(endMemorySize) && this._Literal(')')
      && this._KeyWord(MB)) {
        change.start_object_size = startObjectSize.data;
        change.end_object_size = endObjectSize.data;
        change.start_memory_size = startMemorySize.data;
        change.end_memory_size = endMemorySize.data;
        return true;
      }
    this.lexer.restorePosition(mark);
    return false;
  }

  // PauseTime MS | PauseTime '/' ExternalTime MS
  // too complicated for regex since we have decimal/integer numbers
  _TimeSpent(time) {
    let mark = this.lexer.markPosition();
    let pause = new Sym(), external = new Sym();
    if (this._Number(pause)) {
      time.pause = pause.data;
      if (this._KeyWord(MS)) {
        return true;
      }
      if (this._Literal('/')
        && this._Number(external)
        && this._KeyWord(MS)) {
        time.external_time = external.data;
        return true;
      }
    }

    this.lexer.restorePosition(mark);
    return false;
  }

   // [StepDescription] [GCReason] [CollectorReason]
  _Explanation(explanation) {
    let step = new Sym(), gcReason = new Sym(), cReason = new Sym();
    if (this._StepDescription(step)) {
      explanation.step_description = step.data;
    }
    // reason and steps are optional
    if (this._Reason(gcReason)) {
      explanation.gc_reason = gcReason.data;
      if (this._Reason(cReason)) {
        explanation.collector_reason = cReason.data;
      }
    }

    // technically it can be blank..so
    return true;
  }

  // '(' Sentence ')'
  _StepDescription(sym) {
    let mark = this.lexer.markPosition();
    if (this._Literal('(')
      && this.lexer.scanUntil(')', sym)
      && this._Literal(')')) {
      return true;
    }
    this.lexer.restorePosition(mark);
    return false;
  }

  // '[' Sentence ']'
  _Reason(sym) {
    let mark = this.lexer.markPosition();
    if (this._Literal('[')
      && this.lexer.scanUntil(']', sym)
      && this._Literal(']')) {
      return true;
    }
    this.lexer.restorePosition(mark);
    return false;
  }

  // VerboseTraceStart '\n'
  // VerboseTraceHeapList  '\n'
  // VerboseTraceExternal '\n'
  // VerboseTraceEnd
  _VerboseTrace(source, trace) {
    let mark = this.lexer.markPosition();
    let data = {};
    // this could be implemented as a DFA?
    if (this._VerboseTraceStart(source, data)
      && !this.lexer.isLastLine()) { // only a start, no following lines, fail
      this.lexer.skipLine();
      let source = {};

      if (!this._VerboseTraceHeapList(source, data)) {
        this.lexer.restorePosition(mark);
        return false;
      }

      // the Source is cosumed in the loop condition
      if (!this._VerboseTraceExternal(source, data)
        || this.lexer.isLastLine()) { // no proper ending, fail
        this.lexer.restorePosition(mark);
        return false;
      }
      this.lexer.skipLine();

      if (!this._Source(source)
        || !this._VerboseTraceEnd(source, data)) {
        this.lexer.restorePosition(mark);
        return false;
      }
      if (this._isVerboseComplete(source, data)) {
        trace.type = 'verbose';
        trace.data = data;
        return true;
      };
    }
    this.lexer.restorePosition(mark);
    return false;
  }

  //   Source VerboseTraceHeap
  // | Source VerboseTraceHeap VerboseTraceHeapList
  _VerboseTraceHeapList(source, data) {
    let mark = this.lexer.markPosition();
    // iteration instead of recursion
    // since we know when to stop
    // we can't be too strict about the order of
    // the traces in case of future updates
    // TODO: this should be able to handle streaming
    while (this._Source(source)
      && this._VerboseTraceHeap(source, data)) {
      // no proper ending, fail
      if (this.lexer.isLastLine()) {
        this.lexer.restorePosition(mark);
        return false;
      }
      this.lexer.skipLine();
    }
    return true;
  }

  // 'Memory allocator' ',' HeapStatsList
  _VerboseTraceStart(source, data) {
    let mark = this.lexer.markPosition();
    if (this._KeyWord(MEMORY_ALLOCATOR)) {
      let stats = {};
      if (this._HeapStatsList(stats)) {
        data.memory_allocator = stats;
        return true;
      }
    }
    this.lexer.restorePosition(mark);
    return false;
  }

  // HeapSection HeapStatsList
  _VerboseTraceHeap(source, trace) {
    let mark = this.lexer.markPosition();
    let keyword = new Sym();
    if (this._HeapSection(keyword)) {
      let stats = {};
      if (this._HeapStatsList(stats)) {
        trace[keys[keyword.type]] = stats;
        return true;
      }
    }
    this.lexer.restorePosition(mark);
    return false;
  }

  _HeapSection(keyword) {
    return this._KeyWord(NEW_SPACE, keyword)  // v4.x/6.x
      || this._KeyWord(OLD_SPACE, keyword)
      || this._KeyWord(CODE_SPACE, keyword)
      || this._KeyWord(MAP_SPACE, keyword)
      || this._KeyWord(LARGE_OBJECT_SPACE, keyword)
      || this._KeyWord(ALL_SPACES, keyword)
      // v0.12.x
      || this._KeyWord(OLD_POINTERS, keyword)
      || this._KeyWord(OLD_DATA_SPACE, keyword)
      || this._KeyWord(CELL_SPACE, keyword)
      || this._KeyWord(PROPERTY_CELL_SPACE, keyword);
  }

  // 'External memory reported' ':' Number KB
  _VerboseTraceExternal(source, trace) {
    let mark = this.lexer.markPosition();
    if (this._KeyWord(EXTERNAL_MEMORY)) {
      let value = {};
      if (this._Literal(':') && this._Number(value) && this._KeyWord(KB)) {
        trace.external_memory_reported = value.data;
        return true;
      }
    }
    this.lexer.restorePosition(mark);
    return false;
  }

  // 'Total time spent in GC' ':' Number MS
  _VerboseTraceEnd(source, trace) {
    let mark = this.lexer.markPosition();
    if (this._KeyWord(TOTAL_TIME)) {
      let value = {};
      if (this._Literal(':') && this._Number(value) && this._KeyWord(MS)) {
        trace.total_time_spent_in_gc = value.data;
        return true;
      }
    }
    this.lexer.restorePosition(mark);
    return false;
  }

  _isVerboseComplete(source, trace) {
    return (typeof trace.memory_allocator === 'object'
      && typeof trace.total_time_spent_in_gc === 'number'
      && typeof trace.external_memory_reported === 'number');
  }

  // ',' StatName ':' StatValue KB
  _HeapStatsList(stats) {
    let mark = this.lexer.markPosition();
    let name = new Sym(), value = new Sym();
    while (!this.lexer.isEOL() && this._Literal(',')) {
      if (this._StatName(name) && this._Literal(':')
        && this._Number(value) && this._KeyWord(KB)) {
        stats[keys[name.type]] = value.data;
      } else {
        break;  // we allow partial stats here
      }
    }
    if (Object.keys(stats).length) {
      return true;
    }
    this.lexer.restorePosition(mark);
    return false;
  }

  _StatName(sym) {
    return (this._KeyWord(USED, sym) || this._KeyWord(AVAILABLE, sym)
      || this._KeyWord(COMMITED, sym)
      || this._KeyWord(PROMOTED, sym) || this._KeyWord(START, sym)
      || this._KeyWord(PROMOTION, sym)
    );
  }

  _Number(sym) {
    return this.lexer.scanNumber(sym);
  }

  _Literal(str, sym) {
    return this.lexer.scanLiteralIgnoreWS(str, sym);
  }

  _KeyWord(type, sym) {
    return this.lexer.scanKeyWord(type, sym);
  }
}

module.exports = GCLParser;
