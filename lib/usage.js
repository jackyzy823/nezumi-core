var util = require('util');
var info = require('./../package');

module.exports = require('yargs')
  .usage('Usage: $0 [Options] URL[ URL [...]] ')
  .version(function() {
    return util.format('%s %s', info.name, info.version)
  })
  .help('help', 'Show help and exit')
  .options({
    v: {
      alias: 'version',
      requiresArg: false,
      description: 'Show version and exit'
    },
    h: {
      alias: 'help',
      requiresArg: false
    },
    f: {
      alias: 'force',
      type: 'boolean',
      requiresArg: false,
      description: 'Force overwriting existed files'
    },
    i: {
      alias: 'info',
      type: 'boolean',
      requiresArg: false,
      description: 'Display the information without downloading'
    },
    u: {
      alias: 'url',
      type: 'boolean',
      requiresArg: false,
      description: 'Display the real URLs without downloading'
    },
    n: {
      alias: 'no-merge',
      type: 'boolean',
      requiresArg: false,
      /*default: true,*/
      description: 'dont merge video parts'
    },
    d: {
      alias: 'daemon',
      type: 'boolean',
      requiresArg: false,
      description: 'daemon mode (Proposed:works as a server for web use)'
    },
    /* alias of format is different from you-get*/
    t: {
      alias: 'format',
      type: 'string',
      requiresArg: true,
      description: '<format-id>| Video format code'
    },
    o: {
      alias: 'output',
      type: 'string',
      requiresArg: true,
      description: '<outputdir>| set the output videos directory',
    },
    x: {
      alias: 'http-proxy',
      type: 'string',
      requiresArg: true,
      description: '<HOST:PORT>| http proxy for downloading'
    },
    y: {
      alias: 'extractor-proxy',
      type: 'string',
      requiresArg: true,
      description: '<HOST:PORT>| http proxy for extracting stream data'
    },
    c: {
      alias: 'config',
      type: 'string',
      requiresArg: true,
      description: '<conf.json>| load config from json file'
    },
  })
  .config('config');