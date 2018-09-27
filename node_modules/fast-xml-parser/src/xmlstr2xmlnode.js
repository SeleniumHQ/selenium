"use strict";

const util = require("./util");
const buildOptions = require("./util").buildOptions;
const xmlNode = require("./xmlNode");
const TagType = {"OPENING": 1, "CLOSING": 2, "SELF": 3, "CDATA": 4};
let regx = "<((!\\[CDATA\\[([\\s\\S]*?)(]]>))|(([\\w:\\-._]*:)?([\\w:\\-._]+))([^>]*)>|((\\/)(([\\w:\\-._]*:)?([\\w:\\-._]+))\\s*>))([^<]*)";

//const tagsRegx = new RegExp("<(\\/?[\\w:\\-\._]+)([^>]*)>(\\s*"+cdataRegx+")*([^<]+)?","g");
//const tagsRegx = new RegExp("<(\\/?)((\\w*:)?([\\w:\\-\._]+))([^>]*)>([^<]*)("+cdataRegx+"([^<]*))*([^<]+)?","g");

//treat cdata as a tag

const defaultOptions = {
    attributeNamePrefix:    "@_",
    attrNodeName:           false,
    textNodeName:           "#text",
    ignoreAttributes:       true,
    ignoreNameSpace:        false,
    allowBooleanAttributes: false,         //a tag can have attributes without any value
    //ignoreRootElement : false,
    parseNodeValue:         true,
    parseAttributeValue:    false,
    arrayMode:              false,
    trimValues:             true,                                //Trim string values of tag and attributes
    cdataTagName:           false,
    cdataPositionChar:      "\\c",
    localeRange:            "",
    tagValueProcessor: function(a) {return a},
    attrValueProcessor: function(a) {return a}
    //decodeStrict: false,
};

exports.defaultOptions = defaultOptions;

const props = ["attributeNamePrefix", "attrNodeName", "textNodeName", "ignoreAttributes", "ignoreNameSpace", "allowBooleanAttributes", "parseNodeValue", "parseAttributeValue", "arrayMode", "trimValues", "cdataTagName", "cdataPositionChar", "localeRange", "tagValueProcessor", "attrValueProcessor", "parseTrueNumberOnly"];
exports.props = props;

const getTraversalObj = function(xmlData, options) {
    options = buildOptions(options,defaultOptions,props);
    //xmlData = xmlData.replace(/\r?\n/g, " ");//make it single line
    xmlData = xmlData.replace(/<!--[\s\S]*?-->/g, "");//Remove  comments

    const xmlObj = new xmlNode("!xml");
    let currentNode = xmlObj;

    regx = regx.replace(/\[\\w/g, "[" + options.localeRange + "\\w");
    const tagsRegx = new RegExp(regx, "g");
    let tag = tagsRegx.exec(xmlData);
    let nextTag = tagsRegx.exec(xmlData);
    while (tag) {
        const tagType = checkForTagType(tag);

        if (tagType === TagType.CLOSING) {
            //add parsed data to parent node
            if (currentNode.parent && tag[14]) {
                currentNode.parent.val = util.getValue(currentNode.parent.val) + "" + processTagValue(tag[14], options);
            }

            currentNode = currentNode.parent;
        } else if (tagType === TagType.CDATA) {
            if (options.cdataTagName) {
                //add cdata node
                const childNode = new xmlNode(options.cdataTagName, currentNode, tag[3]);
                childNode.attrsMap = buildAttributesMap(tag[8], options);
                currentNode.addChild(childNode);
                //for backtracking
                currentNode.val = util.getValue(currentNode.val) + options.cdataPositionChar;
                //add rest value to parent node
                if (tag[14]) {
                    currentNode.val += processTagValue(tag[14], options);
                }
            } else {
                currentNode.val = (currentNode.val || "") + (tag[3] || "") + processTagValue(tag[14], options);
            }
        } else if (tagType === TagType.SELF) {
            if (currentNode && tag[14]) {
                currentNode.val = util.getValue(currentNode.val) + "" + processTagValue(tag[14], options);
            }

            const childNode = new xmlNode(options.ignoreNameSpace ? tag[7] : tag[5], currentNode, "");
            if (tag[8] && tag[8].length > 1) {
                tag[8] = tag[8].substr(0, tag[8].length - 1);
            }
            childNode.attrsMap = buildAttributesMap(tag[8], options);
            currentNode.addChild(childNode);
        } else {//TagType.OPENING
            const childNode = new xmlNode(options.ignoreNameSpace ? tag[7] : tag[5], currentNode, processTagValue(tag[14], options));
            childNode.attrsMap = buildAttributesMap(tag[8], options);
            currentNode.addChild(childNode);
            currentNode = childNode;
        }

        tag = nextTag;
        nextTag = tagsRegx.exec(xmlData);
    }

    return xmlObj;
};

function processTagValue(val, options) {
    if (val) {
        if (options.trimValues) {
            val = val.trim();
        }
        val = options.tagValueProcessor(val);
        val = parseValue(val, options.parseNodeValue, options.parseTrueNumberOnly);
    }

    return val;
}

function checkForTagType(match) {
    if (match[4] === "]]>") {
        return TagType.CDATA;
    } else if (match[10] === "/") {
        return TagType.CLOSING;
    } else if (typeof match[8] !== "undefined" && match[8].substr(match[8].length - 1) === "/") {
        return TagType.SELF;
    } else {
        return TagType.OPENING;
    }
}

function resolveNameSpace(tagname, options) {
    if (options.ignoreNameSpace) {
        const tags = tagname.split(":");
        const prefix = tagname.charAt(0) === "/" ? "/" : "";
        if (tags[0] === "xmlns") {
            return "";
        }
        if (tags.length === 2) {
            tagname = prefix + tags[1];
        }
    }
    return tagname;
}

function parseValue(val, shouldParse, parseTrueNumberOnly) {
    if (shouldParse && typeof val === "string") {
        let parsed;
        if (val.trim() === "" || isNaN(val)) {
            parsed = val === "true" ? true : val === "false" ? false : val;
        } else {
            if(val.indexOf("0x") !== -1){//support hexa decimal
                parsed = Number.parseInt(val,16);
            } else if (val.indexOf(".") !== -1) {
                parsed = Number.parseFloat(val);
            } else {
                parsed = Number.parseInt(val, 10);
            }
            if(parseTrueNumberOnly){
                parsed = String(parsed) === val ? parsed : val;
                
            }
        }
        return parsed;
    } else {
        if (util.isExist(val)) {
            return val;
        } else {
            return "";
        }
    }
}

//TODO: change regex to capture NS
//const attrsRegx = new RegExp("([\\w\\-\\.\\:]+)\\s*=\\s*(['\"])((.|\n)*?)\\2","gm");
const attrsRegx = new RegExp("([^\\s=]+)\\s*(=\\s*(['\"])(.*?)\\3)?", "g");

function buildAttributesMap(attrStr, options) {
    if (!options.ignoreAttributes && typeof attrStr === "string") {
        attrStr = attrStr.replace(/\r?\n/g, " ");
        //attrStr = attrStr || attrStr.trim();

        const matches = util.getAllMatches(attrStr, attrsRegx);
        const len = matches.length; //don't make it inline
        const attrs = {};
        for (let i = 0; i < len; i++) {
            const attrName = resolveNameSpace(matches[i][1], options);
            if (attrName.length) {
                if (matches[i][4] !== undefined) {
                    if (options.trimValues) {
                        matches[i][4] = matches[i][4].trim();
                    }
                    matches[i][4] = options.attrValueProcessor(matches[i][4]);
                    attrs[options.attributeNamePrefix + attrName] = parseValue(matches[i][4], options.parseAttributeValue, options.parseTrueNumberOnly);
                } else if (options.allowBooleanAttributes) {
                    attrs[options.attributeNamePrefix + attrName] = true;
                }

            }
        }
        if (!Object.keys(attrs).length) {
            return;
        }
        if (options.attrNodeName) {
            const attrCollection = {};
            attrCollection[options.attrNodeName] = attrs;
            return attrCollection;
        }
        return attrs;
    }
}

exports.getTraversalObj = getTraversalObj;
