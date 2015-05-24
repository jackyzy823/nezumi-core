/*
 * Description: import matcher from js in extractors/ to generate general
 *              matcher
 */

var request = require('request');
var urlparse = require('url').parse;
var domainparse = require('../utils/domain').parse;

try {
  var m = require('./router.json');
} catch (ex) {
  /*have proerty to write current folder?*/
  /*better do gen in npm postinstall*/
  require('./gen_router');
  var m = require('./router.json');
}

var router = m.router;
/*
 * url: lowercase string ,startswith 'http://' or 'https://'
 * callback(err,moduleName,normalizedUrl) :
 */
module.exports = function match(url, callback) {
  if (typeof(url) !== 'string') {
    callback && callback(new Error('wrong type of url'), null, null);
    return
  }
  /*domain part of url is case insensitive,other parts are sensitive*/
  /*http://stackoverflow.com/a/24314935*/
  /*see also node module url 'api */
  var urlInfo = urlparse(url);

  if (!urlInfo.protocol) {
    url = 'http://' + url;
    urlInfo = urlparse(url);
  }

  url = urlInfo.href;
  var host = urlInfo.hostname;
  var domain = domainparse(urlInfo.hostname).domain;

  if (router[host]) {
    callback && callback(null, router[host], url);
    return;
  }

  if (router[domain]) {
    callback && callback(null, router[domain], url);
    return;
  }


  request.head({
    url: url
  }, function(err, resp, body) {
    if (err) {
      callback && callback(new Error('Network problem'), null, null);
      return;
    }
    if (resp.request.href && resp.request.href != url) {
      match(resp.request.href, callback);
    } else {
      callback && callback(new Error('not found'), null, null);
      return;
    }
  });
}