/**
 *  converts a ASCII number into equivalant ASCII char
 * @param {number} a 
 * @returns ASCII char
 */
var char = function (a){
    return String.fromCharCode(a);
}

/**
 * return key of an object
 * @param {*} obj 
 * @param {number} i 
 */
/* function getKey(obj,i){
    return obj[Object.keys(obj)[i]];
}
 */

/* function indexOf(arr,searchedID) {
    var arrayLen = arr.length;
    var c = 0;
    while (c < arrayLen) {
        if (arr[c] === searchedID) return c;
        c++;
    }
    return -1;
} */
exports.char = char;
//exports.indexOf = indexOf;