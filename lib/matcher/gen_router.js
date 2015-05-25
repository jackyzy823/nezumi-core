var fs = require('fs');
var path = require('path');
var filePath = path.join(__dirname, '../', 'extractors');

var extractorsFolder = fs.readdirSync(filePath);


var router = {};

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

fs.writeSync(path.join(__dirname, './router.json'), toWrite);