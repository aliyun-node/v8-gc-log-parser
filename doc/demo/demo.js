'use strict';

(function() {
const parse = parseGCLog;

fetch('data.json').then(res => res.json()).then(logs => {

  let logElement = document.getElementById('log');
  let resultElement = document.getElementById('result');

  function showLog(log) {
    let result;
    try {
      const data = parse(log);
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

  showLog(logs.verbose_nvp);
});

})();
