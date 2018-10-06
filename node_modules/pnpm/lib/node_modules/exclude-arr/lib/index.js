"use strict";

/**
 * excludeArr
 * Exclude elements from the input array.
 *
 * @name excludeArr
 * @function
 * @param {Array} arr Param descrpition.
 * @param {Number|String|Etc} elm The element to remove.
 * @param {Boolean} first If `true`, only the first element will be removed (even there are multiple ones).
 * @return {Array} The input array. Note this is **not** a copy of the input array.
 */

module.exports = function excludeArr(arr, elm, first) {
    var index = -1;
    while ((index = arr.indexOf(elm)) !== -1) {
        arr.splice(index, 1);
        if (first) {
            break;
        }
    }
    return arr;
};