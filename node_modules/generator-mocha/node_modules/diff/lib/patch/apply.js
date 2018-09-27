/*istanbul ignore start*/'use strict';

exports.__esModule = true;
exports. /*istanbul ignore end*/applyPatch = applyPatch;
/*istanbul ignore start*/exports. /*istanbul ignore end*/applyPatches = applyPatches;

var /*istanbul ignore start*/_parse = require('./parse') /*istanbul ignore end*/;

var /*istanbul ignore start*/_distanceIterator = require('../util/distance-iterator') /*istanbul ignore end*/;

/*istanbul ignore start*/
var _distanceIterator2 = _interopRequireDefault(_distanceIterator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*istanbul ignore end*/function applyPatch(source, uniDiff) {
  /*istanbul ignore start*/var /*istanbul ignore end*/options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  if (typeof uniDiff === 'string') {
    uniDiff = /*istanbul ignore start*/(0, _parse.parsePatch) /*istanbul ignore end*/(uniDiff);
  }

  if (Array.isArray(uniDiff)) {
    if (uniDiff.length > 1) {
      throw new Error('applyPatch only works with a single input.');
    }

    uniDiff = uniDiff[0];
  }

  // Apply the diff to the input
  var lines = source.split('\n'),
      hunks = uniDiff.hunks,
      compareLine = options.compareLine || function (lineNumber, line, operation, patchContent) /*istanbul ignore start*/{
    return (/*istanbul ignore end*/line === patchContent
    );
  },
      errorCount = 0,
      fuzzFactor = options.fuzzFactor || 0,
      minLine = 0,
      offset = 0,
      removeEOFNL = /*istanbul ignore start*/void 0 /*istanbul ignore end*/,
      addEOFNL = /*istanbul ignore start*/void 0 /*istanbul ignore end*/;

  /**
   * Checks if the hunk exactly fits on the provided location
   */
  function hunkFits(hunk, toPos) {
    for (var j = 0; j < hunk.lines.length; j++) {
      var line = hunk.lines[j],
          operation = line[0],
          content = line.substr(1);

      if (operation === ' ' || operation === '-') {
        // Context sanity check
        if (!compareLine(toPos + 1, lines[toPos], operation, content)) {
          errorCount++;

          if (errorCount > fuzzFactor) {
            return false;
          }
        }
        toPos++;
      }
    }

    return true;
  }

  // Search best fit offsets for each hunk based on the previous ones
  for (var i = 0; i < hunks.length; i++) {
    var hunk = hunks[i],
        maxLine = lines.length - hunk.oldLines,
        localOffset = 0,
        toPos = offset + hunk.oldStart - 1;

    var iterator = /*istanbul ignore start*/(0, _distanceIterator2.default) /*istanbul ignore end*/(toPos, minLine, maxLine);

    for (; localOffset !== undefined; localOffset = iterator()) {
      if (hunkFits(hunk, toPos + localOffset)) {
        hunk.offset = offset += localOffset;
        break;
      }
    }

    if (localOffset === undefined) {
      return false;
    }

    // Set lower text limit to end of the current hunk, so next ones don't try
    // to fit over already patched text
    minLine = hunk.offset + hunk.oldStart + hunk.oldLines;
  }

  // Apply patch hunks
  for (var _i = 0; _i < hunks.length; _i++) {
    var _hunk = hunks[_i],
        _toPos = _hunk.offset + _hunk.newStart - 1;
    if (_hunk.newLines == 0) {
      _toPos++;
    }

    for (var j = 0; j < _hunk.lines.length; j++) {
      var line = _hunk.lines[j],
          operation = line[0],
          content = line.substr(1);

      if (operation === ' ') {
        _toPos++;
      } else if (operation === '-') {
        lines.splice(_toPos, 1);
        /* istanbul ignore else */
      } else if (operation === '+') {
          lines.splice(_toPos, 0, content);
          _toPos++;
        } else if (operation === '\\') {
          var previousOperation = _hunk.lines[j - 1] ? _hunk.lines[j - 1][0] : null;
          if (previousOperation === '+') {
            removeEOFNL = true;
          } else if (previousOperation === '-') {
            addEOFNL = true;
          }
        }
    }
  }

  // Handle EOFNL insertion/removal
  if (removeEOFNL) {
    while (!lines[lines.length - 1]) {
      lines.pop();
    }
  } else if (addEOFNL) {
    lines.push('');
  }
  return lines.join('\n');
}

// Wrapper that supports multiple file patches via callbacks.
function applyPatches(uniDiff, options) {
  if (typeof uniDiff === 'string') {
    uniDiff = /*istanbul ignore start*/(0, _parse.parsePatch) /*istanbul ignore end*/(uniDiff);
  }

  var currentIndex = 0;
  function processIndex() {
    var index = uniDiff[currentIndex++];
    if (!index) {
      return options.complete();
    }

    options.loadFile(index, function (err, data) {
      if (err) {
        return options.complete(err);
      }

      var updatedContent = applyPatch(data, index, options);
      options.patched(index, updatedContent);

      setTimeout(processIndex, 0);
    });
  }
  processIndex();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXRjaC9hcHBseS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Z0NBR2dCO3lEQXNIQTs7QUF6SGhCOztBQUNBOzs7Ozs7O3VCQUVPLFNBQVMsVUFBVCxDQUFvQixNQUFwQixFQUE0QixPQUE1QixFQUFtRDtzREFBZCxnRUFBVSxrQkFBSTs7QUFDeEQsTUFBSSxPQUFPLE9BQVAsS0FBbUIsUUFBbkIsRUFBNkI7QUFDL0IsY0FBVSx3RUFBVyxPQUFYLENBQVYsQ0FEK0I7R0FBakM7O0FBSUEsTUFBSSxNQUFNLE9BQU4sQ0FBYyxPQUFkLENBQUosRUFBNEI7QUFDMUIsUUFBSSxRQUFRLE1BQVIsR0FBaUIsQ0FBakIsRUFBb0I7QUFDdEIsWUFBTSxJQUFJLEtBQUosQ0FBVSw0Q0FBVixDQUFOLENBRHNCO0tBQXhCOztBQUlBLGNBQVUsUUFBUSxDQUFSLENBQVYsQ0FMMEI7R0FBNUI7OztBQUx3RCxNQWNwRCxRQUFRLE9BQU8sS0FBUCxDQUFhLElBQWIsQ0FBUjtNQUNBLFFBQVEsUUFBUSxLQUFSO01BRVIsY0FBYyxRQUFRLFdBQVIsSUFBd0IsVUFBQyxVQUFELEVBQWEsSUFBYixFQUFtQixTQUFuQixFQUE4QixZQUE5QjttQ0FBK0MsU0FBUyxZQUFUOztHQUEvQztNQUN0QyxhQUFhLENBQWI7TUFDQSxhQUFhLFFBQVEsVUFBUixJQUFzQixDQUF0QjtNQUNiLFVBQVUsQ0FBVjtNQUNBLFNBQVMsQ0FBVDtNQUVBLHFFQVRKO01BVUksa0VBVko7Ozs7O0FBZHdELFdBNkIvQyxRQUFULENBQWtCLElBQWxCLEVBQXdCLEtBQXhCLEVBQStCO0FBQzdCLFNBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLEtBQUssS0FBTCxDQUFXLE1BQVgsRUFBbUIsR0FBdkMsRUFBNEM7QUFDMUMsVUFBSSxPQUFPLEtBQUssS0FBTCxDQUFXLENBQVgsQ0FBUDtVQUNBLFlBQVksS0FBSyxDQUFMLENBQVo7VUFDQSxVQUFVLEtBQUssTUFBTCxDQUFZLENB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QUFOLEdBRCtCO0tBQWpDO0dBREYsTUFJTyxJQUFJLFFBQUosRUFBYztBQUNuQixVQUFNLElBQU4sQ0FBVyxFQUFYLEVBRG1CO0dBQWQ7QUFHUCxTQUFPLE1BQU0sSUFBTixDQUFXLElBQVgsQ0FBUCxDQWxId0Q7Q0FBbkQ7OztBQXNIQSxTQUFTLFlBQVQsQ0FBc0IsT0FBdEIsRUFBK0IsT0FBL0IsRUFBd0M7QUFDN0MsTUFBSSxPQUFPLE9BQVAsS0FBbUIsUUFBbkIsRUFBNkI7QUFDL0IsY0FBVSx3RUFBVyxPQUFYLENBQVYsQ0FEK0I7R0FBakM7O0FBSUEsTUFBSSxlQUFlLENBQWYsQ0FMeUM7QUFNN0MsV0FBUyxZQUFULEdBQXdCO0FBQ3RCLFFBQUksUUFBUSxRQUFRLGNBQVIsQ0FBUixDQURrQjtBQUV0QixRQUFJLENBQUMsS0FBRCxFQUFRO0FBQ1YsYUFBTyxRQUFRLFFBQVIsRUFBUCxDQURVO0tBQVo7O0FBSUEsWUFBUSxRQUFSLENBQWlCLEtBQWpCLEVBQXdCLFVBQVMsR0FBVCxFQUFjLElBQWQsRUFBb0I7QUFDMUMsVUFBSSxHQUFKLEVBQVM7QUFDUCxlQUFPLFFBQVEsUUFBUixDQUFpQixHQUFqQixDQUFQLENBRE87T0FBVDs7QUFJQSxVQUFJLGlCQUFpQixXQUFXLElBQVgsRUFBaUIsS0FBakIsRUFBd0IsT0FBeEIsQ0FBakIsQ0FMc0M7QUFNMUMsY0FBUSxPQUFSLENBQWdCLEtBQWhCLEVBQXVCLGNBQXZCLEVBTjBDOztBQVExQyxpQkFBVyxZQUFYLEVBQXlCLENBQXpCLEVBUjBDO0tBQXBCLENBQXhCLENBTnNCO0dBQXhCO0FBaUJBLGlCQXZCNkM7Q0FBeEMiLCJmaWxlIjoiYXBwbHkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3BhcnNlUGF0Y2h9IGZyb20gJy4vcGFyc2UnO1xuaW1wb3J0IGRpc3RhbmNlSXRlcmF0b3IgZnJvbSAnLi4vdXRpbC9kaXN0YW5jZS1pdGVyYXRvcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVBhdGNoKHNvdXJjZSwgdW5pRGlmZiwgb3B0aW9ucyA9IHt9KSB7XG4gIGlmICh0eXBlb2YgdW5pRGlmZiA9PT0gJ3N0cmluZycpIHtcbiAgICB1bmlEaWZmID0gcGFyc2VQYXRjaCh1bmlEaWZmKTtcbiAgfVxuXG4gIGlmIChBcnJheS5pc0FycmF5KHVuaURpZmYpKSB7XG4gICAgaWYgKHVuaURpZmYubGVuZ3RoID4gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdhcHBseVBhdGNoIG9ubHkgd29ya3Mgd2l0aCBhIHNpbmdsZSBpbnB1dC4nKTtcbiAgICB9XG5cbiAgICB1bmlEaWZmID0gdW5pRGlmZlswXTtcbiAgfVxuXG4gIC8vIEFwcGx5IHRoZSBkaWZmIHRvIHRoZSBpbnB1dFxuICBsZXQgbGluZXMgPSBzb3VyY2Uuc3BsaXQoJ1xcbicpLFxuICAgICAgaHVua3MgPSB1bmlEaWZmLmh1bmtzLFxuXG4gICAgICBjb21wYXJlTGluZSA9IG9wdGlvbnMuY29tcGFyZUxpbmUgfHwgKChsaW5lTnVtYmVyLCBsaW5lLCBvcGVyYXRpb24sIHBhdGNoQ29udGVudCkgPT4gbGluZSA9PT0gcGF0Y2hDb250ZW50KSxcbiAgICAgIGVycm9yQ291bnQgPSAwLFxuICAgICAgZnV6ekZhY3RvciA9IG9wdGlvbnMuZnV6ekZhY3RvciB8fCAwLFxuICAgICAgbWluTGluZSA9IDAsXG4gICAgICBvZmZzZXQgPSAwLFxuXG4gICAgICByZW1vdmVFT0ZOTCxcbiAgICAgIGFkZEVPRk5MO1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGh1bmsgZXhhY3RseSBmaXRzIG9uIHRoZSBwcm92aWRlZCBsb2NhdGlvblxuICAgKi9cbiAgZnVuY3Rpb24gaHVua0ZpdHMoaHVuaywgdG9Qb3MpIHtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGh1bmsubGluZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGxldCBsaW5lID0gaHVuay5saW5lc1tqXSxcbiAgICAgICAgICBvcGVyYXRpb24gPSBsaW5lWzBdLFxuICAgICAgICAgIGNvbnRlbnQgPSBsaW5lLnN1YnN0cigxKTtcblxuICAgICAgaWYgKG9wZXJhdGlvbiA9PT0gJyAnIHx8IG9wZXJhdGlvbiA9PT0gJy0nKSB7XG4gICAgICAgIC8vIENvbnRleHQgc2FuaXR5IGNoZWNrXG4gICAgICAgIGlmICghY29tcGFyZUxpbmUodG9Qb3MgKyAxLCBsaW5lc1t0b1Bvc10sIG9wZXJhdGlvbiwgY29udGVudCkpIHtcbiAgICAgICAgICBlcnJvckNvdW50Kys7XG5cbiAgICAgICAgICBpZiAoZXJyb3JDb3VudCA+IGZ1enpGYWN0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdG9Qb3MrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIFNlYXJjaCBiZXN0IGZpdCBvZmZzZXRzIGZvciBlYWNoIGh1bmsgYmFzZWQgb24gdGhlIHByZXZpb3VzIG9uZXNcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBodW5rcy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBodW5rID0gaHVua3NbaV0sXG4gICAgICAgIG1heExpbmUgPSBsaW5lcy5sZW5ndGggLSBodW5rLm9sZExpbmVzLFxuICAgICAgICBsb2NhbE9mZnNldCA9IDAsXG4gICAgICAgIHRvUG9zID0gb2Zmc2V0ICsgaHVuay5vbGRTdGFydCAtIDE7XG5cbiAgICBsZXQgaXRlcmF0b3IgPSBkaXN0YW5jZUl0ZXJhdG9yKHRvUG9zLCBtaW5MaW5lLCBtYXhMaW5lKTtcblxuICAgIGZvciAoOyBsb2NhbE9mZnNldCAhPT0gdW5kZWZpbmVkOyBsb2NhbE9mZnNldCA9IGl0ZXJhdG9yKCkpIHtcbiAgICAgIGlmIChodW5rRml0cyhodW5rLCB0b1BvcyArIGxvY2FsT2Zmc2V0KSkge1xuICAgICAgICBodW5rLm9mZnNldCA9IG9mZnNldCArPSBsb2NhbE9mZnNldDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGxvY2FsT2Zmc2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBTZXQgbG93ZXIgdGV4dCBsaW1pdCB0byBlbmQgb2YgdGhlIGN1cnJlbnQgaHVuaywgc28gbmV4dCBvbmVzIGRvbid0IHRyeVxuICAgIC8vIHRvIGZpdCBvdmVyIGFscmVhZHkgcGF0Y2hlZCB0ZXh0XG4gICAgbWluTGluZSA9IGh1bmsub2Zmc2V0ICsgaHVuay5vbGRTdGFydCArIGh1bmsub2xkTGluZXM7XG4gIH1cblxuICAvLyBBcHBseSBwYXRjaCBodW5rc1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGh1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGh1bmsgPSBodW5rc1tpXSxcbiAgICAgICAgdG9Qb3MgPSBodW5rLm9mZnNldCArIGh1bmsubmV3U3RhcnQgLSAxO1xuICAgIGlmIChodW5rLm5ld0xpbmVzID09IDApIHsgdG9Qb3MrKzsgfVxuXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBodW5rLmxpbmVzLmxlbmd0aDsgaisrKSB7XG4gICAgICBsZXQgbGluZSA9IGh1bmsubGluZXNbal0sXG4gICAgICAgICAgb3BlcmF0aW9uID0gbGluZVswXSxcbiAgICAgICAgICBjb250ZW50ID0gbGluZS5zdWJzdHIoMSk7XG5cbiAgICAgIGlmIChvcGVyYXRpb24gPT09ICcgJykge1xuICAgICAgICB0b1BvcysrO1xuICAgICAgfSBlbHNlIGlmIChvcGVyYXRpb24gPT09ICctJykge1xuICAgICAgICBsaW5lcy5zcGxpY2UodG9Qb3MsIDEpO1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIH0gZWxzZSBpZiAob3BlcmF0aW9uID09PSAnKycpIHtcbiAgICAgICAgbGluZXMuc3BsaWNlKHRvUG9zLCAwLCBjb250ZW50KTtcbiAgICAgICAgdG9Qb3MrKztcbiAgICAgIH0gZWxzZSBpZiAob3BlcmF0aW9uID09PSAnXFxcXCcpIHtcbiAgICAgICAgbGV0IHByZXZpb3VzT3BlcmF0aW9uID0gaHVuay5saW5lc1tqIC0gMV0gPyBodW5rLmxpbmVzW2ogLSAxXVswXSA6IG51bGw7XG4gICAgICAgIGlmIChwcmV2aW91c09wZXJhdGlvbiA9PT0gJysnKSB7XG4gICAgICAgICAgcmVtb3ZlRU9GTkwgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHByZXZpb3VzT3BlcmF0aW9uID09PSAnLScpIHtcbiAgICAgICAgICBhZGRFT0ZOTCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBIYW5kbGUgRU9GTkwgaW5zZXJ0aW9uL3JlbW92YWxcbiAgaWYgKHJlbW92ZUVPRk5MKSB7XG4gICAgd2hpbGUgKCFsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSkge1xuICAgICAgbGluZXMucG9wKCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGFkZEVPRk5MKSB7XG4gICAgbGluZXMucHVzaCgnJyk7XG4gIH1cbiAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xufVxuXG4vLyBXcmFwcGVyIHRoYXQgc3VwcG9ydHMgbXVsdGlwbGUgZmlsZSBwYXRjaGVzIHZpYSBjYWxsYmFja3MuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQYXRjaGVzKHVuaURpZmYsIG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiB1bmlEaWZmID09PSAnc3RyaW5nJykge1xuICAgIHVuaURpZmYgPSBwYXJzZVBhdGNoKHVuaURpZmYpO1xuICB9XG5cbiAgbGV0IGN1cnJlbnRJbmRleCA9IDA7XG4gIGZ1bmN0aW9uIHByb2Nlc3NJbmRleCgpIHtcbiAgICBsZXQgaW5kZXggPSB1bmlEaWZmW2N1cnJlbnRJbmRleCsrXTtcbiAgICBpZiAoIWluZGV4KSB7XG4gICAgICByZXR1cm4gb3B0aW9ucy5jb21wbGV0ZSgpO1xuICAgIH1cblxuICAgIG9wdGlvbnMubG9hZEZpbGUoaW5kZXgsIGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZXR1cm4gb3B0aW9ucy5jb21wbGV0ZShlcnIpO1xuICAgICAgfVxuXG4gICAgICBsZXQgdXBkYXRlZENvbnRlbnQgPSBhcHBseVBhdGNoKGRhdGEsIGluZGV4LCBvcHRpb25zKTtcbiAgICAgIG9wdGlvbnMucGF0Y2hlZChpbmRleCwgdXBkYXRlZENvbnRlbnQpO1xuXG4gICAgICBzZXRUaW1lb3V0KHByb2Nlc3NJbmRleCwgMCk7XG4gICAgfSk7XG4gIH1cbiAgcHJvY2Vzc0luZGV4KCk7XG59XG4iXX0=
