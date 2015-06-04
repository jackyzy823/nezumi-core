var util = require('util');

var async = require('async');
var request = require('request');

var ror = require('../../utils/bitwise').ror;

/*
 *TODO 1.choose quality
 */

// exports.matcher = /https?:\/\/www\.letv.com\/.*/
var apiUrl = 'http://api.letv.com/mms/out/video/playJson?id=%s&platid=1&splatid=101&format=1&tkey=%s&domain=www.letv.com';



function LetvParser() {}

LetvParser.prototype.qualitySort = function(a, b) {
  if (a == '1080p') {
    return -1;
  }
  if (b == '1080p') {
    return 1;
  }
  if (a == '720p') {
    if (b == '1080p') {
      return 1;
    }
    return -1;
  }
  if (b == '720p') {
    if (a == '1080p') {
      return -1;
    }
    return 1;
  }
  return parseInt(a) < parseInt(b);
}


LetvParser.prototype.calcTimeKey = function(time) {
  var time = time ? time : Date.now() / 1000 >> 0;
  return ror(ror(time, 773625421 % 13) ^ 773625421, 773625421 % 17);

};

LetvParser.prototype.getVid = function(url, callback) {
  request(url, function(err, resp, body) {
    if (err || resp.statusCode != 200) {
      callback(new Error('letv getvid error'));
      return;
    }
    var res = url.match(/http:\/\/www.letv.com\/ptv\/vplay\/(\d+).html/);
    res || (res = body.match(/vid="(\d+)"/));
    if (res) {
      var vid = res[1];
    } else {
      callback(new Error('letv getvid error'), null);
      return;
    }
    // var res = body.match(/name="irTitle" content="(.*?)"/);
    // var title = res ? res[1] : 'UNKNOWN';
    callback(null, vid);
  });
}

LetvParser.prototype.getVideoInfo = function(vid, callback) {
  var self = this;
  var url = util.format(apiUrl, vid, this.calcTimeKey());
  request.get({
      url: url,
      json: true
    }, function(err, resp, body) {
      if (err || resp.statusCode != 200) {
        callback && callback(new Error('get video info error'));
        return;
      }
      var title = body.playurl.title;
      var supportQuality = Object.keys(body.playurl.dispatch).sort(self.qualitySort);
      var choice = supportQuality[0];
      var infoUrl = body.playurl.domain[0] + body.playurl.dispatch[choice][0] + '&ctv=pc&m3v=1&termid=1&format=1&hwtype=un&ostype=Linux&tag=letv&sign=letv&expect=3&tn=' + Math.random() + '&pay=0&iscpn=f9051&rateid=' + choice;

      request.get({
        url: infoUrl,
        json: true
      }, function(err, resp, body) {
        if (err || resp.statusCode != 200) {
          callback && callback(new Error('get m3u8 location error'));
          return;
        }
        request.get({
          url: body.location,
          encoding: null
        }, function(err, resp, body) {
          if (err || resp.statusCode != 200) {
            callback && callback(new Error('get m3u8 info error'));
            return;
          }
          var m3u8 = self.decodeM3U8(body);
          var result = self.parseM3U8(m3u8);
          callback && callback(null, [{
            title: title,
            size: result.size,
            urls: result.url
          }]);
        });
      });
    })
    // .format(vid,calcTimeKey(int(time.time())))
}
LetvParser.prototype.parseM3U8 = function(data) {
  /*
  size:#EXT-LETV-TOTAL-TS-LENGTH+#EXT-LETV-TOTAL-ES-LENGTH
  */
  var size = parseInt(data.match(/#EXT-LETV-TOTAL-TS-LENGTH:(\d+)/)[1]) + parseInt(data.match(/#EXT-LETV-TOTAL-ES-LENGTH:(\d+)/)[1]);
  var urls = data.split('\r\n').filter(function(i) {
    return i != '' && i[0] != '#';
  });
  return {
    size: size,
    url: urls
  };
}

/* Buffer is faster*/
LetvParser.prototype.decodeM3U8 = function(data) {
  var version = data.slice(0, 5);
  if (version.toString().toLowerCase() == 'vc_01') {
    var loc2 = data.slice(5);
    var length = loc2.length;
    var loc4 = new Buffer(2 * length);
    for (var i = 0; i < length; i++) {
      loc4[2 * i] = loc2[i] >> 4;
      loc4[2 * i + 1] = loc2[i] & 15;
    }

    var loc6 = Buffer.concat([loc4.slice(2 * length - 11), loc4.slice(0, 2 * length - 11)]);

    var loc7 = new Buffer(length);
    for (var i = 0; i < length; i++) {
      loc7[i] = (loc6[2 * i] << 4) + loc6[2 * i + 1];
    }
    return loc7.toString();
  }
  return data;
};

LetvParser.prototype.parse = function(url, options, callback) {
  var self = this;

  async.waterfall([
    function(callback) {
      self.getVid(url, callback);
    },
    function(vid, callback) {
      self.getVideoInfo(vid, callback)
    }
  ], function(err, result) {
    callback && callback(err, result);
  });
};


module.exports = new LetvParser();
// module.exports = letvDownload;

if (require.main == module) {

}