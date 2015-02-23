#!/usr/bin/env node
var usage = require('./lib/usage.js');
var argv = usage.argv;

if (argv._.length === 0 || argv.help) {
  usage.showHelp();
}
