function ror(src, bits) {
  var res = src >>> bits | src << (32 - bits);
  res = res < 0 ? res + 4294967296 : res; // 2^32
  return res;
}

exports.ror = ror;

// if (require.main == module) {
// }