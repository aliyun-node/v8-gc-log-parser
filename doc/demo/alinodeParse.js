'use strict';

(function() {
  var GC_TYPES = {
    s: 'Scavenge',
    ms: 'Mark-sweep'
  };

  function migrateNVPLog(obj, d) {
    var keys = Object.keys(obj);
    var newObj = {};
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i];
      var value = obj[key];
      if (key === 'gc') {
        newObj.gc_type = GC_TYPES[value];
      } else if (/_rate$/.test(key)) {
        newObj[key] = value / 100;
      } else {
        newObj[key] = value;
      }
    }

    newObj.time_millis_since_init = d.time_since_init;

    return newObj;
  }

  function migrateVerboseLog(obj) {
    var newObj = {};
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i];
      var value = obj[key];
      if (key === 'external_memory_reported') {
        newObj.amount_of_external_allocated_memory = value;
      } else if (key === 'total_time_spent_in_gc') {
        newObj.total_gc_time_ms = value;
      } else if (typeof value === 'object') {
        newObj[key] = {};
        var fields = Object.keys(value);
        for (var j = 0; j < fields.length; ++j) {
          var field = fields[j];
          newObj[key][field] = value[field] * 1024;  // KB to B
        }
      }
    }
    return newObj;
  }

  function parse(logs) {
    var parser = new GCLParser();
    var data = parser.parseAllToData(logs);
    var merged = data.reduce(function(arr, d, i) {
      var obj = d.data;
      var newObj, prevObj;
      if (d.type === 'nvp') {
        newObj = migrateNVPLog(obj, d);
        newObj.log_type = 'nvp';
        arr.push(newObj);
      } else if (d.type === 'verbose') {
        if (arr.length > 0 && arr[arr.length - 1].log_type === 'nvp') {
          prevObj = arr[arr.length - 1];
          newObj = migrateVerboseLog(obj);
          Object.assign(prevObj, newObj);
          prevObj.log_type = undefined;
        } else {
          console.log('Verbose log not following NVP');
        }
      } else {
        console.log('Discard gc log');
      }
      return arr;
    }, []);
    return merged;
  }

  window.parseGCLog = parse;
})();
