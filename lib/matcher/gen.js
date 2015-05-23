var fs = require('fs');
var path = require('path');
var filePath = path.join(__dirname, '../', 'extractors');
/*
var matcherCache = path.join(__dirname,'matcher.cache.json');
if(!fs.existsSync(matcherCache) || fs.statSync(filePath).mtime.getTime() > fs.statSync(matcherCache).mtime.getTime()){
  //cache not exists or expired   don't know if file modification time affect folder modification time
}
*/
var extractorsFolder = fs.readdirSync(filePath);

/* Priority regExp > string > domain*/
var regExpMatchers = {};
var stringMatchers = {};
var domainMatchers = {};
extractorsFolder.forEach(function(item, index) {
  var stat = fs.statSync(path.join(filePath, item));
  if (!stat.isDirectory()) {
    return;
  }
  try {
    var matcher = require(path.join(filePath, item)).matcher;
  } catch (ex) {

  }
  if (matcher instanceof RegExp) {
    /* RegExp resolution */
    regExpMatchers[matcher.source] = item;
  } else if (typeof matcher == 'string') {
    /* Perhaps wildcard resolution */
    stringMatchers[matcher] = item;
  } else if (!matcher) {
    /* Hostname resolution */
    domainMatchers[path.basename(item.toLowerCase(), '.js')] = item;
  }

});

var toWrite = JSON.stringify({
  'regexp': regExpMatchers,
  'string': stringMatchers,
  'domain': domainMatchers
});

var fd = fs.openSync(path.join(__dirname, './pattern.json'), 'w');
fs.writeSync(fd, toWrite);
fs.closeSync(fd);