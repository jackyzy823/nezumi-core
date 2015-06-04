var util = require('util');

var request = require('request');
var async = require('async');

var et = require('elementtree');

// exports.matcher = /https?:\/\/v\.pptv.com\/.*/



function PPTVParser() {}


PPTVParser.prototype.parseId = function(id, option, callback) {
  var self = this;
  
  request(util.format('http://web-play.pptv.com/webplay3-0-%s.xml?zone=8&pid=5701&username=&salt=pv&o=0&referer=&param=type%3Dweb.fpp%26userType%3D0%26o%3D0&version=4&type=web.fpp&r=%d&pageUrl=%s', id, Date.now() / 1000000 >> 0, this.referer_url), function(err, resp, body) {
    // var host = body.match(/<sh>([^<>]+)<\/sh>/);
    if (err || resp.statusCode != 200) {
      callback && callback(new Error('get pptv info failed'));
      return;
    }
    
    var xml = et.parse(body);
    var stream_id = '2';
    var bitrate = xml.find(util.format("./channel/file/item[@ft='%s']", stream_id)).get('bitrate');

    var filesize = parseInt(xml.find(util.format("./channel/file/item[@ft='%s']", stream_id)).get('filesize'));
    var item = xml.find(util.format("./channel/file/item[@ft='%s']", stream_id));

    var dt = xml.find(util.format("./dt[@ft='%s']", stream_id));

    var dragdata = xml.find(util.format("./dragdata[@ft='%s']", stream_id));

    var host = dt.find('sh').text;

    var k = dt.find('key').text;

    var rid = item.get('rid');

    var title = xml.find("./channel").get('nm');

    if (!title || !rid || !k || !host || !dragdata || !dt || !item || !filesize || !bitrate) {
      callback && callback(new Error('parse pptv failed'));
      return;
    }

    var t = dragdata.findall('sgm').reduce(function(pre, cur) {
      pre[0].push(cur.get('no'));
      pre[1] += parseInt(cur.get('fs'));
      return pre;
    }, [
      [], 0
    ]);
    
    var numebrs = t[0];
    
    var total_size = t[1];

    var urls = numebrs.map(function(item) {
      return util.format('http://%s/%s/%s?fpp.ver=1.3.0.19&k=%s&type=web.fpp', host, item, rid, k);
    });
    
    callback && callback(null, {
      title: title,
      urls: urls,
      size: total_size,
      options:{
        headers:{
          'Referer':self.referer_url
        }
      }
    });
  });
};



PPTVParser.prototype.parse = function(url, option, callback) {
  var self = this;
  this.referer_url = url;

  request(url, function(err, resp, body) {
    if (err || resp.statusCode != 200) {
      callback && callback(new Error('get pptv page failed'));
      return;
    }
    var res = body.match(/webcfg\s*=\s*({.+?})/);
    try {
      //in node_request get mobile page then get channel_id, in python_requests get pc page;
      var t = JSON.parse(res[1]);
      var cid = t.channel_id || t.id;
    } catch (ex) {}

    if (!cid) {
      callback && callback(new Error('pptv video id not found'));
      return;
    }
    self.parseId(cid, option, callback);
  });
};

module.exports = new PPTVParser();

//exports.parse = new PPTVParser().parse;