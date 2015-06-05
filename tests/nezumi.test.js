/* Matcher test */
var match = require('../lib/matcher');
var assert = require('assert');
match('http://www.iqiyi.com/yinyue/20130716/302007c528607f58.html', function(err, result) {
  assert.equal('iqiyi', result);
});

match('http://v.pptv.com/show/xt7FQ6sRgb8iaoAg.html', function(err, result) {
  assert.equal('pptv', result);
});

match('v.pptv.com/show/xt7FQ6sRgb8iaoAg.html', function(err, result) {
  assert.equal('pptv', result);
});
/*redirect of http://www.iqiyi.com/yinyue/20130716/302007c528607f58.html */
match('http://t.cn/RADuDaY', function(err, result) {
  assert.equal('iqiyi', result);
});

match('http://www.letv.com/ptv/vplay/835594.html', function(err, result) {
  assert.equal('letv', result);
});

match('http://tv.sohu.com/20140318/n396785017.shtml', function(err, result) {
  assert.equal('sohu', result);
});

match('http://my.tv.sohu.com/pl/8990047/80342721.shtml', function(err, result) {
  assert.equal('sohu', result);
});


match(123, function(err, result) {
  assert.throws(function() {
    assert.ifError(err)
  }, /wrong type of url/);
});

// var extractor = require('../index.js');

// extractor.extract('http://www.iqiyi.com/yinyue/20130716/302007c528607f58.html', {}, function(err, resultLists, options) {
//   console.log(err, resultLists, options);
// })