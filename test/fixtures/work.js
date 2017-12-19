'use strict';

const assert = require('assert');
const http = require('http');
const v8 = require('v8');

const DURATION = parseInt(process.env.TEST_DURATION, 10) || 5 * 1000;
const INTERVAL = parseInt(process.env.TEST_INTERVAL, 10) || 1;

function makeRequest(host, port, data) {
  const req = http.request({
    method: 'POST',
    host: host,
    port: port
  });

  req.on('response', function(res) {
    const data = [];
    res.on('data', function(chunk) {
      data.push(chunk);
    });
    res.on('end', function() {
      const str = Buffer.concat(data).toString();
      assert(str.length > 0);
    });
  });

  req.end();
}

let shouldStop = false;
const server = http.createServer(function(req, res) {
  res.write(new Date().toLocaleTimeString());
  res.write(JSON.stringify(v8.getHeapSpaceStatistics()));
  res.write(JSON.stringify(v8.getHeapStatistics()));
  res.end('ok');
}).listen(0, '127.0.0.1', function() {
  const host = server.address().address;
  const port = server.address().port;

  const interval = setInterval(() => {
    if (shouldStop) {
      server.close();
      return clearInterval(interval);
    }
    makeRequest(host, port);
  }, INTERVAL);
});

setTimeout(() => {
  shouldStop = true;
}, DURATION);
