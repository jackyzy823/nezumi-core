exports.matcher = /https?:\/\/www\.letv.com\/.*/
var async = require('async');
var request = require('request');
var util = require('util');
var events = require("events");

function calcTimeKey(time) {
  var ror = function(param1, param2) {
    var res = param1 >>> param2 | param1 << (32 - param2);
    res = res < 0 ? res + Math.pow(2, 32) : res;
    return res;
  }
  var time = time ? time : Date.now() / 1000 >> 0;
  return ror(ror(time, 773625421 % 13) ^ 773625421, 773625421 % 17);
}

function decodeM3U8(data) {

}


function letvDownload(url, options, callback) {
  var self = this;
  events.EventEmitter.call(this);
  async.waterfall([
    function getVid(waterfallCallback) {
      request(url, function(err, resp, body) {
        if (err) {
          waterfallCallback(err, null);
          return;
        }
        var vid = null;
        var res = /http:\/\/www.letv.com\/ptv\/vplay\/(\d+).html/.exec(url);
        res || (res = /vid="(\d+)"/.exec(body));
        if (res) {
          vid = res[1];
        } else {
          waterfallCallback('GET_VID_FAIL', null);
          return;
        }
        var res = /name="irTitle" content="(.*?)"/.exec(body)
        var title = res ? res[1] : 'UNKNOWN';
        // debugger;
        waterfallCallback(null, vid, title);
      })
    },
    function getVideoInfo(vid, title, waterfallCallback) {

      var apiUrl = util.format('http://api.letv.com/mms/out/video/playJson?id=%s&platid=1&splatid=101&format=1&tkey=%s&domain=www.letv.com', vid, calcTimeKey());
      console.log(apiUrl);
      request(apiUrl, function(err, resp, body) {
        if (err) {
          waterfallCallback(err, null);
          return;
        }
        var info;
        try {
          info = JSON.parse(body);
        } catch (err) {
          console.log(body);
          waterfallCallback('JSON_DECODE_FAIL', null);
          return;
        }
        console.log(info);
        // title = title ? info.playurl.title : title;
        var streamID = null;
        if (options.format && options.format in info.playurl.dispatch) {
          streamID = options.format;
        } else {
          if ('1080p' in info.playurl.dispatch) {
            streamID = '1080p';
          } else if ('720p' in info.playurl.dispatch) {
            streamID = '720p';
          } else {
            var k = Object.keys(info.playurl.dispatch).sort(function(a, b) {
              return parseInt(a) < parseInt(b);
            });
            streamID = k[0];
          }
        }
        console.log("streamID", streamID);

        var dispatchUrl = info.playurl.domain[0] + info.playurl.dispatch[streamId][0];
        var ext = info["playurl"]["dispatch"][stream_id][1].split('.').pop();
        self.emit('display', vid, title);
        waterfallCallback(null, null);


      })
    }
  ], function(err, result) {
    callback && callback(err, result);


  });

}

util.inherits(letvDownload, events.EventEmitter);

module.exports = letvDownload;

if (require.main == module) {
  var test = new letvDownload('http://www.letv.com/ptv/vplay/20036179.html', {}, function(err, infos) {

  });
  test.on('display', function() {
    console.log("this is the msg", arguments);
  })

}