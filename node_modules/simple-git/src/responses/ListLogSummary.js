
module.exports = ListLogSummary;

/**
 * The ListLogSummary is returned as a response to getting `git().log()` or `git().stashList()`
 *
 * @constructor
 */
function ListLogSummary (all) {
   this.all = all;
   this.latest = all.length && all[0] || null;
   this.total = all.length;
}

/**
 * Detail for each of the log lines
 * @type {ListLogLine[]}
 */
ListLogSummary.prototype.all = null;

/**
 * Most recent entry in the log
 * @type {ListLogLine}
 */
ListLogSummary.prototype.latest = null;

/**
 * Number of items in the log
 * @type {number}
 */
ListLogSummary.prototype.total = 0;

function ListLogLine (line, fields) {
   for (var k = 0; k < fields.length; k++) {
      this[fields[k]] = line[k];
   }
}

ListLogSummary.COMMIT_BOUNDARY = '------------------------ >8 ------------------------';

ListLogSummary.parse = function (text, splitter, fields) {
   fields = fields || ['hash', 'date', 'message', 'author_name', 'author_email'];
   return new ListLogSummary(
      text
         .trim()
         .split(ListLogSummary.COMMIT_BOUNDARY + '\n')
         .map(function (item) {
            return item.replace(ListLogSummary.COMMIT_BOUNDARY, '')
         })
         .filter(Boolean)
         .map(function (item) {
            return new ListLogLine(item.trim().split(splitter), fields);
         })
   );
};
