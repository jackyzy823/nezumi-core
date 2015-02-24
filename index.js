#!/usr/bin/env node

/*var charm = require('charm')(process.stdout);*/
/*charm.foreground('red').write('hello');*/
var info = require('./package');
var util = require('util')

process.title = info.name;

process.on('SIGINT', function() {
  console.log(util.format('\rOoops! %s terminated.', info.name));
  process.exit(1);
});

var usage = require('./lib/usage.js');
var argv = usage.argv;
var match = require('./lib/matcher.js').match;

var _extractorFolder = __dirname + '/lib/extractors/';

if (argv._.length === 0 || argv.help) {
  usage.showHelp();
}

if (argv.daemon) {
  /* Enter daemon */
  console.log('current not support');
  process.exit(1);
}

/*setInterval(function() {}, 1000);*/
argv._.forEach(function(url, index) {
  var url = url.toString();
  /* not a strict regexp*/
  if (!url.match(/^https?:\/\/.+$/)) {
    url = 'http://' + url;
  }
  var resModule = match(url);
  if (resModule) {
    require(_extractorFolder + resModule).download(url, options);
  } else {
    console.log(util.format('unsupported url :%s', url));
  }

});