"use strict";
const char = function(a) {
    return String.fromCharCode(a);
};

const chars = {
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
};

const charsArr = [
    chars.nilChar,
    chars.nilPremitive,
    chars.missingChar,
    chars.missingPremitive,
    chars.boundryChar,
    chars.emptyChar,
    chars.emptyValue,
    chars.arrayEnd,
    chars.objStart,
    chars.arrStart
];

const _e = function(node, e_schema, options) {
    if (typeof e_schema === "string") {//premitive
        if (node && node[0] && node[0].val !== undefined) {
            return getValue(node[0].val, e_schema);
        } else {
            return getValue(node, e_schema);
        }
    } else {
        const hasValidData = hasData(node);
        if (hasValidData === true) {
            let str = "";
            if (Array.isArray(e_schema)) {
                //attributes can't be repeated. hence check in children tags only
                str += chars.arrStart;
                const itemSchema = e_schema[0];
                //var itemSchemaType = itemSchema;
                const arr_len = node.length;

                if (typeof itemSchema === "string") {
                    for (let arr_i = 0; arr_i < arr_len; arr_i++) {
                        const r = getValue(node[arr_i].val, itemSchema);
                        str = processValue(str, r);
                    }
                } else {
                    for (let arr_i = 0; arr_i < arr_len; arr_i++) {
                        const r = _e(node[arr_i], itemSchema, options);
                        str = processValue(str, r);
                    }
                }
                str += chars.arrayEnd;//indicates that next item is not array item
            } else {//object
                str += chars.objStart;
                const keys = Object.keys(e_schema);
                if (Array.isArray(node)) {
                    node = node[0];
                }
                for (let i in keys) {
                    const key = keys[i];
                    //a property defined in schema can be present either in attrsMap or children tags
                    //options.textNodeName will not present in both maps, take it's value from val
                    //options.attrNodeName will be present in attrsMap
                    let r;
                    if (!options.ignoreAttributes && node.attrsMap && node.attrsMap[key]) {
                        r = _e(node.attrsMap[key], e_schema[key], options);
                    } else if (key === options.textNodeName) {
                        r = _e(node.val, e_schema[key], options);
                    } else {
                        r = _e(node.child[key], e_schema[key], options);
                    }
                    str = processValue(str, r);
                }
            }
            return str;
        } else {
            return hasValidData;
        }
    }
};

const getValue = function(a/*, type*/) {
    switch (a) {
        case undefined:
            return chars.missingPremitive;
        case null:
            return chars.nilPremitive;
        case "":
            return chars.emptyValue;
        default:
            return a;
    }
};

const processValue = function(str, r) {
    if (!isAppChar(r[0]) && !isAppChar(str[str.length - 1])) {
        str += chars.boundryChar;
    }
    return str + r;
};

const isAppChar = function(ch) {
    return charsArr.indexOf(ch) !== -1;
};

function hasData(jObj) {
    if (jObj === undefined) {
        return chars.missingChar;
    } else if (jObj === null) {
        return chars.nilChar;
    } else if (jObj.child && Object.keys(jObj.child).length === 0 && (!jObj.attrsMap || Object.keys(jObj.attrsMap).length === 0)) {
        return chars.emptyChar;
    } else {
        return true;
    }
}

const x2j = require("./xmlstr2xmlnode");
const buildOptions = require("./util").buildOptions;

const convert2nimn = function(node, e_schema, options) {
    options = buildOptions(options,x2j.defaultOptions,x2j.props);
    return _e(node, e_schema, options);
};

exports.convert2nimn = convert2nimn;
