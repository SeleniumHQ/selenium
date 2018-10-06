// Dependencies
var OS = require("os")
  , AnsiParser = require("ansi-parser")
  , Ul = require("ul")
  ;

/**
 * CliBox
 * Creates a new ASCII box.
 *
 * @name CliBox
 * @function
 * @param {Object|String} options A string representing the size: `WIDTHxHEIGHT`
 * (e.g. `10x20`) or an object:
 *
 *  - `width` or `w` (Number): The box width.
 *  - `height` or `h` (Number): The box height.
 *  - `fullscreen` (Boolean): If `true`, the box will have full size
 *    (default: `false`).
 *  - `stringify` (Boolean): If `false` the box will not be stringified (the
 *    `CliBox` object will be returned instead).
 *  - `marks` (Object): An object containing mark characters. Default:
 *     - `nw`: `"+"`
 *     - `n`: `"-"`
 *     - `ne`: `"+"`
 *     - `e`: `"|"`
 *     - `se`: `"+"`
 *     - `s`: `"-"`
 *     - `sw`: `"+"`
 *     - `w`: `"|"`
 *     - `b`: `" "`
 *
 * @param {Object|String} text A string to be displayed or an object:
 *
 *  - `text` (String): The text to be displayed.
 *  - `stretch` (Boolean): Stretch box to fix text (default: `false`).
 *  - `autoEOL` (Boolean): Break lines automatically (default: `false`).
 *  - `hAlign` (String): Horizontal alignement (default: `"middle"`). It can
 *    take one of the values: `"left"`, `"middle"`, `"right"`.
 *  - `vAlign` (String): Vertical alignement (default: `"center"`). It can take
 *    one of the values: `"top"`, `"center"`, `"bottom"`.
 *
 * @return {Object|Stringify} The `CliBox` object (if `options.stringify` is `false`)
 * or the stringified box.
 */
function CliBox(options, text) {

    // Parse the options
    var self = {}
      , w = options.width || options.w
      , h = options.height || options.h
      , fullscreen = options.fullscreen || false
      , defaults = CliBox.defaults
      , lines = []
      , line = ""
      , splits = null
      , noAnsiText = ""
      , textOffsetY
      , i
      ;

    if (fullscreen) {
        // 3 = 1 (top border) + 1 (bottom border) + 1 (bottom padding)
        h = process.stdout.rows - 3;
        w = process.stdout.columns;
        // Compensate for Windows bug, see node-cli-update/issue #4
        if (/^win(32|64)$/.test(OS.platform())) {
          w -= 1;
        }
    } else {
        // Handle "x" in options parameter
        if (typeof options === "string" && options.split("x").length === 2) {
            splits = options.split("x");
            w = parseInt(splits[0]);
            h = parseInt(splits[1]);

            options = {
                marks: {}
            };
        }
    }

    // Handle text parameter
    if (text) {
        noAnsiText = AnsiParser.removeAnsi(text.text || text);

        var alignTextVertically = function (splits, mode) {
            if (splits.length > h && !mode) mode = "top";
            mode = (["top", "bottom"].indexOf(mode) > -1) ? mode : "middle";

            if (mode == "middle") {
                return Math.floor((h / 2) - (splits.length / 2));
            } else if (mode == "top") {
                return 0;
            } else if (mode == "bottom") {
                return h - splits.length;
            }
        };

        var alignLineHorizontally = function (line, mode) {
            mode = (["left", "right"].indexOf(mode) > -1) ? mode : "center";

            if (mode == "center") {
                line.offset.x = parseInt(
                    ((w - 2) / 2) - (line.text.length / 2)
                );
            } else if (mode == "left") {
                line.offset.x = 0;
            } else if (mode == "right") {
                line.offset.x = (w - 2) - line.text.length;
            }

            if (line.offset.x < 0) line.offset.x = 0;

            // Handle overflowing text
            if(AnsiParser.removeAnsi(line.text).length > (w - 2)) {
                line.text = line.text.substr(0, w - 5) + "...";
            }

            return line;
        };

        var escapeLine = function (line) {
            var length = line.text.length
              , results = []
              , lineText = line.text
              , index
              ;

            while ((index = lineText.indexOf("\u001b")) > -1) {
                results.push({
                    index: index
                  , code: lineText.substr(
                        index
                      , lineText.indexOf("m", index) - index + 1
                    )
                });
                lineText = lineText.replace(/\u001b\[.*?m/, "");
                line.text = lineText;
            }

            line.escapeCodes = results;
            return;
        };

        // Divide text into lines and calculate position
        if (typeof text === "string") {

            splits = text.split("\n").map(function (val) {
                return val.trim();
            });

            textOffsetY = alignTextVertically(splits);

            for (i = 0; i < splits.length; ++i) {
                line = {
                    text: splits[i]
                  , offset: {
                        y: textOffsetY + i
                    }
                };
                escapeLine(line);
                line = alignLineHorizontally(line);
                lines.push(line);
            }

        } else if (typeof text === "object") {

            var stretch = text.stretch || false
              , autoEOL = text.autoEOL || false
              , hAlign = text.hAlign || undefined
              , vAlign = text.vAlign || undefined
              ;

            splits = text.text.split("\n").map(function (val) {
                return val.trim();
            });

            // Stretch box to fit text (or console)
            if (stretch) {

                var longest = AnsiParser.removeAnsi(splits.reduce(function (prev, curr) {
                    return (
                        AnsiParser.removeAnsi(prev).length > AnsiParser.removeAnsi(curr).length
                    ) ? prev : curr;
                })).length;

                if (longest > (w - 2)) {
                    if ((longest - 2) > process.stdout.columns) {
                        w = process.stdout.columns;
                    } else {
                        w = longest + 2;
                    }
                }
                h = (splits.length > h) ? splits.length : h;
            }

            // Break lines automatically
            if (autoEOL) {
                for(i = 0; i < splits.length; ++i) {
                    var escaped = AnsiParser.removeAnsi(splits[i]);
                    // If too long to fit
                    if(escaped.length > (w - 2)) {
                        // Find a place to break line
                        var actualPlace = 0
                          , outsideCode = true
                          , escapedIndex = 0
                          , ii
                          ;

                        // Find possible places for line breaks in pure text
                        ii = escaped.lastIndexOf(" ", w - 2);
                        ii = (ii == -1) ? escaped.indexOf(" ", w - 2) : ii;
                        // Find actual index of line break
                        while(escapedIndex != ii && actualPlace < splits[i].length) {
                            // Omit colour codes
                            if(splits[i][actualPlace] == "\u001b") {
                                while(splits[i][actualPlace] != "m")
                                    actualPlace++;
                            }
                            if(splits[i][actualPlace] == escaped[escapedIndex] && outsideCode) {
                                escapedIndex++;
                            }
                            actualPlace++;
                        }

                        // Divide line
                        if(ii > 0 && ii < splits[i].length) {
                            var div1 = splits[i].substr(0, actualPlace)
                              , div2 = splits[i].slice(actualPlace).trim()
                              ;
                            // Trim whitespace after escape code
                            if(div2[0] == "\u001b") {
                                div2 = div2.substr(0, div2.indexOf(" ")) + div2.slice(div2.indexOf(" ")+1);
                            }
                            splits.splice(i, 1, div1, div2);
                        }
                    }
                }
            }

            // Recalculate line number if necessary
            if (stretch) h = (splits.length > h) ? splits.length : h;

            // Get vertical text offset
            textOffsetY = alignTextVertically(splits, vAlign);

            // Push lines
            for (i = 0; i < splits.length; ++i) {
                line = {
                    text: splits[i]
                  , offset: {
                        y: textOffsetY + i
                    }
                };
                escapeLine(line);
                line = alignLineHorizontally(line, hAlign);
                lines.push(line);
            }
        }
    }

    // Create settings
    var settings = {
        width: w
      , height: h
      , marks: Ul.merge(options.marks, defaults.marks)
      , lines: lines
    };

    // left top corner
    self.settings = settings;

    /**
     * stringify
     * Returns the stringified box.
     *
     * @name stringify
     * @function
     * @return {String} Stringified box string.
     */
    self.stringify = function () {
        var box = "";

        // Top
        box += this.settings.marks.nw;
        for (i = 0; i < this.settings.width - 2; ++i) {
            box += this.settings.marks.n;
        }

        // Right
        box += this.settings.marks.ne;

        // The other lines
        var nextLine = this.settings.lines.length ? this.settings.lines.shift() : undefined
          , lastCode = ""
          ;

        for (i = 0; i < this.settings.height; ++i) {

            // Get next line to display if one exists
            while (nextLine && i > nextLine.offset.y && this.settings.lines.length) {
                nextLine = this.settings.lines.shift();
            }

            box += OS.EOL + this.settings.marks.w + lastCode;


            for (var ii = 0; ii < this.settings.width - 2; ++ii) {

                // there is something to display
                if (nextLine
                    // it's the correct line
                    && i == nextLine.offset.y
                    // it's after the x offset
                    && ii >= nextLine.offset.x
                    // the text hasn't ended yet
                    && ii < (nextLine.offset.x + nextLine.text.length)) {

                    // Display escape codes
                    while (nextLine.escapeCodes.length && (ii - nextLine.offset.x) == nextLine.escapeCodes[0].index) {
                        lastCode = nextLine.escapeCodes.shift().code;
                        box += lastCode;
                    }

                    box += nextLine.text[ii - nextLine.offset.x];

                } else {
                    box += this.settings.marks.b;
                }
            }

            // Display remaining codes
            while (nextLine && nextLine.escapeCodes.length && (i == nextLine.offset.y)) {
                lastCode = nextLine.escapeCodes.shift().code;
                box += lastCode;
            }
            box += "\u001b[0m" + this.settings.marks.e;
        }

        // Bottom
        box += OS.EOL + this.settings.marks.sw;
        for (i = 0; i < this.settings.width - 2; ++i) {
            box += this.settings.marks.s;
        }
        box += this.settings.marks.se;

        return box;
    };

    if (options.stringify !== false) {
        return self.stringify();
    }

    return self;
}

// Default settings
CliBox.defaults = {
    marks: {
        nw: "+"
      , n:  "-"
      , ne: "+"
      , e:  "|"
      , se: "+"
      , s:  "-"
      , sw: "+"
      , w:  "|"
      , b: " "
    }
};

module.exports = CliBox;
