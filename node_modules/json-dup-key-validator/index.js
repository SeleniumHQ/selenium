var backslash = require('backslash');
module.exports = {
  validate: validate,
  parse: parse
};

/**
 * Validates a json string.
 * Errors are returned
 * @param jsonString
 * @param allowDuplicatedKeys
 * @returns {String} error. undefined if no error
 */
function validate(jsonString, allowDuplicatedKeys) {
  var error;
  allowDuplicatedKeys = allowDuplicatedKeys || false;
  if (typeof jsonString !== 'string') {
    error = 'Input must be a string';
  } else {
    try {
      // Try to find a value starting from index 0
      _findValue(jsonString, 0, allowDuplicatedKeys, false);
    } catch(e) {
      error = e.message;
    }
  }
  return error;
}

/**
 * Parses a json. Errors are thrown if any
 * @param jsonString
 * @param allowDuplicatedKeys
 * @returns {Object}
 */
function parse(jsonString, allowDuplicatedKeys) {
  if (typeof jsonString !== 'string') {
    throw new Error('Input must be a string');
  }

  allowDuplicatedKeys = allowDuplicatedKeys || false;

  // Try to find a value starting from index 0
  var value = _findValue(jsonString, 0, allowDuplicatedKeys, true);
  return value.value;
}

/**
 * Find the comma separator, ], } or end of file
 * @param {String} str - original json string
 * @param {Number} startInd - starting index
 * @returns {{start: Number, end: Number, value: String}} value: the separator found
 * @private
 */
function _findSeparator(str, startInd) {
  var len = str.length;
  var sepStartInd = startInd;
  var sepEndInd;
  for (var i = startInd; i < len; i++) {
    var ch = str[i];
    if (ch === ',') {
      sepEndInd = i;
      break;
    } else if ( ch === ']' || ch === '}') {
      sepEndInd = i - 1;
      break;
    } else if (!_isWhiteSpace(ch)) {
      throw _syntaxError(str, i, 'expecting end of expression or separator');
    }
  }

  var value;
  if (sepEndInd === undefined) {
    sepEndInd = len;
    value = str[sepEndInd];
  } else {
    value = str[sepEndInd];
    sepEndInd++;
  }
  return {
    start: sepStartInd,
    end: sepEndInd,
    value: value
  };
}

/**
 * Find the semi-colon separator ':'
 * @param {String} str - original json string
 * @param {Number} startInd
 * @returns {{start: Number, end: Number}}
 * @private
 */
function _findSemiColonSeparator(str, startInd) {
  var len = str.length;
  var semiColStartInd = startInd;
  var semiColEndInd;
  for (var i = startInd; i < len; i++) {
    var ch = str[i];
    if (ch === ':') {
      semiColEndInd = i;
      break;
    } else if (!_isWhiteSpace(ch)) {
      throw _syntaxError(str, i, 'expecting \':\'');
    }
  }
  if (semiColEndInd === undefined) {
    throw _syntaxError(str, i, 'expecting \':\'');
  }
  semiColEndInd++;
  return {
    start: semiColStartInd,
    end: semiColEndInd
  };
}

/**
 * Find a value it can be number, array, object, strings or boolean
 * @param {String} str - original json string
 * @param {Number} startInd
 * @param {Boolean} allowDuplicatedKeys - allow duplicated keys in objects or not
 * @returns {{value: *, start: Number, end: Number}}
 * @private
 */
function _findValue(str, startInd, allowDuplicatedKeys, parse) {
  var len = str.length;
  var valueStartInd;
  var valueEndInd;
  var isArray = false;
  var isObject = false;
  var isString = false;
  var isNumber = false;
  var dotFound = false;
  var whiteSpaceInNumber = false;
  var value;

  for (var i = startInd; i < len; i++) {

    var ch = str[i];
    if (valueStartInd === undefined) {
      if (!_isWhiteSpace(ch)) {
        if (ch === '[') {
          isArray = true;
        } else if (ch === '{') {
          isObject = true;
        } else if (ch === '"') {
          isString = true;
        } else if (_isTrueFromIndex(str, i)) {
          valueStartInd = i;
          i = i + 3;
          valueEndInd = i;
          value = true;
          break;
        } else if (_isFalseFromIndex(str, i)) {
          valueStartInd = i;
          i = i + 4;
          valueEndInd = i;
          value = false;
          break;
        } else if (_isNullFromIndex(str, i)) {
          valueStartInd = i;
          i = i + 3;
          valueEndInd = i;
          value = null;
          break;
        } else if (_isNumber(ch)) {
          isNumber = true;
        } else if (ch === '-') {
          isNumber = true;
        } else {
          throw _syntaxError(str, i, '');
        }
        valueStartInd = i;
      }
    } else {
      if (isArray) {
        var arr = _findArray(str, i, allowDuplicatedKeys, parse);
        valueEndInd = arr.end;
        value = arr.value;
        break;
      } else if (isObject) {
        var obj = _findObject(str, i, allowDuplicatedKeys, parse);
        valueEndInd = obj.end;
        value = obj.value;
        break;
      } else if (isString && ch === '"' && _hasEvenNumberOfBackSlash(str, i - 1)) {
        valueEndInd = i;
        value = backslash(str.substring(valueStartInd + 1, valueEndInd));
        break;
      } else if (isNumber) {
        if(_isWhiteSpace(ch)) {
          whiteSpaceInNumber = true;
        } else if (ch === ',' || ch === ']' || ch === '}') {
          value = parseFloat(str.substring(valueStartInd, valueEndInd), 10);
          valueEndInd = i - 1;
          break;
        } else if (_isNumber(ch) && !whiteSpaceInNumber) {
          continue;
        } else if (ch === '.' && !dotFound && !whiteSpaceInNumber) {
          dotFound = true;
        } else {
          throw _syntaxError(str, i, 'expecting number');
        }
      }
    }
  }

  if (valueEndInd === undefined) {
    if (isNumber) {
      value = parseFloat(str.substring(valueStartInd, i), 10);
      valueEndInd = i - 1;
    } else {
      throw _syntaxError(str, i, 'unclosed statement');
    }
  }
  valueEndInd++;
  return {
    value: value,
    start: valueStartInd,
    end: valueEndInd
  };
}

/**
 * Find a key in an object
 * @param {String} str - original json string
 * @param {Number} startInd
 * @returns {{start: Number, end: Number, value: String}}
 * @private
 */
function _findKey(str, startInd) {
  var len = str.length;
  var keyStartInd;
  var keyEndInd;
  for (var i = startInd; i < len; i++) {
    var ch = str[i];
    if (keyStartInd === undefined) {
      if (!_isWhiteSpace(ch)) {
        if (ch !== '"') {
          throw _syntaxError(str, i, 'expecting String');
        }
        keyStartInd = i;
      }
    } else {
      if (ch === '"' && _hasEvenNumberOfBackSlash(str, i - 1)) {
        keyEndInd = i;
        break;
      }
    }
  }

  if (keyEndInd === undefined) {
    throw _syntaxError(str, len, 'expecting String');
  }

  var value = backslash(str.substring(keyStartInd + 1, keyEndInd));
  if (value === '') {
    throw _syntaxError(str, keyStartInd, 'empty string');
  }
  keyEndInd++;
  return {
    start: keyStartInd,
    end: keyEndInd,
    value: value
  };
}

/**
 * Find an object by identifying the key, ':' separator and value
 * @param {String} str - original json string
 * @param {Number} startInd
 * @param {Boolean} allowDuplicatedKeys
 * @returns {{start: Number, end: Number, value: Object}}
 * @private
 */
function _findObject(str, startInd, allowDuplicatedKeys, parse) {
  var i = startInd;
  var sepValue = ',';
  var obj = {};
  var keys = [];
  var values = [];

  var j = startInd;
  while (_isWhiteSpace(str[j])) {
    j++;
  }

  if (str[j] === '}') {
    return {
      start: startInd,
      end: j,
      value: obj
    };
  }

  while (sepValue === ',') {
    var key = _findKey(str, i);
    var semi = _findSemiColonSeparator(str, key.end);
    var value = _findValue(str, semi.end, allowDuplicatedKeys, parse);
    var sepIndex = _findSeparator(str, value.end);

    if (!allowDuplicatedKeys) {
      if(keys.indexOf(key.value) !== -1) {
        throw _syntaxError(str, key.end, 'duplicated keys "' + key.value + '"');
      }
    }
    keys.push(key.value);
    values.push(value.value);
    i = sepIndex.end;
    sepValue = sepIndex.value;
  }

  if (parse) {
    var indx = 0;
    for(indx = 0; indx < keys.length; indx++) {
      obj[keys[indx]] = values[indx];
    }
  }

  return {
    start: startInd,
    end: i,
    value: obj
  };
}

/**
 * Going backward from an index, determine if there are even number
 * of consecutive backslashes in the string
 * @param {String} str - original json string
 * @param {Number} endInd
 * @returns {Boolean}
 * @private
 */
function _hasEvenNumberOfBackSlash(str, endInd) {
  var i = endInd;
  var count = 0;
  while(i > -1 && str[i] === '\\') {
    count++;
    i--;
  }
  return (count % 2) === 0;
}

/**
 * Find an array by identifying values separated by ',' separator
 * @param {String} str - original json string
 * @param {Number} startInd
 * @returns {{start: Number, end: Number, value: Array}}
 * @private
 */
function _findArray(str, startInd, allowDuplicatedKeys, parse) {
  var i = startInd;
  var sepValue = ',';
  var arr = [];

  var j = startInd;
  while (_isWhiteSpace(str[j])) {
    j++;
  }

  if (str[j] === ']') {
    return {
      start: startInd,
      end: j,
      value: arr
    };
  }

  while (sepValue === ',') {
    var value = _findValue(str, i, allowDuplicatedKeys, parse);
    var sepIndex = _findSeparator(str, value.end);

    if (parse) {
      arr.push(value.value);
    }
    i = sepIndex.end;
    sepValue = sepIndex.value;
  }
  return {
    start: startInd,
    end: i,
    value: arr
  };
}

/**
 * Determine if the string is 'true' from specified index
 * @param {String} str - original json string
 * @param {Number} ind
 * @returns {Boolean}
 * @private
 */
function _isTrueFromIndex(str, ind) {
  return (str.substr(ind, 4) === 'true');
}

/**
 * Determine if the string is 'false' from specified index
 * @param {String} str - original json string
 * @param {Number} ind
 * @returns {Boolean}
 * @private
 */
function _isFalseFromIndex(str, ind) {
  return (str.substr(ind, 5) === 'false');
}

/**
 * Determine if the string is 'null' from specified index
 * @param {String} str - original json string
 * @param {Number} ind
 * @returns {Boolean}
 * @private
 */
function _isNullFromIndex(str, ind) {
  return (str.substr(ind, 4) === 'null');
}

var white = new RegExp(/^\s$/);
/**
 * Determine if this character is a white space
 * @param {String} ch - single character string
 * @returns {Boolean}
 * @private
 */
function _isWhiteSpace(ch){
  return white.test(ch);
}

var numberReg = new RegExp(/^\d$/);
/**
 * Determine if this character is a numeric character
 * @param {String} ch - single character string
 * @returns {Boolean}
 * @private
 */
function _isNumber(ch) {
  return numberReg.test(ch);
}

/**
 * Generate syntax error
 * @param {String} str - original json string
 * @param {Number} index - index in which the error was detected
 * @param {String} reason
 * @returns {Error}
 * @private
 */
function _syntaxError(str, index, reason) {
  var regionLen = 10;

  var regionStr;
  if (str.length < index + regionLen) {
    regionStr = str.substr(_normalizeNegativeNumber(str.length - regionLen), str.length);
  } else if (index - (regionLen/2) < 0) {
    regionStr = str.substr(0, regionLen);
  } else {
    regionStr = str.substr(_normalizeNegativeNumber(index - (regionLen/2)), regionLen);
  }

  var message;
  if (reason) {
    message = 'Syntax error: ' + reason + ' near ' + regionStr;
  } else {
    message = 'Syntax error near ' + regionStr;
  }
  return new Error(message);
}

/**
 * Return 0 if number is negative, the original number otherwise
 * @param {Number} num
 * @returns {Number}
 * @private
 */
function _normalizeNegativeNumber(num) {
  return (num < 0) ? 0 : num;
}