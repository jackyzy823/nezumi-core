#!/usr/bin/env node

var info = require('./package');
var matcher = require('./lib/matcher');

exports.name = info.name;
exports.version = info.version;

/*
 * @params {String} url
 * @params {Object|null} options
 *    options includes 1) extract_proxy 2)
 * @params {function} callback(err,)
 */

function extract(url, options, callback) {
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

exports.extract = extract;

if (module == require.main) {
  if (process.argv.length >= 2) {
    var url = process.argv[2];
    if (process.argv[3]) {
      try {
        var options = JSON.parse(process.argv[3])
      } catch (ex) {}
    }
    extract(url, options, function(err, urls) {
      if (err) {
        console.log('some thing wrong oops');
        console.trace(err);
        return;
      }
      console.log(urls);
    });
  }
} else {
  process.exit(0);
}