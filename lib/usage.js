module.exports = require('yargs')
  .usage('Usage: $0 [Options] URL[ URL [...]] ')
  .version(require('./../package').name + ' ' + require('./../package').version, 'version', 'Show version and exit')
  .help('help', 'Show help and exit')
  .options({
    v: {
      alias: 'version',
      requiresArg: false,
    },
    h: {
      alias: 'help',
      requiresArg: false
    },
    f: {
      alias: 'force',
      type: 'boolean',
      requiresArg: false,
      description: 'Force overwriting existed files.'
    },
    i: {
      alias: 'info',
      type: 'boolean',
      requiresArg: false,
      description: 'Display the information without downloading.'
    },
    u: {
      alias: 'url',
      type: 'boolean',
      requiresArg: false,
      description: 'Display the real URLs without downloading.'
    },
    /* merge acts a little different from you-get*/
    n: {
      alias: 'no-merge',
      type: 'boolean',
      requiresArg: false,
      /*default: true,*/
      description: 'dont merge video parts'
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
      description: '<HOST:PORT>| http proxy for downloading.'
    },
    y: {
      alias: 'extractor-proxy',
      type: 'string',
      requiresArg: true,
      description: '<HOST:PORT>| http proxy for extracting stream data.'
    },
    d: {
      alias: 'daemon',
      type: 'boolean',
      requiresArg: false,
      description: 'daemon mode (Proposed:works as a server for web use)'
    }

  });

/*  .epilogue('Show usage of epilogue')
  .epilogue('Custom Usage is defined in their own extractors.Append with usage.epilogue(string)');*/