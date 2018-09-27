"use strict";

const nodeToJson = require("./node2json");
const xmlToNodeobj = require("./xmlstr2xmlnode");
const x2xmlnode = require("./xmlstr2xmlnode");
const buildOptions = require("./util").buildOptions;

exports.parse = function(xmlData, options) {
    options = buildOptions(options, x2xmlnode.defaultOptions, x2xmlnode.props);
    return nodeToJson.convertToJson(xmlToNodeobj.getTraversalObj(xmlData, options), options);
};
exports.convertTonimn = require("../src/nimndata").convert2nimn;
exports.getTraversalObj = xmlToNodeobj.getTraversalObj;
exports.convertToJson = nodeToJson.convertToJson;
exports.convertToJsonString = require("./node2json_str").convertToJsonString;
exports.validate = require("./validator").validate;
exports.j2xParser = require("./json2xml");
exports.parseToNimn = function (xmlData,schema,options){
    return exports.convertTonimn(exports.getTraversalObj(xmlData,options), schema, options);
};
