/*istanbul ignore start*/"use strict";

exports.__esModule = true;
exports. /*istanbul ignore end*/convertChangesToDMP = convertChangesToDMP;
// See: http://code.google.com/p/google-diff-match-patch/wiki/API
function convertChangesToDMP(changes) {
  var ret = [],
      change = /*istanbul ignore start*/void 0 /*istanbul ignore end*/,
      operation = /*istanbul ignore start*/void 0 /*istanbul ignore end*/;
  for (var i = 0; i < changes.length; i++) {
    change = changes[i];
    if (change.added) {
      operation = 1;
    } else if (change.removed) {
      operation = -1;
    } else {
      operation = 0;
    }

    ret.push([operation, change.value]);
  }
  return ret;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb252ZXJ0L2RtcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Z0NBQ2dCOztBQUFULFNBQVMsbUJBQVQsQ0FBNkIsT0FBN0IsRUFBc0M7QUFDM0MsTUFBSSxNQUFNLEVBQU47TUFDQSxnRUFESjtNQUVJLG1FQUZKLENBRDJDO0FBSTNDLE9BQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLFFBQVEsTUFBUixFQUFnQixHQUFwQyxFQUF5QztBQUN2QyxhQUFTLFFBQVEsQ0FBUixDQUFULENBRHVDO0FBRXZDLFFBQUksT0FBTyxLQUFQLEVBQWM7QUFDaEIsa0JBQVksQ0FBWixDQURnQjtLQUFsQixNQUVPLElBQUksT0FBTyxPQUFQLEVBQWdCO0FBQ3pCLGtCQUFZLENBQUMsQ0FBRCxDQURhO0tBQXBCLE1BRUE7QUFDTCxrQkFBWSxDQUFaLENBREs7S0FGQTs7QUFNUCxRQUFJLElBQUosQ0FBUyxDQUFDLFNBQUQsRUFBWSxPQUFPLEtBQVAsQ0FBckIsRUFWdUM7R0FBekM7QUFZQSxTQUFPLEdBQVAsQ0FoQjJDO0NBQXRDIiwiZmlsZSI6ImRtcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFNlZTogaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2dvb2dsZS1kaWZmLW1hdGNoLXBhdGNoL3dpa2kvQVBJXG5leHBvcnQgZnVuY3Rpb24gY29udmVydENoYW5nZXNUb0RNUChjaGFuZ2VzKSB7XG4gIGxldCByZXQgPSBbXSxcbiAgICAgIGNoYW5nZSxcbiAgICAgIG9wZXJhdGlvbjtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2hhbmdlID0gY2hhbmdlc1tpXTtcbiAgICBpZiAoY2hhbmdlLmFkZGVkKSB7XG4gICAgICBvcGVyYXRpb24gPSAxO1xuICAgIH0gZWxzZSBpZiAoY2hhbmdlLnJlbW92ZWQpIHtcbiAgICAgIG9wZXJhdGlvbiA9IC0xO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcGVyYXRpb24gPSAwO1xuICAgIH1cblxuICAgIHJldC5wdXNoKFtvcGVyYXRpb24sIGNoYW5nZS52YWx1ZV0pO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG4iXX0=
