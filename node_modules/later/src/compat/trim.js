// The trim method returns the string stripped of whitespace from both ends.
// trim does not affect the value of the string itself.
//
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/Trim
//
if(!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
  };
}