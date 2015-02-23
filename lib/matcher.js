/*
 * Description: import matcher from js in extractors/ to generate general    *              matcher 
 */
var fs = require('fs');

var filePath = __dirname+'/extractors/';
/*TODO: check no folder/symbolic link in result*/
var extractorsFolder = fs.readdirSync(filePath);
/* Priority regExp > string */
var regExpMatchers = {};
var stringMatchers = {};

extractorsFolder.forEach(function(item,index){
  var matcher = require(filePath+item).matcher;
  if(matcher instanceof RegExp){
    /* RegExp resolution */
    regExpMatchers[matcher.source] = item;
  }
  else if(typeof matcher == 'string'){
    /* Perhaps wildcard resolution */
    stringMatchers[matcher] = item; 
  }
  else if (!matcher){
    /* Hostname resolution  */
    stringMatchers[item.split('.')[0]] = item;
  }

})

exports.regExpMatchers = regExpMatchers;
exports.stringMatchers = stringMatchers;

