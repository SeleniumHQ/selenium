// Constructor
var AnsiParser = module.exports = {};

/**
 * parse
 * Parses the string containing ANSI styles.
 *
 * @name parse
 * @function
 * @param {String} input The input string.
 * @return {Array} An array of object like below:
 *
 *
 *    ```js
 *    [
 *      {
 *          style: "\u00\u001b[1m\u001b[38;5;231",
 *          content: "H"
 *      },
 *      {
 *         style: "\u00\u001b[1m\u001b[38;5;231",
 *         content: "e"
 *      },
 *      ...
 *    ]
 *    ```
 */
AnsiParser.parse = function (input) {

    var i = 0;
    if (Array.isArray(input)) {
        var arr = [];
        for (i = 0; i < input.length; ++i) {
            arr.push(AnsiParser.parse(input[i]));
        }
        return arr;
    }

    if (typeof input !== "string") {
        throw new Error("Input is not a string.");
    }

    var noAnsi = AnsiParser.removeAnsi(input);
    if (input === noAnsi) {
        return input.split("").map(function (c) {
            return {
                style: ""
              , content: c
            };
        });
    }

    var result = []
      , sIndex = 0
      , cmatch
      , color = []
      ;

    i = 0;
    while (sIndex < input.length) {
        cmatch = input.substr(sIndex).match(/^(\u001B\[[^m]*m)/);
        if (cmatch) {
            if (cmatch[0] == '\x1B[0m') {
                color = [];
            } else {
                if (/^\u001b\[38;5/.test(cmatch[0]) && /^\u001b\[38;5/.test(color.slice(-1)[0])) {
                    color.splice(-1);
                }
                color.push(cmatch[0]);
            }
            sIndex += cmatch[0].length;
        } else {
            result.push({
                style: color.join("")
              , content: noAnsi[i++]
            });
            ++sIndex;
        }
    }

    return result;
};

/**
 * getAtIndex
 * Returns the content and ANSI style at known index.
 *
 * @name getAtIndex
 * @function
 * @param {String} input The input string.
 * @param {String} noAnsi The input string without containing ansi styles.
 * @param {Number} index The character index.
 * @return {Object} An object containing the following fields:
 *
 *  - `style` (String): The ANSI style at provided index.
 *  - `content` (String): The content (character) at provided index.
 */
AnsiParser.getAtIndex = function (input, noAnsi, index) {

    if (typeof noAnsi === "number") {
        index = noAnsi;
        noAnsi = AnsiParser.removeAnsi(input);
    }

    if (input === noAnsi) {
        return {
            style: ""
          , content: noAnsi[index]
        };
    }

    var sIndex = 0
      , eIndex = index
      , color=[]
      , cmatch
      ;

    while (sIndex < input.length) {
        cmatch = input.substr(sIndex).match(/^(\u001B\[[^m]*m)/);
        if (cmatch) {
            if (cmatch[0] == '\x1B[0m') {
                color = [];
            } else {
                if (/^\u001b\[38;5/.test(cmatch[0]) && /^\u001b\[38;5/.test(color.slice(-1)[0])) {
                    color.splice(-1);
                }
                color.push(cmatch[0]);
            }
            sIndex += cmatch[0].length;
        } else {
            if (!eIndex) {
                break;
            }
            ++sIndex;
            --eIndex;
        }
    }

    return {
        style: color.join("")
      , content: noAnsi[index]
    };
};

/**
 * removeAnsi
 * Removes ANSI styles from the input string.
 *
 * @name removeAnsi
 * @function
 * @param {String} input The input string.
 * @return {String} The string without ANSI styles.
 */
AnsiParser.removeAnsi = function (input) {
    return input.replace(/\u001b\[.*?m/g, "");
};

/**
 * stringify
 * Stringifies an array of objects in the format defined by `AnsiParser`.
 *
 * @name stringify
 * @function
 * @param {Array} arr The input array.
 * @return {String} The stringified input array.
 */
AnsiParser.stringify = function (arr) {

    var str = ""
      , cArr = null
      , i = 0
      ;

    if (arr && Array.isArray(arr[0])) {
        for (; i < arr.length; ++i) {
            str += AnsiParser.stringify(arr[i]) + "\n";
        }
        str = str.replace(/\n$/, "");
        return str;
    }

    var lastStyle = ""
      , cStyle = ""
      , uStyle = ""
      ;

    for (; i < arr.length; ++i) {
        cArr = arr[i];
        if (cArr === undefined) {
            cArr = arr[i] = { style: "", content: " " };
        }

        cStyle = cArr.style;
        if (cStyle === lastStyle) {
            uStyle = "";
        } else {
            if (cStyle === "") {
                uStyle = "\u001b[0m";
                lastStyle = "";
            } else {
                uStyle = cStyle;
                lastStyle = cStyle;
            }
        }

        str += uStyle + cArr.content;
        if (cArr.content === "\n") {
            str += "\u001b[0m";
        }
    }

    if (!/\u001b\[0m$/.test(str)) {
        str += "\u001b[0m";
    }

    return str;
};

/**
 * addChar
 * Adds a new char into array.
 *
 * @name addChar
 * @function
 * @param {Array} arr The input array.
 * @param {String} c The char to add.
 * @param {String} s ANSI start style.
 * @param {String} e ANSI end style.
 */
AnsiParser.addChar = function (arr, c, s, e) {
    arr.push({
        start: s || ""
      , content: c
      , start: e || ""
    });
};
