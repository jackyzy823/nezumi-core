var fs = require('fs');
var path = require('path');
var filePath = path.join(__dirname, '../', 'extractors');

var extractorsFolder = fs.readdirSync(filePath);


var router = {}
  /*
    domainMatchers = {'www.aaa.com':}

  */

extractorsFolder.forEach(function(item, index) {
  var stat = fs.statSync(path.join(filePath, item, 'router.js'));
  if (!stat.isFile()) {
    return;
  }
  try {
    var r = require(path.join(filePath, item, 'router.js')).router;
  } catch (ex) {
    return;
  }
  if (Array.isArray(r)) {
    r.forEach(function(i) {
      router[i] = item;
    });
  } else {
    router[r] = item;
  }
});

var toWrite = JSON.stringify({
  'router': router,
});

var fd = fs.openSync(path.join(__dirname, './router.json'), 'w');
fs.writeSync(fd, toWrite);
fs.closeSync(fd);