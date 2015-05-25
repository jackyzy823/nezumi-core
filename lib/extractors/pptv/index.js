// exports.matcher = /https?:\/\/v\.pptv.com\/.*/

function PPTVParser() {

}

PPTVParser.prototype.parse = function(url, option, callback) {
  // body...
  console.log(url);
  callback && callback(null, url, null);
};

module.exports = new PPTVParser();
// exports.parse = new PPTVParser().parse;