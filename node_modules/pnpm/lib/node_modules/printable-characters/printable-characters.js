"use strict";

const ansiEscapeCode                   = '[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-PRZcf-nqry=><]'
    , zeroWidthCharacterExceptNewline  = '\u0000-\u0008\u000B-\u0019\u001b\u009b\u00ad\u200b\u2028\u2029\ufeff\ufe00-\ufe0f'
    , zeroWidthCharacter               = '\n' + zeroWidthCharacterExceptNewline
    , zeroWidthCharactersExceptNewline = new RegExp ('(?:' + ansiEscapeCode + ')|[' + zeroWidthCharacterExceptNewline + ']', 'g')
    , zeroWidthCharacters              = new RegExp ('(?:' + ansiEscapeCode + ')|[' + zeroWidthCharacter + ']', 'g')
    , partition                        = new RegExp ('((?:' + ansiEscapeCode + ')|[\t' + zeroWidthCharacter + '])?([^\t' + zeroWidthCharacter + ']*)', 'g')

module.exports = {

    zeroWidthCharacters,

    ansiEscapeCodes: new RegExp (ansiEscapeCode, 'g'),

    strlen: s => Array.from (s.replace (zeroWidthCharacters, '')).length, // Array.from solves the emoji problem as described here: http://blog.jonnew.com/posts/poo-dot-length-equals-two

    isBlank: s => s.replace (zeroWidthCharacters, '')
                   .replace (/\s/g, '')
                   .length === 0,

    blank: s => Array.from (s.replace (zeroWidthCharactersExceptNewline, '')) // Array.from solves the emoji problem as described here: http://blog.jonnew.com/posts/poo-dot-length-equals-two
                     .map (x => ((x === '\t') || (x === '\n')) ? x : ' ')
                     .join (''),

    partition (s) {
        for (var m, spans = []; (partition.lastIndex !== s.length) && (m = partition.exec (s));) { spans.push ([m[1] || '', m[2]]) }
        partition.lastIndex = 0 // reset
        return spans
    },

    first (s, n) {

        let result = '', length = 0

        for (const [nonPrintable, printable] of module.exports.partition (s)) {
            const text = Array.from (printable).slice (0, n - length) // Array.from solves the emoji problem as described here: http://blog.jonnew.com/posts/poo-dot-length-equals-two
            result += nonPrintable + text.join ('')
            length += text.length
        }

        return result
    }
}