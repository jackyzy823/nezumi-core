exports.ror = function ror(param1, param2) {
  var res = param1 >>> param2 | param1 << (32 - param2);
  res = res < 0 ? res + Math.pow(2, 32) : res;
  return res;
}