/*
 * Description: import matcher from js in extractors/ to generate general
 *              matcher
 */
var fs = require('fs');
var path = require('path');
var protocol = {
  'http:': require('http'),
  'https:': require('https')
};
var urlparse = require('url').parse;

var filePath = path.join(__dirname, 'extractors');
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
  if ((stat.isFile() && path.extname(item).toLowerCase() != '.js') ||
    (stat.isDirectory() && !fs.existsSync(path.join(filePath, item, 'index.js')))) {
    /*exclude file not endswith .js  or directory not contains index.js*/
    return;
  };
  var matcher = require(path.join(filePath, item)).matcher;
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



/*
 * url: lowercase string ,startswith 'http://' or 'https://'
 * callback : function(extractorModule){} return extractorModuleName or null
 */
exports.match = function match(url, callback) {
  var result = null;
  for (var i in regExpMatchers) {
    if (RegExp(i).test(url)) {
      result = regExpMatchers[i];
      callback && callback(result);
      /*return result;*/
      return;
    }
  }

  for (var i in stringMatchers) {
    if (url.indexOf(i) != -1) {
      result = stringMatchers[i];
      callback && callback(result);
      /*return result;*/
      return;
    }
  }

  var urlInfo = urlparse(url);
  for (var i in domainMatchers) {
    if (i == urlInfo.hostname) {
      /*hostname do not contains port */
      result = domainMatchers[i];
      callback && callback(result);
      /*return result;*/
      return;
    }
  }
  /* may need relocation (like short urls?) */
  /* TODO: move request to utils or use https://github.com/request/request for replacement?*/
  protocol[urlInfo.protocol].request({
    method: 'HEAD',
    path: urlInfo.path,
    host: urlInfo.host,
    auth: urlInfo.auth,
    agent: false
  }, function(res) {
    /*ignore body data*/
    globalres = res;
    res.on('error', function(e) {
      callback && callback(null);
      return;
    });
    var location = res.headers['location'];
    if (!location) {
      callback && callback(result);
      return;
      /*return result;*/
    }
    match(location, callback);
  }).end();
}
