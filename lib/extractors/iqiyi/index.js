var crypto = require('crypto');
var util = require('util');
var zlib = require('zlib');

var async = require('async');
var request = require('request');

var uuid4 = require('../../utils/uuid').uuid4;

/*
 * TODO: 1. add quality choice
 *       2. use url generator
 */

// exports.matcher = /https?:\/\/.*?\.iqiyi.com\/.*/;
var ENCRYPT_KEY = 'Qakh4T0A';


var VMSURL = 'http://cache.video.qiyi.com/vms?key=fvip&src=1702633101b340d8917a69cf8a4b8c7c&um=0&vinfo=1\
&tvId=%s\
&vid=%s\
&tm=%s\
&enc=%s\
&qyid=%s\
&tn=%s\
&authkey=%s';

function IQiyiParser(options) {
  this.options = options;
}


IQiyiParser.prototype.getVRSXORCode = function(arg1, arg2) {
  var loc3 = arg2 % 3;
  if (loc3 == 1) {
    return arg1 ^ 121;
  } else if (loc3 == 2) {
    return arg1 ^ 72;
  }
  return arg1 ^ 103;
};

IQiyiParser.prototype.getVrsEncodeCode = function(vlink) {
  var loc6 = 0;
  var loc2 = '';
  var loc3 = vlink.split('-');
  var loc4 = loc3.length;
  for (var i = 0; i < loc4; i++) {
    loc2 = String.fromCharCode(this.getVRSXORCode(parseInt(loc3[i], 16), loc4 - 1 - i)) + loc2;
  }
  return loc2;
  // return loc2.split('').reverse().join('');
};

IQiyiParser.prototype.getVMS = function(tvid, vid, qyid, callback) {
  var self = this;

  var tm = (Math.random() * 1000 >> 0 + 2000).toString();

  var enckey = '65096542539c4e529c8ee97511cd979f';
  
  var encMD5 = crypto.createHash('md5');
  encMD5.update(enckey + tm + tvid);
  var enc = encMD5.digest('hex');

  var authMD5 = crypto.createHash('md5');
  authMD5.update('' + tm + tvid);
  var authkey = authMD5.digest('hex');

  var vmsreq = util.format(VMSURL, tvid, vid, tm, enc, qyid, Math.random(), authkey);

  request.get({
    url: vmsreq,
    json: true,
    proxy: this.options.proxy
  }, function(err, resp, body) {
    if (err || resp.statusCode != 200) {
      callback && callback(err || new Error('iqiyi get vms error'));
      return;
    }
    callback && callback(null, body);
  });
};

IQiyiParser.prototype.getDispatchKey = function(rid) {
  var tp = ')(*&^flash@#$%a';
  /* time should get from server */
  /* time=json.loads(get("http://data.video.qiyi.com/t?tn="+random()))["t"]*/
  var t = (Date.now() / 1000 / 600 >> 0).toString();
  var h = crypto.createHash('md5');
  h.update(t + tp + rid)
  return h.digest('hex');
};

// IQiyiParser.prototype.getEncKey = function(swflink, callback) {
//   request.get({
//     url: swflink,
//     encoding: null,
//     proxy: this.options.proxy

//   }, function(err, resp, body) {
//     if (err || resp.statusCode != 200) {
//       callback && callback(err || new Error('get swf file error'));
//       return;
//     }
//     zlib.unzip(body.slice(8), function(err, result) {
//       if (err) {
//         callback && callback(err);
//         return;
//       }
//       var res = result.toString('utf-8').match(/MixerRemote\x08(.+?)\$&vv/);
//       if (!res) {
//         callback && callback(new Error('enc key not found'));
//       } else {
//         callback && callback(null, res[1]);
//       }
//     });
//   });
// };
IQiyiParser.prototype.parse = function(url, callback) {
  var self = this;
  var qyid = uuid4();
  request.get({
    url: url,
    proxy: this.options.proxy
  }, function(err, resp, body) {
    if (err || resp.statusCode != 200) {
      callback && callback(err || new Error('get page error'));
      return;
    }
    var res1 = body.match(/data-player-tvid="([^"]+)"/);
    var tvid = res1 ? res1[1] : null;

    var res2 = body.match(/data-player-videoid="([^"]+)"/);
    var videoid = res2 ? res2[1] : null;

    var res4 = body.match(/data-player-ismember="(\w+)"/);
    var ismember = res4 ? res4[1] : null;
    if (ismember == 'true') {
      callback && callback(new Error('do not support iqiyi vip video'));
      return;
    }

    if (!tvid || !videoid) {
      callback && callback(new Error('can not parse the video page'));
      return;
    }
    async.waterfall([
      function vms(callback) {
        self.getVMS(tvid, videoid, qyid, callback);
      },
      function getInfo(info, callback) {
        if (info.code != 'A000000') {
          callback && callback(new Error('wrong status code in json'));
          return;
        }
        if (!info.data) {
          callback && callback(new Error('iqiyi ip region restricted!please use proxy'));
          return;
        }
        var title = info.data.vi.vn;
        var bid = 0;
        var video_links = null;

        info.data.vp.tkl[0].vs.forEach(function(item) {
          var pbid = parseInt(item.bid);
          if (pbid <= 10 && pbid > bid) {
            bid = pbid;
            video_links = item.fs;
            if (item.fs[0].l[0] != '/') {
              var tmp = self.getVrsEncodeCode(item.fs[0].l);
              if (tmp.slice(-3) == 'mp4') {
                video_links = item.flvs;
              }
            }
          }
        });

        var size = video_links.reduce(function(pre, cur) {
          return pre + cur.b;
        }, 0);
        async.map(video_links, function(item, callback) {
          var vlink = item.l;
          if (vlink[0] != '/') {
            vlink = self.getVrsEncodeCode(vlink);
          }
          key = self.getDispatchKey(vlink.split('/').slice(-1)[0].split('.')[0]);
          var baseurl = info.data.vp.du.split('/');
          baseurl.splice(-1, 0, key);

          var url = baseurl.join('/') + vlink + '?qyid=' + uuid4() + '&ran=' + (Math.random() * 20000 + 30000 >> 0).toString();
          request.get({
            url: url,
            json: true,
            proxy: self.options.proxy

          }, function(err, resp, body) {
            if (err || resp.statusCode != 200) {
              callback && callback(err || new Error('get real video link error'));
              return;
            }
            callback && callback(null, body.l);
          });
        }, function(err, results) {
          if (err) {
            callback && callback(err);
            return;
          }
          callback && callback(null, [{
            size: size,
            urls: results,
            title: title
          }]);
        });
      }
    ], function(err, results) {
      callback && callback(err, results);
    });
  });
};



// exports.parse = parse;

module.exports = IQiyiParser;

// module.exports = new IQiyiParser();

/*Self test*/
if (module == require.main) {

}
