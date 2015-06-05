var util = require('util');
var urlparse = require('url').parse;

var async = require('async')
var request = require('request');

var SOHU_QUALITIES = ["oriVid", "superVid", "highVid", "norVid", "relativeId"];

function SohuParser(options) {
  this.options = options;
}

SohuParser.prototype.parse = function(url, callback) {
  var self = this;
  async.waterfall([function getPage(cb) {
    request.get({
      url: url,
      proxy: self.options.proxy
    }, function(err, resp, body) {
      if (err || resp.statusCode != 200) {
        cb && cb(new Error('get sohu page failed'));
        return;
      }
      var res = body.match(/\Wvid\s*[\:=]\s*[\'"]?(\d+)[\'"]?/);
      if (!res) {
        cb && cb(new Error('sohu vid not found'));
        return;
      }
      var vid = res[1];
      var from = body.match(/from\s*[\:=]\s*[\'"]?(\d+)[\'"]?/);
      var isMyTV = false;
      if (from && parseInt(from[1]) === 0) {
        isMyTV = true;
      }
      cb && cb(null, vid, isMyTV);
    });
  }, function getInfo(vid, isMyTV, cb) {
    if (isMyTV) {
      request.get({
        url: util.format('http://my.tv.sohu.com/play/videonew.do?vid=%s&referer=http://my.tv.sohu.com', vid),
        proxy: self.options.proxy,
        json: true
      }, function(err, resp, info) {
        if (err || resp.statusCode != 200) {
          cb && cb(new Error('get sohu tv info failed'));
          return;
        }
        var data = info.data;
        data.clipsBytes = data.clipsBytes.map(function(i) {
          return parseInt(i);
        });
        cb && cb(null, vid, {
          host: info.allot,
          data: data
        });
      });
    } else {
      request.get({
        url: util.format('http://hot.vrs.sohu.com/vrs_flash.action?vid=%s', vid),
        proxy: self.options.proxy,
        json: true
      }, function(err, resp, info) {
        if (err || resp.statusCode != 200) {
          cb && cb(new Error('get sohu my tv info failed'));
          return;
        }

        var hqvid = null;
        var ret = SOHU_QUALITIES.some(function(item) {
          hqvid = info.data[item];
          return hqvid && hqvid != vid;
        });
        if (ret) {
          request.get({
            url: util.format('http://hot.vrs.sohu.com/vrs_flash.action?vid=%s', hqvid),
            proxy: self.options.proxy,
            json: true
          }, function(err, resp, info) {
            if (err || resp.statusCode != 200) {
              cb && cb(new Error('get sohu hq tv info failed'));
              return;
            }
            var data = info.data;
            data.clipsBytes = data.clipsBytes.map(function(i) {
              return parseInt(i);
            });
            cb && cb(null, hqvid, {
              host: info.allot,
              data: data
            });
          });
        } else {
          var data = info.data;
          data.clipsBytes = data.clipsBytes.map(function(i) {
            return parseInt(i);
          });
          cb && cb(null, hqvid, {
            host: info.allot,
            data: data
          });
        }
      });
    }
  }, function genUrl(vid, infos, cb) {

    // zip su clipsurl ,ck
    var zipdata = infos.data.su.map(function(item, index) {
      return [item, urlparse(infos.data.clipsURL[index]).path, infos.data.ck[index]];
    });
    async.map(zipdata, function(item, cb) {
      var su = item[0];
      var clipsurl = item[1];
      var ck = item[2];
      request.get({
        url: util.format('http://%s/?prot=9&prod=flash&pt=1&file=%s&new=%s&key=%s&vid=%s&uid=%d&t=%d',
          infos.host, clipsurl, su, ck, vid, Date.now(), Math.random()
        ),
        proxy: self.options.proxy,
        json: true
      }, function(err, resp, result) {
        if (err || resp.statusCode != 200) {
          cb && cb(new Error('get sohu url failed'));
          return;
        }
        cb && cb(null, result.url);
      });
    }, function(err, urls) {
      if (err) {
        cb && cb(err);
        return;
      }
      cb && cb(null, {
        title: infos.data.tvName,
        size: infos.data.clipsBytes.reduce(function(pre, cur) {
          return pre + cur;
        }, 0),
        urls: urls
      });
    })
  }], function(err, result) {
    callback && callback(null, [result]);
  });
};


module.exports = SohuParser;