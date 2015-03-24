var util = require('util');
var info = require('./../package');

module.exports = usage_yargs;
//module.exports = usage_commander;
function usage_yargs(argv){
  var argv = argv.slice(2);
  var usage = require('yargs')(argv)
  .usage('Usage: nezumi [Options] URL[ URL [...]] ')
  .version(function() {
    return util.format('%s %s', info.name, info.version)
  })
  .help('help', 'Show help and exit')
  .options({
    V: {
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
  var urls = usage.argv._;
  var options = usage.argv;
  delete options._;
  if (urls.length === 0 || options.help) {
    usage.showHelp();
  }
  return {urls:urls,options:options};

}


function usage_commander(argv){
  var program = require('commander');
  program
  .usage('[Options] URL[ URL [...]] ')
  .version(util.format('%s %s', info.name, info.version))
  .option('-i, --info','Display the information without downloading')           
  .option('-u, --url','Display the real URLs without downloading')              
  .option('-n, --no-merge','dont merge video parts')            
  .option('-d, --daemon','daemon mode (Proposed:works as a server for web use)')   
  .option('-t, --format <format-id>','Video format code') 
  .option('-o, --output <outputdir>','set the output videos directory')
  .option('-x, --http-proxy <HOST:PORT>','http proxy for downloading')
  .option('-y, --extractor-proxy <HOST:PORT>','http proxy for extracting stream data')
  .parse(argv);
  var urls = program.args;
  var options = program;
  console.log(program.daemon)
  delete options.args;

  if(urls.length === 0 ){
    program.help();
  }
  return {urls:urls, options:options};

}
