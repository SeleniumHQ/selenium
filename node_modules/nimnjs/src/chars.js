var char = require("./util").char;


/* 176-178
180-190
198-208
219-223
 */

const chars= {
    nilChar : char(176),
    missingChar : char(201),
    nilPremitive : char(175),
    missingPremitive : char(200),

    emptyChar : char(178),
    emptyValue:  char(177),//empty Premitive
    
    boundryChar : char(179),
    
    objStart: char(198),
    arrStart: char(204),
    arrayEnd: char(185),
}

const charsArr = [
    chars.nilChar ,
    chars.nilPremitive,
    chars.missingChar,
    chars.missingPremitive,
    chars.boundryChar ,
    chars.emptyChar,
    chars.emptyValue,
    chars.arrayEnd,
    chars.objStart,
    chars.arrStart
]

exports.chars = chars; 
exports.charsArr = charsArr; 