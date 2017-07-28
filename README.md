# V8 Garbage Collection Log Parser

A simple tool for parsing V8 garbage collection logs.

## Support

### Flags

At the moment only logs produced by `--trace_gc`, `--trace_gc_nvp` and `--trace_gc_verbose` are supported.

### V8 versions

The V8 versions used by Node.js LTS versions are supported. That is:

* Node v8.x: V8 v5.8.x (will be updated to v6.x soon)
* Node v6.x: V8 v5.1.281.x
* Node v4.x: V8 v4.5.103.x

We will drop support when the corresponding Node.js LTS version is dropped.

For the grammar of these logs, see [grammar.md](doc/grammar.md).

## As CLI tool

```console
npm install -g v8-gc-log-parser
# output the result as JSON to stdout
v8-gc-log-parse <path-to-log-file>
```

## API

### class `GCLParser`

```js
const Parser = require('v8-gc-log-parser');
const parser = new Parser();
```

### `GCLParser#parseAllToData(text)`

First, create a parser instance

```js
const Parser = require('v8-gc-log-parser');
const parser = new Parser();
```
Then parse the log:

```js
// notice the new line character at the end of the log
const simple_log = '[43417:0x102004600]     9709 ms: Scavenge 344.4 (379.7) -> 342.8 (387.7) MB, 6.6 / 0.0 ms [allocation failure].\n'
parser.parseAllToData(simple_log);
```

The result will be:

```js
[{
  pid: 43417,
  isolate: '0x102004600',
  time_since_init: 9709,
  data: {
    collector: 'scavenge',
    start_object_size: 344.4,
    end_object_size: 342.8,
    start_memory_size: 379.7,
    end_memory_size: 387.7,
    pause: 6.6,
    external_time: 0,
    gc_reason: 'allocation failure'
  },
  type: 'trace'
}]
```

For logs produced by `--trace_gc_nvp`:

```js
const nvp_log = '[51548:0x102004600]     3912 ms: pause=2.4 mutator=383.5 gc=s reduce_memory=0 scavenge=2.18 old_new=0.12 weak=0.00 roots=0.05 code=0.00 semispace=1.97 object_groups=0.00 external_prologue=0.00 external_epilogue=0.00 external_weak_global_handles=0.01 steps_count=0 steps_took=0.0 scavenge_throughput=1073741824 total_size_before=52688696 total_size_after=52177656 holes_size_before=106616 holes_size_after=152344 allocated=16910984 promoted=1642176 semi_space_copied=1855136 nodes_died_in_new=20 nodes_copied_in_new=1 nodes_promoted=0 promotion_ratio=40.2% average_survival_ratio=70.3% promotion_rate=99.6% semi_space_copy_rate=45.4% new_space_allocation_throughput=3480.1 context_disposal_rate=0.0\n'

parser.parseAllToData(nvp_log);
```

Result:

```js
{
  "pid": 51548,
  "isolate": "0x102004600",
  "time_since_init": 3912,
  "data": {
    "pause": 2.4,
    "mutator": 383.5,
    "gc": "s",
    "reduce_memory": 0,
    "scavenge": 2.18,
    "old_new": 0.12,
    "weak": 0,
    "roots": 0.05,
    "code": 0,
    "semispace": 1.97,
    "object_groups": 0,
    "external_prologue": 0,
    "external_epilogue": 0,
    "external_weak_global_handles": 0.01,
    "steps_count": 0,
    "steps_took": 0,
    "scavenge_throughput": 1073741824,
    "total_size_before": 52688696,
    "total_size_after": 52177656,
    "holes_size_before": 106616,
    "holes_size_after": 152344,
    "allocated": 16910984,
    "promoted": 1642176,
    "semi_space_copied": 1855136,
    "nodes_died_in_new": 20,
    "nodes_copied_in_new": 1,
    "nodes_promoted": 0,
    "promotion_ratio": 40.2,
    "average_survival_ratio": 70.3,
    "promotion_rate": 99.6,
    "semi_space_copy_rate": 45.4,
    "new_space_allocation_throughput": 3480.1,
    "context_disposal_rate": 0
  },
  "type": "nvp"
}
```

For logs produced by `--trace_gc --trace_gc_verbose`

```js
const verbose_log = `[43748:0x103000000] Memory allocator,   used:   7204 KB, available: 1459164 KB
[43748:0x103000000] New space,          used:    957 KB, available:     50 KB, committed:   2048 KB
[43748:0x103000000] Old space,          used:    888 KB, available:      0 KB, committed:    980 KB
[43748:0x103000000] Code space,         used:    242 KB, available:      0 KB, committed:   1024 KB
[43748:0x103000000] Map space,          used:     49 KB, available:      0 KB, committed:     80 KB
[43748:0x103000000] Large object space, used:      0 KB, available: 1458123 KB, committed:      0 KB
[43748:0x103000000] All spaces,         used:   2137 KB, available: 1458173 KB, committed:   4132 KB
[43748:0x103000000] External memory reported:      0 KB
[43748:0x103000000] Total time spent in GC  : 0.6 ms\n`
parser.parseAllToData(verbose_log);
```

Result:

```js
{
  "pid": 43748,
  "isolate": "0x103000000",
  "type": "verbose",
  "data": {
    "memory_allocator": {
      "used": 7204,
      "available": 1459164
    },
    "new_space": {
      "used": 957,
      "available": 50,
      "committed": 2048
    },
    "old_space": {
      "used": 888,
      "available": 0,
      "committed": 980
    },
    "code_space": {
      "used": 242,
      "available": 0,
      "committed": 1024
    },
    "map_space": {
      "used": 49,
      "available": 0,
      "committed": 80
    },
    "large_object_space": {
      "used": 0,
      "available": 1458123,
      "committed": 0
    },
    "all_spaces": {
      "used": 2137,
      "available": 1458173,
      "committed": 4132
    },
    "external_memory_reported": 0,
    "total_time_spent_in_gc": 0.6
  }
}
```


## LICENSE

The MIT License (MIT)
Copyright (c) 2016 Alibaba Group
