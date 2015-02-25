#!/usr/bin/env node

'use strict'
var info = require('./package');
process.title = info.name;
var util = require('util');
var path = require('path');

process.on('SIGINT', function() {
  console.log(util.format('\rOoops! %s terminated.', info.name));
  process.exit(1);
});

var usage = require('./lib/usage.js')(process.argv);
var urls = usage.urls;
var options = usage.options;
/*var urls = usage.argv._;*/
/* options do not need _(urls)*/
/*var options = usage.argv;*/
/*delete options._;*/


if (options.daemon) {
  /* Enter daemon */
  console.log('current not support');
  process.exit(1);
} else {
  var matchExtractor = require('./lib/matcher.js').match;
  var extractorFolder = path.join(__dirname, 'lib', 'extractors'); 
  
  urls.forEach(function(url, index) {
    var url = url.toString().toLowerCase();
    /* not a strict regexp*/
    if (!url.match(/^https?:\/\/.+$/)) {
      url = 'http://' + url;
    }
    matchExtractor(url, function download(resModule) {
      if (!resModule) {
        console.log(util.format('unsupported url :%s', url));
        return;
      }
      require(path.join(extractorFolder, resModule)).download(url, options, function(err, result) {

      });
    });

  });
}
