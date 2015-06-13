#!/usr/bin/env node

var info = require('./package');
var matcher = require('./lib/matcher');

var ext = require('./lib/utils/builtinext');

exports.name = info.name;
exports.version = info.version;

/*
 * @params {String} url
 * @params {Object|null} options
 *    options includes 1) proxy for extractors 2) quality
 * @params {function} callback(err,urlsList,moreOptions)
 *   moreOptions include 1)common headers for download headers:{'referer':xxx} 2)afterDownload function ,such as data decrypt.
 *   urlList {Array|function} ->
 *        Array should like [{titile:t1,urls:[a,b,c],size:123,options:{ }},{title:t1,urls:function(){ function.prototype.next(){}},size:123}]
 *        options in urlList may include 1)headers for download
 */

function extract(url, options, callback) {
  options = options || {};

  if (!url || typeof(url) !== 'string') {
    callback && callback(new Error('please specfic a url!'));
    return;
  }

  if (!callback && typeof options == 'function') {
    callback = options;
    options = {};
  }

  if (!options.quality || !Number.isInteger(options.quality) || options.quality > 5 || options.quality < 1) {
    options.quality = 5;
  }


  matcher(url, function(err, moduleName, normalizedUrl) {
    if (err) {
      callback && callback(err);
      return;
    }
    var ExtractModule = require('./lib/extractors/' + moduleName);
    new ExtractModule(options).parse(normalizedUrl, function(err, urlLists, moreOptions) {
      moreOptions = moreOptions || {};
      if (!Array.isArray(urlLists)) {
        urlLists = [urlLists];
      }
      callback && callback(err, urlLists, moreOptions);
    });
    // extractModule.parse(normalizedUrl, options, function(err, urlLists, moreOptions) {
    //   //urlLists =>[ {title:xx,size:yy,urls:['xx.flv?part1','xx.flv?part2']},{title:xx,size:yy,urls:['']}]
    //   //some handler?
    //   callback && callback(err, urlLists, moreOptions);
    // });
  });
}



exports.extract = extract;

if (module == require.main) {
  if (process.argv.length >= 2) {
    var url = process.argv[2];
    if (process.argv[3]) {
      try {
        var options = JSON.parse(process.argv[3]);
      } catch (ex) {}
    }
    if (!url) {
      process.exit(0);
    }
    extract(url, options, function(err, infos, globalOptions) {
      if (err) {
        console.log('some thing wrong oops');
        console.trace(err);
        process.exit(1);
      };
      infos.forEach(function(info, idx) {
        var headline = '';
        var options = ext.extend(globalOptions, info.options);

        for (var i in options) {
          if (i == 'headers') {
            for (var j in options[i]) {
              headline += '--header ' + j + ':' + options[i][j] + '';
            }
          }
        }
        // node index.js url |xargs -d '\n'  |xargs wget -O
        /* For usage  like  wget `node index.js url`*/
        info.urls.forEach(function(item, idx) {
          process.stdout.write(info.title + '.' + idx + ' ' + item + ' ' + headline + '\n'); //last space whatever
        });
      });


    });
  } else {
    process.exit(0);
  }
}