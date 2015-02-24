/*
 * Description: import matcher from js in extractors/ to generate general    *              matcher
 */
var fs = require('fs');
var urlparse = require('url').parse;

var filePath = __dirname + '/extractors/';
/*TODO: check no folder/symbolic link in result*/
var extractorsFolder = fs.readdirSync(filePath);
/* Priority regExp > string */
var regExpMatchers = {};
var stringMatchers = {};
var domainMatchers = {};
extractorsFolder.forEach(function(item, index) {
  var matcher = require(filePath + item).matcher;
  if (matcher instanceof RegExp) {
    /* RegExp resolution */
    regExpMatchers[matcher.source] = item;
  } else if (typeof matcher == 'string') {
    /* Perhaps wildcard resolution */
    stringMatchers[matcher] = item;
  } else if (!matcher) {
    /* Hostname resolution  */
    domainMatchers[item.split('.')[0]] = item;
  }

})

exports.match = function match(url) {
  for (var i in regExpMatchers) {
    if (RegExp(i).test(url)) {
      return regExpMatchers[i];
    }
  }

  for (var i in stringMatchers) {
    if (url.indexOf(i) != -1) {
      return stringMatchers[i];
    }
  }

  var urlInfo = urlparse(url);
  for (var i in domainMatchers) {
    if (i == urlInfo.hostname) {
      /*hostname do not contains port */
      return domainMatchers[i];
    }
  }
  /* may need relocation (like short urls?) */

  return null;
}

// exports.regExps = regExpMatchers;
// exports.strings = stringMatchers;
// exports.domains = domainMatchers;