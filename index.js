var info = require('./package');
var matcher = require('./lib/matcher');

exports.name = info.name;
exports.version = info.version;


exports.extract = function extract(url, options, callback) {
  matcher(url, function(err, moduleName) {
    if (err) {
      callback && callback(err);
      return;
    }
    var extractModule = require('./lib/extractors/' + moduleName);
    extractModule.parse(url, options, function(err, urlsList, moreOptions) {
      //urlsList =>[ {title:xx,size:yy,urls:['xx.flv?part1','xx.flv?part2']},{title:xx,size:yy,urls:['']}]
      //some handler?
      callback && callback(err, urlsList, moreOptions);
    });
  });
}