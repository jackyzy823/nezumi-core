/* Matcher test */
var match = require('../lib/matcher.js');
var assert = require('assert');
match('http://www.iqiyi.com/yinyue/20130716/302007c528607f58.html', function(result) {
  assert.equal('iqiyi', result);
});

match('http://v.pptv.com/show/xt7FQ6sRgb8iaoAg.html', function(result) {
  /*casue pptv is a folder contains index.js*/
  assert.equal('pptv', result);
});