var fs = require('fs');
var path = require('path');
var filePath = path.join(__dirname, '../', 'extractors');

var extractorsFolder = fs.readdirSync(filePath);


// var router = {};
var include = {};
/*
router:{'include':{'domain'->module},'exclude':{'module'->pattern}}
*/

extractorsFolder.forEach(function(item, index) {
  var stat = fs.statSync(path.join(filePath, item, 'router.js'));
  if (!stat.isFile()) {
    return;
  }
  try {
    var inc = require(path.join(filePath, item, 'router.js')).include;
  } catch (ex) {
    return;
  }
  if (Array.isArray(inc)) {
    inc.forEach(function(i) {
      include[i] = item;
    });
  } else {
    include[inc] = item;
  }
});

var toWrite = JSON.stringify({
  'include': include,
});

fs.writeFileSync(path.join(__dirname, './router.json'), toWrite);