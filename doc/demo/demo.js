'use strict';

(function() {
const Parser = require('../../');
const parser = new Parser();

const logs = {
  simple: '[43417:0x102004600]     9709 ms: Scavenge 344.4 (379.7) -> 342.8 (387.7) MB, 6.6 / 0.0 ms [allocation failure].\n',
  nvp: '[51548:0x102004600]     3912 ms: pause=2.4 mutator=383.5 gc=s reduce_memory=0 scavenge=2.18 old_new=0.12 weak=0.00 roots=0.05 code=0.00 semispace=1.97 object_groups=0.00 external_prologue=0.00 external_epilogue=0.00 external_weak_global_handles=0.01 steps_count=0 steps_took=0.0 scavenge_throughput=1073741824 total_size_before=52688696 total_size_after=52177656 holes_size_before=106616 holes_size_after=152344 allocated=16910984 promoted=1642176 semi_space_copied=1855136 nodes_died_in_new=20 nodes_copied_in_new=1 nodes_promoted=0 promotion_ratio=40.2% average_survival_ratio=70.3% promotion_rate=99.6% semi_space_copy_rate=45.4% new_space_allocation_throughput=3480.1 context_disposal_rate=0.0\n',
  verbose: `[43748:0x103000000] Memory allocator,   used:   7204 KB, available: 1459164 KB
[43748:0x103000000] New space,          used:    957 KB, available:     50 KB, committed:   2048 KB
[43748:0x103000000] Old space,          used:    888 KB, available:      0 KB, committed:    980 KB
[43748:0x103000000] Code space,         used:    242 KB, available:      0 KB, committed:   1024 KB
[43748:0x103000000] Map space,          used:     49 KB, available:      0 KB, committed:     80 KB
[43748:0x103000000] Large object space, used:      0 KB, available: 1458123 KB, committed:      0 KB
[43748:0x103000000] All spaces,         used:   2137 KB, available: 1458173 KB, committed:   4132 KB
[43748:0x103000000] External memory reported:      0 KB
[43748:0x103000000] Total time spent in GC  : 0.6 ms\n`
};

let logElement = document.getElementById('log');
let resultElement = document.getElementById('result');

function showLog(log) {
  let result;
  try {
    const data = parser.parseAllToData(log);
    result = JSON.stringify(data, null, 2);
  } catch (e) {
    result = e.stack;
  }
  logElement.textContent = log;
  document.getElementById('result').textContent = result;
}

function showLogForButton(e) {
  logElement.contentEditable = 'false';
  document.getElementById('parse').classList.add('hidden');
  const log = logs[e.target.value];
  showLog(log);
}

const switches = document.getElementsByClassName('j-log-switch');
for (let i = 0; i < switches.length; ++i) {
  switches[i].addEventListener('click', showLogForButton);
}

document.getElementById('custom').addEventListener('click', function(e) {
  document.getElementById('parse').classList.remove('hidden');
  logElement.textContent = '';
  logElement.contentEditable = 'true';
  logElement.focus();
});

document.getElementById('parse').addEventListener('click', function(e) {
  showLog(logElement.textContent + '\n');
});

showLog(logs.simple);
})();
