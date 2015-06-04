function isObject(obj) {
  var t = typeof obj;
  return t === 'function' || t === 'object' && !!obj;
}

function allKeys(obj) {
  if (!isObject(obj)) return [];
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

function extend(obj) {
  var length = arguments.length;
  if (length < 2 || obj == null) return obj;
  for (var index = 1; index < length; index++) {
    var source = arguments[index];
    var keys = allKeys(source);
    var l = keys.length;
    for (var i = 0; i < l; i++) {
      var key = keys[i];
      console.log(key);
      if (isObject(obj[key]) && isObject(source[key])) {
        obj[key] = extend(obj[key], source[key]);
      }
      if (obj[key] === void 0) {
        obj[key] = source[key];
      }
    }
  }
  return obj;
}

exports.extend = extend;