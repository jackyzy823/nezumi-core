var crypto = require('crypto');
var util = require('util');
var zlib = require('zlib');

var async = require('async');
var request = require('request');

var uuid4 = require('../../utils/uuid').uuid4;
// exports.matcher = /https?:\/\/.*?\.iqiyi.com\/.*/;



var ENCRYPT_KEY = 'Qakh4T0A';
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

function getVMS(tvid, vid, enckey, qyid, callback) {
  var tm = (Math.floor(Math.random() * 500) + 500).toString();

  var encMD5 = crypto.createHash('md5');
  encMD5.update(enckey + tm + tvid);
  var enc = encMD5.digest('hex');

  var authMD5 = crypto.createHash('md5');
  authMD5.update('' + tm + tvid);
  var authkey = authMD5.digest('hex');

  var vmsreq = util.format(VMSURL, tvid, vid, tm, enc, qyid, Math.random(), authkey);

  request.get({
    url: vmsreq,
    json: true
  }, function(err, resp, body) {
    callback && callback(err, body);
  });
}


function getDispatchKey(rid) {
  var tp = ')(*&^flash@#$%a';
  /* time should get from server */
  /* time=json.loads(get("http://data.video.qiyi.com/t?tn="+random()))["t"]*/
  var t = Math.floor(Date.now() / 1000 / 600).toString();
  var h = crypto.createHash('md5');
  h.update(t + tp + rid)
  return h.digest('hex');
}

function getEncKey(swflink, callback) {
  request.get({
    url: swflink,
    encoding: null
  }, function(err, resp, body) {
    zlib.unzip(body.slice(8), function(err, result) {
      if (err) {
        callback && callback(err);
        return;
      }
      var res = result.toString('utf-8').match(/MixerRemote\x08(.+?)\$&vv/);
      if (!res) {
        callback && callback(new Error('enc key not found'));
      } else {
        callback && callback(null, res[1]);
      }
    });
  });
}


function parse(url, options, callback) {
  console.log(Date.now(), 'start parse');
  var qyid = uuid4();
  request.get(url, function(err, resp, body) {
    if (err) {
      cb && cb(err);
      return;
    }
    console.log(Date.now(), 'get page done');
    var res1 = body.match(/data-player-tvid="([^"]+)"/);
    var tvid = res1 ? res1[1] : null;

    var res2 = body.match(/data-player-videoid="([^"]+)"/);
    var videoid = res2 ? res2[1] : null;

    var res3 = body.match(/(http:\/\/.+?MainPlayer.+?swf)/);
    var swflink = res3 ? res3[1] : null;

    if (!tvid || !videoid || !swflink) {
      cb && cb(new Error('can not parse the video page'));
      return;
    }

    getVMS(tvid, videoid, ENCRYPT_KEY, qyid, function(err, info) {
      console.log(Date.now(), 'get vms done');

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
      var video_links = null;

      info.data.vp.tkl[0].vs.forEach(function(item) {
        var pbid = parseInt(item.bid);
        if (pbid <= 10 && pbid > bid) {
          bid = pbid;
          video_links = item.fs;
          if (item.fs[0].l[0] != '/') {
            var tmp = getVrsEncodeCode(item.fs[0].l);
            if (tmp.slice(-3) == 'mp4') {
              video_links = item.flvs;
            }
          }
        }
      });

      var size = video_links.reduce(function(pre, cur) {
        return pre + cur.b;
      }, 0);
      console.log(Date.now(), 'start get real');

      var i = 1;
      async.mapSeries(video_links, function(item, callback) {
        var vlink = item.l;
        if (vlink[0] != '/') {
          vlink = getVrsEncodeCode(vlink);
        }
        key = getDispatchKey(vlink.split('/').slice(-1)[0].split('.')[0]);
        var baseurl = info.data.vp.du.split('/');
        baseurl.splice(-1, 0, key);
        var url = baseurl.join('/') + vlink + '?qyid=' + uuid4() + '&qypid=365857900_11&ran=' + Math.floor(Math.random() * 20000 + 60000 * i).toString();
        i++;
        console.log(Date.now(), 'now real req', url);
        request.get({
          url: url,
          json: true
        }, function(err, resp, body) {
          console.log(Date.now(), 'get real info');
          if (err) {
            callback && callback(err);
            return;
          }
          console.log('req body', body);
          callback && callback(null, body.l);
        });
      }, function(err, results) {
        if (err) {
          console.log('sth wrong!');
          callback && callback(err);
          return;
        }
        console.log(Date.now(), 'all done');
        callback && callback(null, {
          size: size,
          urls: results,
          title: title
        });
      });
    });


  });
}

exports.parse = parse;

/*Self test*/
if (module == require.main) {
  // getEncKey('http://www.iqiyi.com/common/flashplayer/20150521/MainPlayer_5_2_23_c3_2_6_2.swf', function(err, result) {
  //   console.log(err, result);
  // });
  parse('http://iqiyi.com/v_19rrnscu0w.html', null, function(err, result) {
    // console.log(err, result);
    if (err) {
      console.trace(err);
    } else {
      console.log(result);
    }
  })
}