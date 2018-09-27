"use strict";

const getAllMatches = function(string, regex) {
    const matches = [];
    let match = regex.exec(string);
    while (match) {
        const allmatches = [];
        const len = match.length;
        for (let index = 0; index < len; index++) {
            allmatches.push(match[index]);
        }
        matches.push(allmatches);
        match = regex.exec(string);
    }
    return matches;
};

const doesMatch = function(string, regex) {
    const match = regex.exec(string);
    return !(match === null || typeof match === "undefined");
};

const doesNotMatch = function(string, regex) {
    return !doesMatch(string, regex);
};

exports.isExist = function(v) {
    return typeof v !== "undefined";
};

exports.isEmptyObject = function(obj) {
    return Object.keys(obj).length === 0;
};

/**
 * Copy all the properties of a into b.
 * @param {*} target
 * @param {*} a
 */
exports.merge = function(target, a) {
    if (a) {
        const keys = Object.keys(a); // will return an array of own properties
        const len = keys.length; //don't make it inline
        for (let i = 0; i < len; i++) {
            target[keys[i]] = a[keys[i]];
        }
    }
};
/* exports.merge =function (b,a){
  return Object.assign(b,a);
} */

exports.getValue = function(v) {
    if (exports.isExist(v)) {
        return v;
    } else {
        return "";
    }
};

// const fakeCall = function(a) {return a;};
// const fakeCallNoReturn = function() {};

exports.buildOptions = function(options,defaultOptions,props) {
    var newOptions = {};
    if (!options) {
        return defaultOptions; //if there are not options
    }

    for (let i = 0; i < props.length; i++) {
        if ( options[props[i]] !== undefined) {
            newOptions[props[i]] = options[props[i]];
        }else{
            newOptions[props[i]] = defaultOptions[props[i]];
        }
    }
    return newOptions;
};

exports.doesMatch = doesMatch;
exports.doesNotMatch = doesNotMatch;
exports.getAllMatches = getAllMatches;
