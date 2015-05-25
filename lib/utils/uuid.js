exports.uuid4 = function() {
  var t = ''
  for (var i = 0; i < 16; i++) {
    t += (Math.random() * 256 >> 0 + 0x100).toString(16).substr(1);
  }
  return t;
}