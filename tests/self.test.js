var nezumi = require('../index');

nezumi.extract('http://v.pptv.com/show/5DdW1DyiaElCzMZk.html', function (err, urls, options) {
	console.log(err, urls, options);
});

nezumi.extract('http://www.iqiyi.com/v_19rrnscu0w.html', function (err, urls, options) {
	console.log(err, urls, options);
});

nezumi.extract('http://www.letv.com/ptv/vplay/20036169.html', function (err, urls, options) {
	console.log(err, urls, options);
});