var nezumi = require('../index');

describe('test availabale', function() {

  it('pptv', function(done) {

    nezumi.extract('http://v.pptv.com/show/5DdW1DyiaElCzMZk.html', function(err, urls, options) {
      console.log(err, urls, options);
      done();
    });
  });

  it('iqiyi', function(done) {
    nezumi.extract('http://www.iqiyi.com/v_19rrnscu0w.html', function(err, urls, options) {
      console.log(err, urls, options);
      done();
    });
  });
  it('letv', function(done) {
    nezumi.extract('http://www.letv.com/ptv/vplay/20036169.html', function(err, urls, options) {
      console.log(err, urls, options);
      done();
    });
  });
  it('sohu', function(done) {
    nezumi.extract('http://tv.sohu.com/20140318/n396785017.shtml', function(err, urls, options) {
      console.log(err, urls, options);
      done();
    });
  });
  it('my sohu', function(done) {
    nezumi.extract('http://my.tv.sohu.com/pl/8990047/80342721.shtml', function(err, urls, options) {
      console.log(err, urls, options);
      done();
    });
  });
});