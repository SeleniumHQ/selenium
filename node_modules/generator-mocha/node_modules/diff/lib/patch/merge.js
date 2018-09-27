/*istanbul ignore start*/'use strict';

exports.__esModule = true;
exports. /*istanbul ignore end*/calcLineCount = calcLineCount;
/*istanbul ignore start*/exports. /*istanbul ignore end*/merge = merge;

var /*istanbul ignore start*/_create = require('./create') /*istanbul ignore end*/;

var /*istanbul ignore start*/_parse = require('./parse') /*istanbul ignore end*/;

var /*istanbul ignore start*/_array = require('../util/array') /*istanbul ignore end*/;

/*istanbul ignore start*/
function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*istanbul ignore end*/function calcLineCount(hunk) {
  var conflicted = false;

  hunk.oldLines = 0;
  hunk.newLines = 0;

  hunk.lines.forEach(function (line) {
    if (typeof line !== 'string') {
      conflicted = true;
      return;
    }

    if (line[0] === '+' || line[0] === ' ') {
      hunk.newLines++;
    }
    if (line[0] === '-' || line[0] === ' ') {
      hunk.oldLines++;
    }
  });

  if (conflicted) {
    delete hunk.oldLines;
    delete hunk.newLines;
  }
}

function merge(mine, theirs, base) {
  mine = loadPatch(mine, base);
  theirs = loadPatch(theirs, base);

  var ret = {};

  // For index we just let it pass through as it doesn't have any necessary meaning.
  // Leaving sanity checks on this to the API consumer that may know more about the
  // meaning in their own context.
  if (mine.index || theirs.index) {
    ret.index = mine.index || theirs.index;
  }

  if (mine.newFileName || theirs.newFileName) {
    if (!fileNameChanged(mine)) {
      // No header or no change in ours, use theirs (and ours if theirs does not exist)
      ret.oldFileName = theirs.oldFileName || mine.oldFileName;
      ret.newFileName = theirs.newFileName || mine.newFileName;
      ret.oldHeader = theirs.oldHeader || mine.oldHeader;
      ret.newHeader = theirs.newHeader || mine.newHeader;
    } else if (!fileNameChanged(theirs)) {
      // No header or no change in theirs, use ours
      ret.oldFileName = mine.oldFileName;
      ret.newFileName = mine.newFileName;
      ret.oldHeader = mine.oldHeader;
      ret.newHeader = mine.newHeader;
    } else {
      // Both changed... figure it out
      ret.oldFileName = selectField(ret, mine.oldFileName, theirs.oldFileName);
      ret.newFileName = selectField(ret, mine.newFileName, theirs.newFileName);
      ret.oldHeader = selectField(ret, mine.oldHeader, theirs.oldHeader);
      ret.newHeader = selectField(ret, mine.newHeader, theirs.newHeader);
    }
  }

  ret.hunks = [];

  var mineIndex = 0,
      theirsIndex = 0,
      mineOffset = 0,
      theirsOffset = 0;

  while (mineIndex < mine.hunks.length || theirsIndex < theirs.hunks.length) {
    var mineCurrent = mine.hunks[mineIndex] || { oldStart: Infinity },
        theirsCurrent = theirs.hunks[theirsIndex] || { oldStart: Infinity };

    if (hunkBefore(mineCurrent, theirsCurrent)) {
      // This patch does not overlap with any of the others, yay.
      ret.hunks.push(cloneHunk(mineCurrent, mineOffset));
      mineIndex++;
      theirsOffset += mineCurrent.newLines - mineCurrent.oldLines;
    } else if (hunkBefore(theirsCurrent, mineCurrent)) {
      // This patch does not overlap with any of the others, yay.
      ret.hunks.push(cloneHunk(theirsCurrent, theirsOffset));
      theirsIndex++;
      mineOffset += theirsCurrent.newLines - theirsCurrent.oldLines;
    } else {
      // Overlap, merge as best we can
      var mergedHunk = {
        oldStart: Math.min(mineCurrent.oldStart, theirsCurrent.oldStart),
        oldLines: 0,
        newStart: Math.min(mineCurrent.newStart + mineOffset, theirsCurrent.oldStart + theirsOffset),
        newLines: 0,
        lines: []
      };
      mergeLines(mergedHunk, mineCurrent.oldStart, mineCurrent.lines, theirsCurrent.oldStart, theirsCurrent.lines);
      theirsIndex++;
      mineIndex++;

      ret.hunks.push(mergedHunk);
    }
  }

  return ret;
}

function loadPatch(param, base) {
  if (typeof param === 'string') {
    if (/^@@/m.test(param) || /^Index:/m.test(param)) {
      return (/*istanbul ignore start*/(0, _parse.parsePatch) /*istanbul ignore end*/(param)[0]
      );
    }

    if (!base) {
      throw new Error('Must provide a base reference or pass in a patch');
    }
    return (/*istanbul ignore start*/(0, _create.structuredPatch) /*istanbul ignore end*/(undefined, undefined, base, param)
    );
  }

  return param;
}

function fileNameChanged(patch) {
  return patch.newFileName && patch.newFileName !== patch.oldFileName;
}

function selectField(index, mine, theirs) {
  if (mine === theirs) {
    return mine;
  } else {
    index.conflict = true;
    return { mine: mine, theirs: theirs };
  }
}

function hunkBefore(test, check) {
  return test.oldStart < check.oldStart && test.oldStart + test.oldLines < check.oldStart;
}

function cloneHunk(hunk, offset) {
  return {
    oldStart: hunk.oldStart, oldLines: hunk.oldLines,
    newStart: hunk.newStart + offset, newLines: hunk.newLines,
    lines: hunk.lines
  };
}

function mergeLines(hunk, mineOffset, mineLines, theirOffset, theirLines) {
  // This will generally result in a conflicted hunk, but there are cases where the context
  // is the only overlap where we can successfully merge the content here.
  var mine = { offset: mineOffset, lines: mineLines, index: 0 },
      their = { offset: theirOffset, lines: theirLines, index: 0 };

  // Handle any leading content
  insertLeading(hunk, mine, their);
  insertLeading(hunk, their, mine);

  // Now in the overlap content. Scan through and select the best changes from each.
  while (mine.index < mine.lines.length && their.index < their.lines.length) {
    var mineCurrent = mine.lines[mine.index],
        theirCurrent = their.lines[their.index];

    if ((mineCurrent[0] === '-' || mineCurrent[0] === '+') && (theirCurrent[0] === '-' || theirCurrent[0] === '+')) {
      // Both modified ...
      mutualChange(hunk, mine, their);
    } else if (mineCurrent[0] === '+' && theirCurrent[0] === ' ') {
      /*istanbul ignore start*/
      var _hunk$lines;

      /*istanbul ignore end*/
      // Mine inserted
      /*istanbul ignore start*/(_hunk$lines = /*istanbul ignore end*/hunk.lines).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_hunk$lines /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/collectChange(mine)));
    } else if (theirCurrent[0] === '+' && mineCurrent[0] === ' ') {
      /*istanbul ignore start*/
      var _hunk$lines2;

      /*istanbul ignore end*/
      // Theirs inserted
      /*istanbul ignore start*/(_hunk$lines2 = /*istanbul ignore end*/hunk.lines).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_hunk$lines2 /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/collectChange(their)));
    } else if (mineCurrent[0] === '-' && theirCurrent[0] === ' ') {
      // Mine removed or edited
      removal(hunk, mine, their);
    } else if (theirCurrent[0] === '-' && mineCurrent[0] === ' ') {
      // Their removed or edited
      removal(hunk, their, mine, true);
    } else if (mineCurrent === theirCurrent) {
      // Context identity
      hunk.lines.push(mineCurrent);
      mine.index++;
      their.index++;
    } else {
      // Context mismatch
      conflict(hunk, collectChange(mine), collectChange(their));
    }
  }

  // Now push anything that may be remaining
  insertTrailing(hunk, mine);
  insertTrailing(hunk, their);

  calcLineCount(hunk);
}

function mutualChange(hunk, mine, their) {
  var myChanges = collectChange(mine),
      theirChanges = collectChange(their);

  if (allRemoves(myChanges) && allRemoves(theirChanges)) {
    // Special case for remove changes that are supersets of one another
    if ( /*istanbul ignore start*/(0, _array.arrayStartsWith) /*istanbul ignore end*/(myChanges, theirChanges) && skipRemoveSuperset(their, myChanges, myChanges.length - theirChanges.length)) {
      /*istanbul ignore start*/
      var _hunk$lines3;

      /*istanbul ignore end*/
      /*istanbul ignore start*/(_hunk$lines3 = /*istanbul ignore end*/hunk.lines).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_hunk$lines3 /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/myChanges));
      return;
    } else if ( /*istanbul ignore start*/(0, _array.arrayStartsWith) /*istanbul ignore end*/(theirChanges, myChanges) && skipRemoveSuperset(mine, theirChanges, theirChanges.length - myChanges.length)) {
      /*istanbul ignore start*/
      var _hunk$lines4;

      /*istanbul ignore end*/
      /*istanbul ignore start*/(_hunk$lines4 = /*istanbul ignore end*/hunk.lines).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_hunk$lines4 /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/theirChanges));
      return;
    }
  } else if ( /*istanbul ignore start*/(0, _array.arrayEqual) /*istanbul ignore end*/(myChanges, theirChanges)) {
    /*istanbul ignore start*/
    var _hunk$lines5;

    /*istanbul ignore end*/
    /*istanbul ignore start*/(_hunk$lines5 = /*istanbul ignore end*/hunk.lines).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_hunk$lines5 /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/myChanges));
    return;
  }

  conflict(hunk, myChanges, theirChanges);
}

function removal(hunk, mine, their, swap) {
  var myChanges = collectChange(mine),
      theirChanges = collectContext(their, myChanges);
  if (theirChanges.merged) {
    /*istanbul ignore start*/
    var _hunk$lines6;

    /*istanbul ignore end*/
    /*istanbul ignore start*/(_hunk$lines6 = /*istanbul ignore end*/hunk.lines).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_hunk$lines6 /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/theirChanges.merged));
  } else {
    conflict(hunk, swap ? theirChanges : myChanges, swap ? myChanges : theirChanges);
  }
}

function conflict(hunk, mine, their) {
  hunk.conflict = true;
  hunk.lines.push({
    conflict: true,
    mine: mine,
    theirs: their
  });
}

function insertLeading(hunk, insert, their) {
  while (insert.offset < their.offset && insert.index < insert.lines.length) {
    var line = insert.lines[insert.index++];
    hunk.lines.push(line);
    insert.offset++;
  }
}
function insertTrailing(hunk, insert) {
  while (insert.index < insert.lines.length) {
    var line = insert.lines[insert.index++];
    hunk.lines.push(line);
  }
}

function collectChange(state) {
  var ret = [],
      operation = state.lines[state.index][0];
  while (state.index < state.lines.length) {
    var line = state.lines[state.index];

    // Group additions that are immediately after subtractions and treat them as one "atomic" modify change.
    if (operation === '-' && line[0] === '+') {
      operation = '+';
    }

    if (operation === line[0]) {
      ret.push(line);
      state.index++;
    } else {
      break;
    }
  }

  return ret;
}
function collectContext(state, matchChanges) {
  var changes = [],
      merged = [],
      matchIndex = 0,
      contextChanges = false,
      conflicted = false;
  while (matchIndex < matchChanges.length && state.index < state.lines.length) {
    var change = state.lines[state.index],
        match = matchChanges[matchIndex];

    // Once we've hit our add, then we are done
    if (match[0] === '+') {
      break;
    }

    contextChanges = contextChanges || change[0] !== ' ';

    merged.push(match);
    matchIndex++;

    // Consume any additions in the other block as a conflict to attempt
    // to pull in the remaining context after this
    if (change[0] === '+') {
      conflicted = true;

      while (change[0] === '+') {
        changes.push(change);
        change = state.lines[++state.index];
      }
    }

    if (match.substr(1) === change.substr(1)) {
      changes.push(change);
      state.index++;
    } else {
      conflicted = true;
    }
  }

  if ((matchChanges[matchIndex] || '')[0] === '+' && contextChanges) {
    conflicted = true;
  }

  if (conflicted) {
    return changes;
  }

  while (matchIndex < matchChanges.length) {
    merged.push(matchChanges[matchIndex++]);
  }

  return {
    merged: merged,
    changes: changes
  };
}

function allRemoves(changes) {
  return changes.reduce(function (prev, change) {
    return prev && change[0] === '-';
  }, true);
}
function skipRemoveSuperset(state, removeChanges, delta) {
  for (var i = 0; i < delta; i++) {
    var changeContent = removeChanges[removeChanges.length - delta + i].substr(1);
    if (state.lines[state.index + i] !== ' ' + changeContent) {
      return false;
    }
  }

  state.index += delta;
  return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXRjaC9tZXJnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Z0NBS2dCO3lEQTBCQTs7QUEvQmhCOztBQUNBOztBQUVBOzs7Ozt1QkFFTyxTQUFTLGFBQVQsQ0FBdUIsSUFBdkIsRUFBNkI7QUFDbEMsTUFBSSxhQUFhLEtBQWIsQ0FEOEI7O0FBR2xDLE9BQUssUUFBTCxHQUFnQixDQUFoQixDQUhrQztBQUlsQyxPQUFLLFFBQUwsR0FBZ0IsQ0FBaEIsQ0FKa0M7O0FBTWxDLE9BQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsVUFBUyxJQUFULEVBQWU7QUFDaEMsUUFBSSxPQUFPLElBQVAsS0FBZ0IsUUFBaEIsRUFBMEI7QUFDNUIsbUJBQWEsSUFBYixDQUQ0QjtBQUU1QixhQUY0QjtLQUE5Qjs7QUFLQSxRQUFJLEtBQUssQ0FBTCxNQUFZLEdBQVosSUFBbUIsS0FBSyxDQUFMLE1BQVksR0FBWixFQUFpQjtBQUN0QyxXQUFLLFFBQUwsR0FEc0M7S0FBeEM7QUFHQSxRQUFJLEtBQUssQ0FBTCxNQUFZLEdBQVosSUFBbUIsS0FBSyxDQUFMLE1BQVksR0FBWixFQUFpQjtBQUN0QyxXQUFLLFFBQUwsR0FEc0M7S0FBeEM7R0FUaUIsQ0FBbkIsQ0FOa0M7O0FBb0JsQyxNQUFJLFVBQUosRUFBZ0I7QUFDZCxXQUFPLEtBQUssUUFBTCxDQURPO0FBRWQsV0FBTyxLQUFLLFFBQUwsQ0FGTztHQUFoQjtDQXBCSzs7QUEwQkEsU0FBUyxLQUFULENBQWUsSUFBZixFQUFxQixNQUFyQixFQUE2QixJQUE3QixFQUFtQztBQUN4QyxTQUFPLFVBQVUsSUFBVixFQUFnQixJQUFoQixDQUFQLENBRHdDO0FBRXhDLFdBQVMsVUFBVSxNQUFWLEVBQWtCLElBQWxCLENBQVQsQ0FGd0M7O0FBSXhDLE1BQUksTUFBTSxFQUFOOzs7OztBQUpvQyxNQVNwQyxLQUFLLEtBQUwsSUFBYyxPQUFPLEtBQVAsRUFBYztBQUM5QixRQUFJLEtBQUosR0FBWSxLQUFLLEtB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QUFjLENBQWQsQ0FBWixLQUFpQyxNQUFNLGFBQU4sRUFBcUI7QUFDeEQsYUFBTyxLQUFQLENBRHdEO0tBQTFEO0dBRkY7O0FBT0EsUUFBTSxLQUFOLElBQWUsS0FBZixDQVJ1RDtBQVN2RCxTQUFPLElBQVAsQ0FUdUQ7Q0FBekQiLCJmaWxlIjoibWVyZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3N0cnVjdHVyZWRQYXRjaH0gZnJvbSAnLi9jcmVhdGUnO1xuaW1wb3J0IHtwYXJzZVBhdGNofSBmcm9tICcuL3BhcnNlJztcblxuaW1wb3J0IHthcnJheUVxdWFsLCBhcnJheVN0YXJ0c1dpdGh9IGZyb20gJy4uL3V0aWwvYXJyYXknO1xuXG5leHBvcnQgZnVuY3Rpb24gY2FsY0xpbmVDb3VudChodW5rKSB7XG4gIGxldCBjb25mbGljdGVkID0gZmFsc2U7XG5cbiAgaHVuay5vbGRMaW5lcyA9IDA7XG4gIGh1bmsubmV3TGluZXMgPSAwO1xuXG4gIGh1bmsubGluZXMuZm9yRWFjaChmdW5jdGlvbihsaW5lKSB7XG4gICAgaWYgKHR5cGVvZiBsaW5lICE9PSAnc3RyaW5nJykge1xuICAgICAgY29uZmxpY3RlZCA9IHRydWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGxpbmVbMF0gPT09ICcrJyB8fCBsaW5lWzBdID09PSAnICcpIHtcbiAgICAgIGh1bmsubmV3TGluZXMrKztcbiAgICB9XG4gICAgaWYgKGxpbmVbMF0gPT09ICctJyB8fCBsaW5lWzBdID09PSAnICcpIHtcbiAgICAgIGh1bmsub2xkTGluZXMrKztcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChjb25mbGljdGVkKSB7XG4gICAgZGVsZXRlIGh1bmsub2xkTGluZXM7XG4gICAgZGVsZXRlIGh1bmsubmV3TGluZXM7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlKG1pbmUsIHRoZWlycywgYmFzZSkge1xuICBtaW5lID0gbG9hZFBhdGNoKG1pbmUsIGJhc2UpO1xuICB0aGVpcnMgPSBsb2FkUGF0Y2godGhlaXJzLCBiYXNlKTtcblxuICBsZXQgcmV0ID0ge307XG5cbiAgLy8gRm9yIGluZGV4IHdlIGp1c3QgbGV0IGl0IHBhc3MgdGhyb3VnaCBhcyBpdCBkb2Vzbid0IGhhdmUgYW55IG5lY2Vzc2FyeSBtZWFuaW5nLlxuICAvLyBMZWF2aW5nIHNhbml0eSBjaGVja3Mgb24gdGhpcyB0byB0aGUgQVBJIGNvbnN1bWVyIHRoYXQgbWF5IGtub3cgbW9yZSBhYm91dCB0aGVcbiAgLy8gbWVhbmluZyBpbiB0aGVpciBvd24gY29udGV4dC5cbiAgaWYgKG1pbmUuaW5kZXggfHwgdGhlaXJzLmluZGV4KSB7XG4gICAgcmV0LmluZGV4ID0gbWluZS5pbmRleCB8fCB0aGVpcnMuaW5kZXg7XG4gIH1cblxuICBpZiAobWluZS5uZXdGaWxlTmFtZSB8fCB0aGVpcnMubmV3RmlsZU5hbWUpIHtcbiAgICBpZiAoIWZpbGVOYW1lQ2hhbmdlZChtaW5lKSkge1xuICAgICAgLy8gTm8gaGVhZGVyIG9yIG5vIGNoYW5nZSBpbiBvdXJzLCB1c2UgdGhlaXJzIChhbmQgb3VycyBpZiB0aGVpcnMgZG9lcyBub3QgZXhpc3QpXG4gICAgICByZXQub2xkRmlsZU5hbWUgPSB0aGVpcnMub2xkRmlsZU5hbWUgfHwgbWluZS5vbGRGaWxlTmFtZTtcbiAgICAgIHJldC5uZXdGaWxlTmFtZSA9IHRoZWlycy5uZXdGaWxlTmFtZSB8fCBtaW5lLm5ld0ZpbGVOYW1lO1xuICAgICAgcmV0Lm9sZEhlYWRlciA9IHRoZWlycy5vbGRIZWFkZXIgfHwgbWluZS5vbGRIZWFkZXI7XG4gICAgICByZXQubmV3SGVhZGVyID0gdGhlaXJzLm5ld0hlYWRlciB8fCBtaW5lLm5ld0hlYWRlcjtcbiAgICB9IGVsc2UgaWYgKCFmaWxlTmFtZUNoYW5nZWQodGhlaXJzKSkge1xuICAgICAgLy8gTm8gaGVhZGVyIG9yIG5vIGNoYW5nZSBpbiB0aGVpcnMsIHVzZSBvdXJzXG4gICAgICByZXQub2xkRmlsZU5hbWUgPSBtaW5lLm9sZEZpbGVOYW1lO1xuICAgICAgcmV0Lm5ld0ZpbGVOYW1lID0gbWluZS5uZXdGaWxlTmFtZTtcbiAgICAgIHJldC5vbGRIZWFkZXIgPSBtaW5lLm9sZEhlYWRlcjtcbiAgICAgIHJldC5uZXdIZWFkZXIgPSBtaW5lLm5ld0hlYWRlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQm90aCBjaGFuZ2VkLi4uIGZpZ3VyZSBpdCBvdXRcbiAgICAgIHJldC5vbGRGaWxlTmFtZSA9IHNlbGVjdEZpZWxkKHJldCwgbWluZS5vbGRGaWxlTmFtZSwgdGhlaXJzLm9sZEZpbGVOYW1lKTtcbiAgICAgIHJldC5uZXdGaWxlTmFtZSA9IHNlbGVjdEZpZWxkKHJldCwgbWluZS5uZXdGaWxlTmFtZSwgdGhlaXJzLm5ld0ZpbGVOYW1lKTtcbiAgICAgIHJldC5vbGRIZWFkZXIgPSBzZWxlY3RGaWVsZChyZXQsIG1pbmUub2xkSGVhZGVyLCB0aGVpcnMub2xkSGVhZGVyKTtcbiAgICAgIHJldC5uZXdIZWFkZXIgPSBzZWxlY3RGaWVsZChyZXQsIG1pbmUubmV3SGVhZGVyLCB0aGVpcnMubmV3SGVhZGVyKTtcbiAgICB9XG4gIH1cblxuICByZXQuaHVua3MgPSBbXTtcblxuICBsZXQgbWluZUluZGV4ID0gMCxcbiAgICAgIHRoZWlyc0luZGV4ID0gMCxcbiAgICAgIG1pbmVPZmZzZXQgPSAwLFxuICAgICAgdGhlaXJzT2Zmc2V0ID0gMDtcblxuICB3aGlsZSAobWluZUluZGV4IDwgbWluZS5odW5rcy5sZW5ndGggfHwgdGhlaXJzSW5kZXggPCB0aGVpcnMuaHVua3MubGVuZ3RoKSB7XG4gICAgbGV0IG1pbmVDdXJyZW50ID0gbWluZS5odW5rc1ttaW5lSW5kZXhdIHx8IHtvbGRTdGFydDogSW5maW5pdHl9LFxuICAgICAgICB0aGVpcnNDdXJyZW50ID0gdGhlaXJzLmh1bmtzW3RoZWlyc0luZGV4XSB8fCB7b2xkU3RhcnQ6IEluZmluaXR5fTtcblxuICAgIGlmIChodW5rQmVmb3JlKG1pbmVDdXJyZW50LCB0aGVpcnNDdXJyZW50KSkge1xuICAgICAgLy8gVGhpcyBwYXRjaCBkb2VzIG5vdCBvdmVybGFwIHdpdGggYW55IG9mIHRoZSBvdGhlcnMsIHlheS5cbiAgICAgIHJldC5odW5rcy5wdXNoKGNsb25lSHVuayhtaW5lQ3VycmVudCwgbWluZU9mZnNldCkpO1xuICAgICAgbWluZUluZGV4Kys7XG4gICAgICB0aGVpcnNPZmZzZXQgKz0gbWluZUN1cnJlbnQubmV3TGluZXMgLSBtaW5lQ3VycmVudC5vbGRMaW5lcztcbiAgICB9IGVsc2UgaWYgKGh1bmtCZWZvcmUodGhlaXJzQ3VycmVudCwgbWluZUN1cnJlbnQpKSB7XG4gICAgICAvLyBUaGlzIHBhdGNoIGRvZXMgbm90IG92ZXJsYXAgd2l0aCBhbnkgb2YgdGhlIG90aGVycywgeWF5LlxuICAgICAgcmV0Lmh1bmtzLnB1c2goY2xvbmVIdW5rKHRoZWlyc0N1cnJlbnQsIHRoZWlyc09mZnNldCkpO1xuICAgICAgdGhlaXJzSW5kZXgrKztcbiAgICAgIG1pbmVPZmZzZXQgKz0gdGhlaXJzQ3VycmVudC5uZXdMaW5lcyAtIHRoZWlyc0N1cnJlbnQub2xkTGluZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE92ZXJsYXAsIG1lcmdlIGFzIGJlc3Qgd2UgY2FuXG4gICAgICBsZXQgbWVyZ2VkSHVuayA9IHtcbiAgICAgICAgb2xkU3RhcnQ6IE1hdGgubWluKG1pbmVDdXJyZW50Lm9sZFN0YXJ0LCB0aGVpcnNDdXJyZW50Lm9sZFN0YXJ0KSxcbiAgICAgICAgb2xkTGluZXM6IDAsXG4gICAgICAgIG5ld1N0YXJ0OiBNYXRoLm1pbihtaW5lQ3VycmVudC5uZXdTdGFydCArIG1pbmVPZmZzZXQsIHRoZWlyc0N1cnJlbnQub2xkU3RhcnQgKyB0aGVpcnNPZmZzZXQpLFxuICAgICAgICBuZXdMaW5lczogMCxcbiAgICAgICAgbGluZXM6IFtdXG4gICAgICB9O1xuICAgICAgbWVyZ2VMaW5lcyhtZXJnZWRIdW5rLCBtaW5lQ3VycmVudC5vbGRTdGFydCwgbWluZUN1cnJlbnQubGluZXMsIHRoZWlyc0N1cnJlbnQub2xkU3RhcnQsIHRoZWlyc0N1cnJlbnQubGluZXMpO1xuICAgICAgdGhlaXJzSW5kZXgrKztcbiAgICAgIG1pbmVJbmRleCsrO1xuXG4gICAgICByZXQuaHVua3MucHVzaChtZXJnZWRIdW5rKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBsb2FkUGF0Y2gocGFyYW0sIGJhc2UpIHtcbiAgaWYgKHR5cGVvZiBwYXJhbSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoL15AQC9tLnRlc3QocGFyYW0pIHx8ICgvXkluZGV4Oi9tLnRlc3QocGFyYW0pKSkge1xuICAgICAgcmV0dXJuIHBhcnNlUGF0Y2gocGFyYW0pWzBdO1xuICAgIH1cblxuICAgIGlmICghYmFzZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IHByb3ZpZGUgYSBiYXNlIHJlZmVyZW5jZSBvciBwYXNzIGluIGEgcGF0Y2gnKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0cnVjdHVyZWRQYXRjaCh1bmRlZmluZWQsIHVuZGVmaW5lZCwgYmFzZSwgcGFyYW0pO1xuICB9XG5cbiAgcmV0dXJuIHBhcmFtO1xufVxuXG5mdW5jdGlvbiBmaWxlTmFtZUNoYW5nZWQocGF0Y2gpIHtcbiAgcmV0dXJuIHBhdGNoLm5ld0ZpbGVOYW1lICYmIHBhdGNoLm5ld0ZpbGVOYW1lICE9PSBwYXRjaC5vbGRGaWxlTmFtZTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0RmllbGQoaW5kZXgsIG1pbmUsIHRoZWlycykge1xuICBpZiAobWluZSA9PT0gdGhlaXJzKSB7XG4gICAgcmV0dXJuIG1pbmU7XG4gIH0gZWxzZSB7XG4gICAgaW5kZXguY29uZmxpY3QgPSB0cnVlO1xuICAgIHJldHVybiB7bWluZSwgdGhlaXJzfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBodW5rQmVmb3JlKHRlc3QsIGNoZWNrKSB7XG4gIHJldHVybiB0ZXN0Lm9sZFN0YXJ0IDwgY2hlY2sub2xkU3RhcnRcbiAgICAmJiAodGVzdC5vbGRTdGFydCArIHRlc3Qub2xkTGluZXMpIDwgY2hlY2sub2xkU3RhcnQ7XG59XG5cbmZ1bmN0aW9uIGNsb25lSHVuayhodW5rLCBvZmZzZXQpIHtcbiAgcmV0dXJuIHtcbiAgICBvbGRTdGFydDogaHVuay5vbGRTdGFydCwgb2xkTGluZXM6IGh1bmsub2xkTGluZXMsXG4gICAgbmV3U3RhcnQ6IGh1bmsubmV3U3RhcnQgKyBvZmZzZXQsIG5ld0xpbmVzOiBodW5rLm5ld0xpbmVzLFxuICAgIGxpbmVzOiBodW5rLmxpbmVzXG4gIH07XG59XG5cbmZ1bmN0aW9uIG1lcmdlTGluZXMoaHVuaywgbWluZU9mZnNldCwgbWluZUxpbmVzLCB0aGVpck9mZnNldCwgdGhlaXJMaW5lcykge1xuICAvLyBUaGlzIHdpbGwgZ2VuZXJhbGx5IHJlc3VsdCBpbiBhIGNvbmZsaWN0ZWQgaHVuaywgYnV0IHRoZXJlIGFyZSBjYXNlcyB3aGVyZSB0aGUgY29udGV4dFxuICAvLyBpcyB0aGUgb25seSBvdmVybGFwIHdoZXJlIHdlIGNhbiBzdWNjZXNzZnVsbHkgbWVyZ2UgdGhlIGNvbnRlbnQgaGVyZS5cbiAgbGV0IG1pbmUgPSB7b2Zmc2V0OiBtaW5lT2Zmc2V0LCBsaW5lczogbWluZUxpbmVzLCBpbmRleDogMH0sXG4gICAgICB0aGVpciA9IHtvZmZzZXQ6IHRoZWlyT2Zmc2V0LCBsaW5lczogdGhlaXJMaW5lcywgaW5kZXg6IDB9O1xuXG4gIC8vIEhhbmRsZSBhbnkgbGVhZGluZyBjb250ZW50XG4gIGluc2VydExlYWRpbmcoaHVuaywgbWluZSwgdGhlaXIpO1xuICBpbnNlcnRMZWFkaW5nKGh1bmssIHRoZWlyLCBtaW5lKTtcblxuICAvLyBOb3cgaW4gdGhlIG92ZXJsYXAgY29udGVudC4gU2NhbiB0aHJvdWdoIGFuZCBzZWxlY3QgdGhlIGJlc3QgY2hhbmdlcyBmcm9tIGVhY2guXG4gIHdoaWxlIChtaW5lLmluZGV4IDwgbWluZS5saW5lcy5sZW5ndGggJiYgdGhlaXIuaW5kZXggPCB0aGVpci5saW5lcy5sZW5ndGgpIHtcbiAgICBsZXQgbWluZUN1cnJlbnQgPSBtaW5lLmxpbmVzW21pbmUuaW5kZXhdLFxuICAgICAgICB0aGVpckN1cnJlbnQgPSB0aGVpci5saW5lc1t0aGVpci5pbmRleF07XG5cbiAgICBpZiAoKG1pbmVDdXJyZW50WzBdID09PSAnLScgfHwgbWluZUN1cnJlbnRbMF0gPT09ICcrJylcbiAgICAgICAgJiYgKHRoZWlyQ3VycmVudFswXSA9PT0gJy0nIHx8IHRoZWlyQ3VycmVudFswXSA9PT0gJysnKSkge1xuICAgICAgLy8gQm90aCBtb2RpZmllZCAuLi5cbiAgICAgIG11dHVhbENoYW5nZShodW5rLCBtaW5lLCB0aGVpcik7XG4gICAgfSBlbHNlIGlmIChtaW5lQ3VycmVudFswXSA9PT0gJysnICYmIHRoZWlyQ3VycmVudFswXSA9PT0gJyAnKSB7XG4gICAgICAvLyBNaW5lIGluc2VydGVkXG4gICAgICBodW5rLmxpbmVzLnB1c2goLi4uIGNvbGxlY3RDaGFuZ2UobWluZSkpO1xuICAgIH0gZWxzZSBpZiAodGhlaXJDdXJyZW50WzBdID09PSAnKycgJiYgbWluZUN1cnJlbnRbMF0gPT09ICcgJykge1xuICAgICAgLy8gVGhlaXJzIGluc2VydGVkXG4gICAgICBodW5rLmxpbmVzLnB1c2goLi4uIGNvbGxlY3RDaGFuZ2UodGhlaXIpKTtcbiAgICB9IGVsc2UgaWYgKG1pbmVDdXJyZW50WzBdID09PSAnLScgJiYgdGhlaXJDdXJyZW50WzBdID09PSAnICcpIHtcbiAgICAgIC8vIE1pbmUgcmVtb3ZlZCBvciBlZGl0ZWRcbiAgICAgIHJlbW92YWwoaHVuaywgbWluZSwgdGhlaXIpO1xuICAgIH0gZWxzZSBpZiAodGhlaXJDdXJyZW50WzBdID09PSAnLScgJiYgbWluZUN1cnJlbnRbMF0gPT09ICcgJykge1xuICAgICAgLy8gVGhlaXIgcmVtb3ZlZCBvciBlZGl0ZWRcbiAgICAgIHJlbW92YWwoaHVuaywgdGhlaXIsIG1pbmUsIHRydWUpO1xuICAgIH0gZWxzZSBpZiAobWluZUN1cnJlbnQgPT09IHRoZWlyQ3VycmVudCkge1xuICAgICAgLy8gQ29udGV4dCBpZGVudGl0eVxuICAgICAgaHVuay5saW5lcy5wdXNoKG1pbmVDdXJyZW50KTtcbiAgICAgIG1pbmUuaW5kZXgrKztcbiAgICAgIHRoZWlyLmluZGV4Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENvbnRleHQgbWlzbWF0Y2hcbiAgICAgIGNvbmZsaWN0KGh1bmssIGNvbGxlY3RDaGFuZ2UobWluZSksIGNvbGxlY3RDaGFuZ2UodGhlaXIpKTtcbiAgICB9XG4gIH1cblxuICAvLyBOb3cgcHVzaCBhbnl0aGluZyB0aGF0IG1heSBiZSByZW1haW5pbmdcbiAgaW5zZXJ0VHJhaWxpbmcoaHVuaywgbWluZSk7XG4gIGluc2VydFRyYWlsaW5nKGh1bmssIHRoZWlyKTtcblxuICBjYWxjTGluZUNvdW50KGh1bmspO1xufVxuXG5mdW5jdGlvbiBtdXR1YWxDaGFuZ2UoaHVuaywgbWluZSwgdGhlaXIpIHtcbiAgbGV0IG15Q2hhbmdlcyA9IGNvbGxlY3RDaGFuZ2UobWluZSksXG4gICAgICB0aGVpckNoYW5nZXMgPSBjb2xsZWN0Q2hhbmdlKHRoZWlyKTtcblxuICBpZiAoYWxsUmVtb3ZlcyhteUNoYW5nZXMpICYmIGFsbFJlbW92ZXModGhlaXJDaGFuZ2VzKSkge1xuICAgIC8vIFNwZWNpYWwgY2FzZSBmb3IgcmVtb3ZlIGNoYW5nZXMgdGhhdCBhcmUgc3VwZXJzZXRzIG9mIG9uZSBhbm90aGVyXG4gICAgaWYgKGFycmF5U3RhcnRzV2l0aChteUNoYW5nZXMsIHRoZWlyQ2hhbmdlcylcbiAgICAgICAgJiYgc2tpcFJlbW92ZVN1cGVyc2V0KHRoZWlyLCBteUNoYW5nZXMsIG15Q2hhbmdlcy5sZW5ndGggLSB0aGVpckNoYW5nZXMubGVuZ3RoKSkge1xuICAgICAgaHVuay5saW5lcy5wdXNoKC4uLiBteUNoYW5nZXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoYXJyYXlTdGFydHNXaXRoKHRoZWlyQ2hhbmdlcywgbXlDaGFuZ2VzKVxuICAgICAgICAmJiBza2lwUmVtb3ZlU3VwZXJzZXQobWluZSwgdGhlaXJDaGFuZ2VzLCB0aGVpckNoYW5nZXMubGVuZ3RoIC0gbXlDaGFuZ2VzLmxlbmd0aCkpIHtcbiAgICAgIGh1bmsubGluZXMucHVzaCguLi4gdGhlaXJDaGFuZ2VzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH0gZWxzZSBpZiAoYXJyYXlFcXVhbChteUNoYW5nZXMsIHRoZWlyQ2hhbmdlcykpIHtcbiAgICBodW5rLmxpbmVzLnB1c2goLi4uIG15Q2hhbmdlcyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uZmxpY3QoaHVuaywgbXlDaGFuZ2VzLCB0aGVpckNoYW5nZXMpO1xufVxuXG5mdW5jdGlvbiByZW1vdmFsKGh1bmssIG1pbmUsIHRoZWlyLCBzd2FwKSB7XG4gIGxldCBteUNoYW5nZXMgPSBjb2xsZWN0Q2hhbmdlKG1pbmUpLFxuICAgICAgdGhlaXJDaGFuZ2VzID0gY29sbGVjdENvbnRleHQodGhlaXIsIG15Q2hhbmdlcyk7XG4gIGlmICh0aGVpckNoYW5nZXMubWVyZ2VkKSB7XG4gICAgaHVuay5saW5lcy5wdXNoKC4uLiB0aGVpckNoYW5nZXMubWVyZ2VkKTtcbiAgfSBlbHNlIHtcbiAgICBjb25mbGljdChodW5rLCBzd2FwID8gdGhlaXJDaGFuZ2VzIDogbXlDaGFuZ2VzLCBzd2FwID8gbXlDaGFuZ2VzIDogdGhlaXJDaGFuZ2VzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb25mbGljdChodW5rLCBtaW5lLCB0aGVpcikge1xuICBodW5rLmNvbmZsaWN0ID0gdHJ1ZTtcbiAgaHVuay5saW5lcy5wdXNoKHtcbiAgICBjb25mbGljdDogdHJ1ZSxcbiAgICBtaW5lOiBtaW5lLFxuICAgIHRoZWlyczogdGhlaXJcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGluc2VydExlYWRpbmcoaHVuaywgaW5zZXJ0LCB0aGVpcikge1xuICB3aGlsZSAoaW5zZXJ0Lm9mZnNldCA8IHRoZWlyLm9mZnNldCAmJiBpbnNlcnQuaW5kZXggPCBpbnNlcnQubGluZXMubGVuZ3RoKSB7XG4gICAgbGV0IGxpbmUgPSBpbnNlcnQubGluZXNbaW5zZXJ0LmluZGV4KytdO1xuICAgIGh1bmsubGluZXMucHVzaChsaW5lKTtcbiAgICBpbnNlcnQub2Zmc2V0Kys7XG4gIH1cbn1cbmZ1bmN0aW9uIGluc2VydFRyYWlsaW5nKGh1bmssIGluc2VydCkge1xuICB3aGlsZSAoaW5zZXJ0LmluZGV4IDwgaW5zZXJ0LmxpbmVzLmxlbmd0aCkge1xuICAgIGxldCBsaW5lID0gaW5zZXJ0LmxpbmVzW2luc2VydC5pbmRleCsrXTtcbiAgICBodW5rLmxpbmVzLnB1c2gobGluZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29sbGVjdENoYW5nZShzdGF0ZSkge1xuICBsZXQgcmV0ID0gW10sXG4gICAgICBvcGVyYXRpb24gPSBzdGF0ZS5saW5lc1tzdGF0ZS5pbmRleF1bMF07XG4gIHdoaWxlIChzdGF0ZS5pbmRleCA8IHN0YXRlLmxpbmVzLmxlbmd0aCkge1xuICAgIGxldCBsaW5lID0gc3RhdGUubGluZXNbc3RhdGUuaW5kZXhdO1xuXG4gICAgLy8gR3JvdXAgYWRkaXRpb25zIHRoYXQgYXJlIGltbWVkaWF0ZWx5IGFmdGVyIHN1YnRyYWN0aW9ucyBhbmQgdHJlYXQgdGhlbSBhcyBvbmUgXCJhdG9taWNcIiBtb2RpZnkgY2hhbmdlLlxuICAgIGlmIChvcGVyYXRpb24gPT09ICctJyAmJiBsaW5lWzBdID09PSAnKycpIHtcbiAgICAgIG9wZXJhdGlvbiA9ICcrJztcbiAgICB9XG5cbiAgICBpZiAob3BlcmF0aW9uID09PSBsaW5lWzBdKSB7XG4gICAgICByZXQucHVzaChsaW5lKTtcbiAgICAgIHN0YXRlLmluZGV4Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5mdW5jdGlvbiBjb2xsZWN0Q29udGV4dChzdGF0ZSwgbWF0Y2hDaGFuZ2VzKSB7XG4gIGxldCBjaGFuZ2VzID0gW10sXG4gICAgICBtZXJnZWQgPSBbXSxcbiAgICAgIG1hdGNoSW5kZXggPSAwLFxuICAgICAgY29udGV4dENoYW5nZXMgPSBmYWxzZSxcbiAgICAgIGNvbmZsaWN0ZWQgPSBmYWxzZTtcbiAgd2hpbGUgKG1hdGNoSW5kZXggPCBtYXRjaENoYW5nZXMubGVuZ3RoXG4gICAgICAgICYmIHN0YXRlLmluZGV4IDwgc3RhdGUubGluZXMubGVuZ3RoKSB7XG4gICAgbGV0IGNoYW5nZSA9IHN0YXRlLmxpbmVzW3N0YXRlLmluZGV4XSxcbiAgICAgICAgbWF0Y2ggPSBtYXRjaENoYW5nZXNbbWF0Y2hJbmRleF07XG5cbiAgICAvLyBPbmNlIHdlJ3ZlIGhpdCBvdXIgYWRkLCB0aGVuIHdlIGFyZSBkb25lXG4gICAgaWYgKG1hdGNoWzBdID09PSAnKycpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnRleHRDaGFuZ2VzID0gY29udGV4dENoYW5nZXMgfHwgY2hhbmdlWzBdICE9PSAnICc7XG5cbiAgICBtZXJnZWQucHVzaChtYXRjaCk7XG4gICAgbWF0Y2hJbmRleCsrO1xuXG4gICAgLy8gQ29uc3VtZSBhbnkgYWRkaXRpb25zIGluIHRoZSBvdGhlciBibG9jayBhcyBhIGNvbmZsaWN0IHRvIGF0dGVtcHRcbiAgICAvLyB0byBwdWxsIGluIHRoZSByZW1haW5pbmcgY29udGV4dCBhZnRlciB0aGlzXG4gICAgaWYgKGNoYW5nZVswXSA9PT0gJysnKSB7XG4gICAgICBjb25mbGljdGVkID0gdHJ1ZTtcblxuICAgICAgd2hpbGUgKGNoYW5nZVswXSA9PT0gJysnKSB7XG4gICAgICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xuICAgICAgICBjaGFuZ2UgPSBzdGF0ZS5saW5lc1srK3N0YXRlLmluZGV4XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWF0Y2guc3Vic3RyKDEpID09PSBjaGFuZ2Uuc3Vic3RyKDEpKSB7XG4gICAgICBjaGFuZ2VzLnB1c2goY2hhbmdlKTtcbiAgICAgIHN0YXRlLmluZGV4Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbmZsaWN0ZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmICgobWF0Y2hDaGFuZ2VzW21hdGNoSW5kZXhdIHx8ICcnKVswXSA9PT0gJysnXG4gICAgICAmJiBjb250ZXh0Q2hhbmdlcykge1xuICAgIGNvbmZsaWN0ZWQgPSB0cnVlO1xuICB9XG5cbiAgaWYgKGNvbmZsaWN0ZWQpIHtcbiAgICByZXR1cm4gY2hhbmdlcztcbiAgfVxuXG4gIHdoaWxlIChtYXRjaEluZGV4IDwgbWF0Y2hDaGFuZ2VzLmxlbmd0aCkge1xuICAgIG1lcmdlZC5wdXNoKG1hdGNoQ2hhbmdlc1ttYXRjaEluZGV4KytdKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbWVyZ2VkLFxuICAgIGNoYW5nZXNcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWxsUmVtb3ZlcyhjaGFuZ2VzKSB7XG4gIHJldHVybiBjaGFuZ2VzLnJlZHVjZShmdW5jdGlvbihwcmV2LCBjaGFuZ2UpIHtcbiAgICByZXR1cm4gcHJldiAmJiBjaGFuZ2VbMF0gPT09ICctJztcbiAgfSwgdHJ1ZSk7XG59XG5mdW5jdGlvbiBza2lwUmVtb3ZlU3VwZXJzZXQoc3RhdGUsIHJlbW92ZUNoYW5nZXMsIGRlbHRhKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGVsdGE7IGkrKykge1xuICAgIGxldCBjaGFuZ2VDb250ZW50ID0gcmVtb3ZlQ2hhbmdlc1tyZW1vdmVDaGFuZ2VzLmxlbmd0aCAtIGRlbHRhICsgaV0uc3Vic3RyKDEpO1xuICAgIGlmIChzdGF0ZS5saW5lc1tzdGF0ZS5pbmRleCArIGldICE9PSAnICcgKyBjaGFuZ2VDb250ZW50KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgc3RhdGUuaW5kZXggKz0gZGVsdGE7XG4gIHJldHVybiB0cnVlO1xufVxuIl19
