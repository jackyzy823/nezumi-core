exports.matcher = /https?:\/\/v\.pptv.com\/.*/

module.exports = function(url, options, callback) {
  console.log('in pptv ');
  var infos = {
    items: [{
      url: function() {
        var cur = 1;
        return {
          next: function() {
            cur++;
            return cur.toString();
          },
          length: function() {
            return 10;
          }
        }
      }(),
      title: 'test',
      size: 12345,
      fmt: 'flv'
    }],
    settings: null
  };
  // 
  callback && callback(null, infos);
}