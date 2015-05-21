var crypto = require('crypto');
var util = require('util');
var request = require('request');

exports.matcher = /https?:\/\/.*?\.iqiyi.com\/.*/;



var ENCRYPT_KEY = 'aw6UWGtp';
var VMSURL = 'http://cache.video.qiyi.com/vms?key=fvip&src=1702633101b340d8917a69cf8a4b8c7&um=0&vinfo=1\
&tvId=%s\
&vid=%s\
&tm=%s\
&enc=%s\
&qyid=%s\
&tn=%s\
&authkey=%s';

function getVRSXORCode(arg1, arg2) {
  var loc3 = arg2 % 3;
  if (loc3 == 1) {
    return arg1 ^ 121;
  } else if (loc3 == 2) {
    return arg1 ^ 72;
  }
  return arg1 ^ 103;
}

function getVrsEncodeCode(vlink) {
  var loc6 = 0;
  var loc2 = '';
  var loc3 = vlink.split('-');
  var loc4 = loc3.length;
  for (var i = 0; i < loc4; i++) {
    loc2 = String.fromCharCode(getVRSXORCode(parseInt(loc3[i], 16), loc4 - 1 - i)) + loc2;
  }
  return loc2;
  // return loc2.split('').reverse().join('');
}

function getVMS(tvid, vid, callback) {
  var qyid = '';
  for (var i = 0; i < 16; i++) {
    qyid += (Math.floor(Math.random() * 256) + 0x100).toString(16).substr(1);
  }
  var tm = (Math.floor(Math.random() * 500) + 500).toString();

  var encMD5 = crypto.createHash('md5');
  encMD5.update(ENCRYPT_KEY + tm + tvid);
  var enc = md5Creator.digest('hex');

  var authMD5 = crypto.createHash('md5');
  authMD5.update('' + tm + tvid);
  var authkey = authMD5.digest('hex');

  var vmsreq = util.format(VMSURL, tvid, vid, tm, enc, qyid, Math.random(), authkey);

  request.get(vmsreq, function(err, resp, body) {

    try {
      var info = JSON.parse(body);
    } catch (e) {
      callback && callback(e, null);
      return;
    }
    callbacpk && callback(err, info);

  });
}


exports.parse = function(url, options, callback) {
  // console.log('in iqiyi ');
  async.waterfall([
    function getInfo(cb) {
      request.get(url, function(err, resp, body) {
        if (err) {
          cb && cb(err);
          return;
        }
        var res1 = body.match(/data-player-tvid="([^"]+)"/);
        var tvid = res1 ? res1[1] : null;

        var res2 = body.match(/data-player-videoid="([^"]+)"/);
        var videoid = res2 ? res2[1] : null;

        if (!tvid || !videoid) {
          cb && cb(new Error('can not parse the video page'));
          return;
        }
        // cb && cb(null, tvid, vid);
        getVMS(tvid, vid, function(err, info) {
          if (err) {
            cb && cb(err);
            return;
          }
          if (info.code != 'A000000') {
            cb && cb(new Error('wrong status code in json'));
            return;
          }
          if (info.data.vp.tkl == '') {
            cb && cb(new Error('not support iqiyi VIP video'));
            return;
          }
          var title = info.data.vi.vn;
          var bid = 0;



        })
      });
    },
  ])

}