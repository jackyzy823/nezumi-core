function uuid4() {
  var b = new Buffer(16);
  for (var i = 0; i < 16; i++) {
    b[i] = Math.random() * 256;
  }
  return b.toString('hex');
}

exports.uuid4 = uuid4;

if (require.main == module) {
  console.assert(uuid4().length == 32);
}