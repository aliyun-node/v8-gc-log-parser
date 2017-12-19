## Overview

White spaces could be meaningful in some contexts.
The grammar is not regular and not LL(1)/LR(1). A hand-written recursive descent parser with some hacks would be more suitable for this.

## Samples

### `trace_gc`

```
// 0.12
[88872]    90523 ms: Scavenge 1132.1 (1214.5) -> 1119.2 (1215.5) MB, 1.5 ms [allocation failure].
[88872]    90612 ms: Mark-sweep 1130.7 (1215.5) -> 1115.4 (1217.5) MB, 10.3 ms (+ 14.3 ms in 21 steps since start of marking, biggest step 3.5 ms) [GC interrupt] [GC in old space requested].
[88872]   111427 ms: Mark-sweep 1357.4 (1444.5) -> 1357.4 (1444.5) MB, 38.7 ms [last resort gc].

// 4.x
[12543:0x102004a00]   140144 ms: Scavenge 9.7 (46.9) -> 8.9 (46.9) MB, 0.4 / 0 ms [allocation failure].
[12543:0x102004a00]   140585 ms: Scavenge 10.6 (47.9) -> 9.9 (47.9) MB, 0.2 / 0 ms (+ 0.8 ms in 2 steps since last GC) [allocation failure].
[12543:0x102004a00]   140589 ms: Mark-sweep 10.7 (47.9) -> 9.0 (47.9) MB, 2.6 / 0 ms (+ 6.3 ms in 20 steps since start of marking, biggest step 1.1 ms) [GC interrupt] [GC in old space requested].

// 6.x
[43417:0x102004600]     9709 ms: Scavenge 344.4 (379.7) -> 342.8 (387.7) MB, 6.6 / 0.0 ms [allocation failure].
[43417:0x102004600]     9869 ms: Scavenge 408.3 (445.5) -> 406.5 (456.5) MB, 6.5 / 0.0 ms (+ 8.0 ms in 60 steps since last GC) [allocation failure].
[43417:0x102004600]     9932 ms: Mark-sweep 428.7 (477.0) -> 134.8 (181.8) MB, 10.7 / 0.0 ms (+ 9.0 ms in 110 steps since start of marking, biggest step 2.3 ms) [GC interrupt] [GC in old space requested].
```

### `trace_gc_verbose`

```
[87120] Memory allocator,   used:  40420 KB, available: 1458716 KB
[87120] New space,          used:    532 KB, available:   1515 KB, committed:   4096 KB
[87120] Old pointers,       used:    972 KB, available:      0 KB, committed:   1903 KB
[87120] Old data space,     used:    801 KB, available:      1 KB, committed:   1199 KB
[87120] Code space,         used:    558 KB, available:      0 KB, committed:    996 KB
[87120] Map space,          used:    118 KB, available:      0 KB, committed:    128 KB
[87120] Cell space,         used:      4 KB, available:      0 KB, committed:    128 KB
[87120] PropertyCell space, used:     26 KB, available:      0 KB, committed:     64 KB
[87120] Large object space, used:      0 KB, available: 1457675 KB, committed:      0 KB
[87120] All spaces,         used:   3013 KB, available:   1517 KB, committed:   8515 KB
[87120] External memory reported:      8 KB
[87120] Total time spent in GC  : 1.8 ms

// 4.x.
[85689:0x102800000] Memory allocator,   used:  44032 KB, available: 1455104 KB
[85689:0x102800000] New space,          used:    575 KB, available:   3455 KB, committed:   8062 KB
[85689:0x102800000] Old space,          used:   4167 KB, available:      0 KB, committed:   5038 KB
[85689:0x102800000] Code space,         used:   1124 KB, available:      1 KB, committed:   1992 KB
[85689:0x102800000] Map space,          used:    409 KB, available:      0 KB, committed:   1007 KB
[85689:0x102800000] Large object space, used:      0 KB, available: 1454063 KB, committed:      0 KB
[85689:0x102800000] All spaces,         used:   6277 KB, available: 1457520 KB, committed:  16100 KB
[85689:0x102800000] External memory reported:     16 KB
[85689:0x102800000] Total time spent in GC  : 4.9 ms

// 6.x
[43748:0x103000000] Memory allocator,   used:   7204 KB, available: 1459164 KB
[43748:0x103000000] New space,          used:    957 KB, available:     50 KB, committed:   2048 KB
[43748:0x103000000] Old space,          used:    888 KB, available:      0 KB, committed:    980 KB
[43748:0x103000000] Code space,         used:    242 KB, available:      0 KB, committed:   1024 KB
[43748:0x103000000] Map space,          used:     49 KB, available:      0 KB, committed:     80 KB
[43748:0x103000000] Large object space, used:      0 KB, available: 1458123 KB, committed:      0 KB
[43748:0x103000000] All spaces,         used:   2137 KB, available: 1458173 KB, committed:   4132 KB
[43748:0x103000000] External memory reported:      0 KB
[43748:0x103000000] Total time spent in GC  : 0.6 ms

// 8.x
[23783:0x3ee3550] Memory allocator,   used: 670600 KB, available: 3556472 KB
[23783:0x3ee3550] New space,          used:    426 KB, available:  15685 KB, committed:  32768 KB
[23783:0x3ee3550] Old space,          used: 126329 KB, available:    663 KB, committed: 191828 KB
[23783:0x3ee3550] Code space,         used:   3706 KB, available:      0 KB, committed:   4608 KB
[23783:0x3ee3550] Map space,          used:   2714 KB, available:      0 KB, committed:   6676 KB
[23783:0x3ee3550] Large object space, used: 432914 KB, available: 3555951 KB, committed: 433184 KB
[23783:0x3ee3550] All spaces,         used: 566091 KB, available: 3572300 KB, committed: 669064 KB
[23783:0x3ee3550] External memory reported:  66962 KB
[23783:0x3ee3550] External memory global 0 KB
[23783:0x3ee3550] Total time spent in GC  : 1714037.1 ms

// additional
[90361:0x102800400] Heap growing factor 1.1 based on mu=0.970, speed_ratio=471 (gc=839959, mutator=1784)
[90361:0x102800400] Grow: old size: 27549 KB, new limit: 51865 KB (1.1)
[43748:0x103000000] Memory reducer: call rate 11.251, high alloc, foreground
[43748:0x103000000] Memory reducer: waiting for 8000 ms
```

### `trace_gc_nvp`

```
// v0.12.x
[87623]    21738 ms: pause=1.2 mutator=69.5 gc=s external=0.0 mark=0.0 sweep=0.00 sweepns=0.00 sweepos=0.00 sweepcode=0.00 sweepcell=0.00 sweepmap=0.00 evacuate=0.0 new_new=0.0 root_new=0.0 old_new=0.0 compaction_ptrs=0.0 intracompaction_ptrs=0.0 misc_compaction=0.0 weakcollection_process=0.0 weakcollection_clear=0.0 weakcollection_abort=0.0 total_size_before=410249136 total_size_after=396809216 holes_size_before=12582792 holes_size_after=12614440 allocated=14873496 promoted=1428088 semi_space_copied=1435056 nodes_died_in_new=29 nodes_copied_in_new=2 nodes_promoted=0 promotion_rate=8.7% semi_space_copy_rate=8.7% steps_count=0 steps_took=0.0 
[87623]    21795 ms: pause=4.8 mutator=52.5 gc=ms external=0.0 mark=0.6 sweep=3.71 sweepns=2.72 sweepos=0.33 sweepcode=0.28 sweepcell=0.01 sweepmap=0.07 evacuate=0.0 new_new=0.1 root_new=0.0 old_new=0.0 compaction_ptrs=0.0 intracompaction_ptrs=0.0 misc_compaction=0.1 weakcollection_process=0.0 weakcollection_clear=0.0 weakcollection_abort=0.0 total_size_before=406663248 total_size_after=391420328 holes_size_before=12614440 holes_size_after=13991208 allocated=9854032 promoted=1409952 semi_space_copied=1626888 nodes_died_in_new=16 nodes_copied_in_new=2 nodes_promoted=1 promotion_rate=12.7% semi_space_copy_rate=14.6% steps_count=17 steps_took=9.0 longest_step=2.1 incremental_marking_throughput=848273 

// v4.x
[90819:0x101804a00] [I:0x101804a00]    30388 ms: pause=1.5 mutator=106.6 gc=s external=0.0 mark=0.0 sweep=0.00 sweepns=0.00 sweepos=0.00 sweepcode=0.00 sweepcell=0.00 sweepmap=0.00 evacuate=0.0 new_new=0.0 root_new=0.0 old_new=0.0 compaction_ptrs=0.0 intracompaction_ptrs=0.0 misc_compaction=0.0 weak_closure=0.0 inc_weak_closure=0.0 weakcollection_process=0.0 weakcollection_clear=0.0 weakcollection_abort=0.0 total_size_before=360401216 total_size_after=346970376 holes_size_before=111429384 holes_size_after=112050664 allocated=14874664 promoted=1435056 semi_space_copied=1441408 nodes_died_in_new=16 nodes_copied_in_new=1 nodes_promoted=0 promotion_ratio=8.8% average_survival_ratio=17.5% promotion_rate=99.6% semi_space_copy_rate=8.8% new_space_allocation_throughput=134525 context_disposal_rate=0.0 steps_count=29 steps_took=0.1 scavenge_throughput=9463255
[90819:0x101804a00] [I:0x101804a00]    30444 ms: pause=6.5 mutator=48.8 gc=ms external=0.0 mark=0.6 sweep=5.23 sweepns=4.34 sweepos=0.36 sweepcode=0.15 sweepcell=0.00 sweepmap=0.05 evacuate=0.0 new_new=0.0 root_new=0.0 old_new=0.1 compaction_ptrs=0.0 intracompaction_ptrs=0.0 misc_compaction=0.2 weak_closure=0.0 inc_weak_closure=0.0 weakcollection_process=0.0 weakcollection_clear=0.0 weakcollection_abort=0.0 total_size_before=354597632 total_size_after=345617768 holes_size_before=112050664 holes_size_after=113357064 allocated=7627256 promoted=1402920 semi_space_copied=718712 nodes_died_in_new=8 nodes_copied_in_new=1 nodes_promoted=0 promotion_ratio=15.3% average_survival_ratio=18.1% promotion_rate=97.3% semi_space_copy_rate=7.8% new_space_allocation_throughput=135048 context_disposal_rate=0.0 steps_count=623 steps_took=9.9 longest_step=1.0 incremental_marking_throughput=19200959

// v6.x
[51548:0x102004600]     3912 ms: pause=2.4 mutator=383.5 gc=s reduce_memory=0 scavenge=2.18 old_new=0.12 weak=0.00 roots=0.05 code=0.00 semispace=1.97 object_groups=0.00 external_prologue=0.00 external_epilogue=0.00 external_weak_global_handles=0.01 steps_count=0 steps_took=0.0 scavenge_throughput=1073741824 total_size_before=52688696 total_size_after=52177656 holes_size_before=106616 holes_size_after=152344 allocated=16910984 promoted=1642176 semi_space_copied=1855136 nodes_died_in_new=20 nodes_copied_in_new=1 nodes_promoted=0 promotion_ratio=40.2% average_survival_ratio=70.3% promotion_rate=99.6% semi_space_copy_rate=45.4% new_space_allocation_throughput=3480.1 context_disposal_rate=0.0
[51548:0x102004600]     4252 ms: pause=4.8 mutator=335.1 gc=ms reduce_memory=0 clear=0 clear.code_flush=0.0 clear.dependent_code=0.0 clear.global_handles=0.0 clear.maps=0.0 clear.slots_buffer=0.0 clear.store_buffer=0.0 clear.string_table=0.1 clear.weak_cells=0.0 clear.weak_collections=0.0 clear.weak_lists=0.2 evacuate=1.9 evacuate.candidates=0.0 evacuate.clean_up=0.0 evacuate.copy=1.7 evacuate.update_pointers=0.1 evacuate.update_pointers.between_evacuated=0.0 evacuate.update_pointers.to_evacuated=0.0 evacuate.update_pointers.to_new=0.1 evacuate.update_pointers.weak=0.0 external.mc_prologue=0.0 external.mc_epilogue=0.0 external.mc_incremental_prologue=0.0 external.mc_incremental_epilogue=0.0 external.weak_global_handles=0.0 finish=0.2 mark=2.1 mark.finish_incremental=0.0 mark.prepare_code_flush=1.8 mark.roots=0.2 mark.weak_closure=0.0 mark.weak_closure.ephemeral=0.0 mark.weak_closure.weak_handles=0.0 mark.weak_closure.weak_roots=0.0 mark.weak_closure.harmony=0.0 sweep=0.2 sweep.code=0.0 sweep.map=0.0 sweep.old=0.0 incremental_finalize=0.0 steps_count=14 steps_took=7.8 longest_step=2.6 finalization_steps_count=2 finalization_steps_took=0.2 finalization_longest_step=0.2 incremental_marking_throughput=1853084 total_size_before=67962160 total_size_after=16890240 holes_size_before=966256 holes_size_after=1783632 allocated=15784504 promoted=1805184 semi_space_copied=1765280 nodes_died_in_new=19 nodes_copied_in_new=2 nodes_promoted=0 promotion_ratio=44.2% average_survival_ratio=72.0% promotion_rate=97.3% semi_space_copy_rate=43.2% new_space_allocation_throughput=3712.6 context_disposal_rate=0.0 compaction_speed=2182435
```

## Grammar

Notation: `[A]` means the nonterminal A is optional, `'B'` means it is a terminal 'B'.

Basic blocks:

```
MB: 'MB'
MS: 'ms'
KB: 'KB'
Number: Decimal | Integer
Decimal: Digit+ '.' Digit+
Integer: Digit+
Hex: '0x' HexCharacter+
HexCharacter: Digit | 'a'..'f' | 'A'..'F'
Character: 'a'..'z' | 'A'..'Z'
Digit: '0'..'9'
WhiteSpace: ' ' | '\t'
```

The general sturcture:

```
GCLog: Source Trace

Trace: UpTime ':' GCTrace
     | UpTime ':' NVPTrace
     | VerboseTrace

UpTime: Digit+ 'ms'

GCTrace: Collector MemoryChange ',' TimeSpent Explanation
NVPTrace: NVP | NVP NVPTrace
VerboseTrace: VerboseTraceStart '\n'
              VerboseTraceHeapList  '\n'
              VerboseTraceExternal '\n'
              VerboseTraceEnd
```

Source:

```
Source: PIDSource | FullSource [IsolateMark]
PIDSource:   '[' PID ']'
FullSource:  '[' PID ':' Isolate ']'
IsolateMark: '[' 'I:' Isolate  ']'
PID: Digit{1, 5}
Isolate: Hex
```

GC Trace:

```
GCTrace: Collector MemoryChange ',' TimeSpent Explanation

Collector: 'Scavenge' | 'Mark-sweep'

MemoryChange: ObjectSize '(' MemorySize ')' Arrow ObjectSize '(' MemorySize ')' MB
ObjectSize: Number
MemorySize: Number
Arrow: '->'

TimeSpent: PauseTime MS | PauseTime '/' ExternalTime MS
PauseTime: Number
ExternalTime: Number

Explanation: [StepDescription] [GCReason] [CollectorReason]
// Sentence could be anything, we just "scan until" here
StepDescription: '(' Sentence ')'
GCReason: '[' Sentence ']'
CollectorReason: '[' Sentence ']'
```

NVP Trace:

```
NVPTrace: NVP | NVP NVPTrace
NVP: NVPName '=' NVPValue
NVPName: NVPNameCharacter+
NVPNameCharacter: '0'..'9' | 'a'..'z' | '_' | '.'
NVPValue: Number | Number '%' | 'ms' | 's'
```

Verbose Trace:

```
VerboseTrace: VerboseTraceStart '\n'
              VerboseTraceHeapList  '\n'
              VerboseTraceExternal '\n'
              VerboseTraceEnd
            | VerboseTraceStart '\n'
              VerboseTraceHeapList  '\n'
              VerboseTraceExternal '\n'
              VerboseTraceExternalGlobal '\n'
              VerboseTraceEnd


VerboseTraceStart: MemoryAllocator ',' HeapStatsList
MemoryAllocator: 'Memory allocator'

VerboseTraceHeapList: Source VerboseTraceHeap
                    | Source VerboseTraceHeap VerboseTraceHeapList
VerboseTraceHeap: HeapSection HeapStatsList

VerboseTraceExternal: ExternalMemory ':' Number KB
ExternalMemory: 'External memory reported'

VerboseTraceExternalGlobal: ExternalMemoryGlobal ':' Number KB
ExternalMemoryGlobal: 'External memory global'

VerboseTraceEnd: TotalTime ':' Number MS
TotalTime: 'Total time spent in GC'

HeapStatsList: ',' StatName ':' StatValue KB
StatName: 'used' | 'available' | 'commited'
StatValue: Number

HeapSection: 'New space' | 'Code space' | 'Map space'
           | 'Large object space' | 'All spaces'
           | 'Old space'                          // v4.x and v6.x
           | 'Cell space' | 'PropertyCell space'  // v0.12.x
           | 'Old pointers' | 'Old data space'    // v0.12.x
```
