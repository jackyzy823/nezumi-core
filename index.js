#!/usr/bin/env node

'use strict'
var info = require('./package');
process.title = info.name;
var util = require('util');
var path = require('path');
var events = require('events');


process.on('SIGINT', function() {
  console.log(util.format('\rOoops! %s terminated.', info.name));
  process.exit(1);
});

<<<<<<< HEAD
var usage = require('./lib/usage.js');
var srcUrls = usage.argv._;
/* options do not need _(srcUrls)*/
var options = usage.argv;
delete options._;

// var options = argv;
// delete options._;
var matchExtractor = require('./lib/matcher.js').match;
var extractorFolder = path.join(__dirname, 'lib', 'extractors');

if (srcUrls.length === 0 || options.help) {
  usage.showHelp();
}
=======
var usage = require('./lib/usage.js')(process.argv);
var urls = usage.urls;
var options = usage.options;
/*var urls = usage.argv._;*/
/* options do not need _(urls)*/
/*var options = usage.argv;*/
/*delete options._;*/

>>>>>>> 01c236f63668bef4894a9d16ace5e3e3983e88ae

var multi = require('multimeter')(process);

if (options.daemon) {
  /* Enter daemon */
  console.log('current not support');
  process.exit(1);
<<<<<<< HEAD
}
srcUrls.forEach(function(srcUrl, index) {
  var srcUrl = srcUrl.toString().toLowerCase();
  /* not a strict regexp*/
  if (!srcUrl.match(/^https?:\/\/.+$/)) {
    srcUrl = 'http://' + srcUrl;
  }
  matchExtractor(srcUrl, function download(resModule) {
    if (!resModule) {
      console.log(util.format('unsupported url :%s', srcUrl));
      return;
=======
} else {
  var matchExtractor = require('./lib/matcher.js').match;
  var extractorFolder = path.join(__dirname, 'lib', 'extractors'); 
  
  urls.forEach(function(url, index) {
    var url = url.toString().toLowerCase();
    /* not a strict regexp*/
    if (!url.match(/^https?:\/\/.+$/)) {
      url = 'http://' + url;
>>>>>>> 01c236f63668bef4894a9d16ace5e3e3983e88ae
    }
    var p = require(path.join(extractorFolder, resModule))(srcUrl, options, function realDownload(err, infos) {
      if (err) {
        console.log(err);
        return;
      }
      // infos  should be array even array.length==1-> 
      //{ ,items:[{url:[string,string,...],title,size,},{url:[string],title,size},{url:function_to_gen_url,title,size},{url:[function_to_gen,function],title,size}]}
      info.items.forEach(function(item, index) {
        if (Array.isArray(item)) {
          if (url)

        }
        if (typeof item === 'function') {
          for (var len = item.length(), i = 0; i < len; i++) {
            var url = item.next();
            download_url(url, )
          }
        } else if (Array.isArray(item)) {
          item.forEach(function(url, idx) {
            if (typeof url === 'function') {
              url = url();
            }

          });
        }
      });

    });
    p.on('display', function(msg) {
      // do sth with msg
    })
  });
<<<<<<< HEAD

});
=======
}
>>>>>>> 01c236f63668bef4894a9d16ace5e3e3983e88ae
