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
  matcher(url, function(err, moduleName, normalizedUrl) {
    if (err) {
      callback && callback(err);
      return;
    }
    var extractModule = require('./lib/extractors/' + moduleName);
    extractModule.parse(normalizedUrl, options, function(err, urlsList, moreOptions) {
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
    if (!url) {
      process.exit(0);
    }
    extract(url, options, function(err, infos) {
      if (err) {
        console.log('some thing wrong oops');
        console.trace(err);
        process.exit(1);
      }
      /* For usage  like  wget `node index.js url`*/
      infos.urls.forEach(function(item, idx) {
        process.stdout.write(item + ' '); //last space whatever
      });
      
      for(var i in infos.options){
        if(i == 'headers'){
           for(var j in infos.options[i]){
             process.stdout.write('--header "'+j+':'+infos.options[i][j]+'" ');
           }
        }
      }
      

    });
  } else {
    process.exit(0);
  }
}