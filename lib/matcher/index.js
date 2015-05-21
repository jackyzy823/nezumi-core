/*
 * Description: import matcher from js in extractors/ to generate general
 *              matcher
 */

var urlparse = require('url').parse;
var request = require('request');

try {
  var m = require('./matcher.json');
} catch (ex) {
  /*have proerty to write current folder?*/
  /*better do gen in npm postinstall*/
  require('./gen');
  var m = require('./matcher.json');
}

var regExpMatchers = m.regexp;
var stringMatchers = m.string;
var domainMatchers = m.domain;

/*
 * url: lowercase string ,startswith 'http://' or 'https://'
 * callback(err,moduleName) :
 */
module.exports = function match(url, callback) {
  if (typeof(url) !== 'string') {
    callback && callback(new Error('wrong type of url'), null);
    return
  }
  /*domain part of url is case insensitive,other parts are sensitive*/
  /*http://stackoverflow.com/a/24314935*/
  var urlInfo = urlparse(url);
  url = urlInfo.href;
  hostname = urlInfo.hostname;

  /* need some way to speeeeeed up*/
  /* First find in O(1) like hashtable,if not found,then find in O(n)*/
  for (var i in regExpMatchers) {
    if (RegExp(i, 'i').test(url)) {
      callback && callback(null, regExpMatchers[i]);
      return;
    }
  }

  for (var i in stringMatchers) {
    /* is this match method right?*/
    if (url.indexOf(i) != -1) {
      callback && callback(null, stringMatchers[i]);
      return;
    }
  }

  request.head({
    url: url
  }, function(err, resp, body) {
    if (err) {
      callback && callback(new Error('Network problem'), null);
      return;
    }
    if (resp.request.href && resp.request.href != url) {
      match(resp.request.href, callback);
    } else {
      callback && callback(new Error('not found'), null);
      return;
    }
  });
}