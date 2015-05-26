var request = require('request');
var async = require('async');

// exports.matcher = /https?:\/\/v\.pptv.com\/.*/

function PPTVParser() {

}


PPTV.prototype.parseId = function(id, option, callback) {
  var self = this;
  request('http://web-play.pptv.com/webplay3-0-' + id + '.xml?type=web.fpp', function(err, resp, body) {
    var host = body.match(/<sh>([^<>]+)<\/sh>/);

  });
};



PPTVParser.prototype.parse = function(url, option, callback) {
  var self = this;
  request(url, function(err, resp, body) {
    var res = body.match(/webcfg\s*=\s*{"id":\s*(\d+)}/);
    if (!res) {
      callback && callback(new Error('pptv video id not found'));
      return;
    }
    self.parseId(res[1], option, callback);
  });
};

module.exports = new PPTVParser();

//exports.parse = new PPTVParser().parse;