"use strict";
//parse Empty Node as self closing node
const buildOptions = require("./util").buildOptions;

const defaultOptions = {
    attributeNamePrefix: "@_",
    attrNodeName: false,
    textNodeName: "#text",
    ignoreAttributes: true,
    cdataTagName: false,
    cdataPositionChar: "\\c",
    format: false,
    indentBy: "  ",
    supressEmptyNode: false,
    tagValueProcessor: function(a) {return a},
    attrValueProcessor: function(a) {return a}
};

const props = [
    "attributeNamePrefix",
    "attrNodeName",
    "textNodeName",
    "ignoreAttributes",
    "cdataTagName",
    "cdataPositionChar",
    "format",
    "indentBy",
    "supressEmptyNode",
    "tagValueProcessor",
    "attrValueProcessor"
]

function Parser(options) {
    this.options = buildOptions(options,defaultOptions,props);
    if (this.options.ignoreAttributes || this.options.attrNodeName) {
        this.isAttribute = function(/*a*/) { return false;};
    } else {
        this.attrPrefixLen = this.options.attributeNamePrefix.length;
        this.isAttribute = isAttribute;
    }
    if (this.options.cdataTagName) {
        this.isCDATA = isCDATA;
    } else {
        this.isCDATA = function(/*a*/) { return false;};
    }
    this.replaceCDATAstr = replaceCDATAstr;
    this.replaceCDATAarr = replaceCDATAarr;

    if (this.options.format) {
        this.indentate = indentate;
        this.tagEndChar = ">\n";
        this.newLine = "\n";
    } else {
        this.indentate = function() { return "";};
        this.tagEndChar = ">";
        this.newLine = "";
    }

    if (this.options.supressEmptyNode) {
        this.buildTextNode = buildEmptyTextNode;
        this.buildObjNode = buildEmptyObjNode;
    } else {
        this.buildTextNode = buildTextValNode;
        this.buildObjNode = buildObjectNode;
    }

    this.buildTextValNode = buildTextValNode;
    this.buildObjectNode = buildObjectNode;

}

Parser.prototype.parse = function(jObj) {
    return this.j2x(jObj, 0).val;
};

Parser.prototype.j2x = function(jObj, level) {
    let attrStr = "";
    let val = "";
    const keys = Object.keys(jObj);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
        const key = keys[i];
        if (typeof jObj[key] === "undefined") {
            // supress undefined node
        }else if (jObj[key] === null) {
            val += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
        }else if (typeof jObj[key] !== "object") {//premitive type
            const attr = this.isAttribute(key);
            if (attr) {
                attrStr += " " + attr + "=\"" +  this.options.attrValueProcessor("" + jObj[key]) + "\"";
            } else if (this.isCDATA(key)) {
                if (jObj[this.options.textNodeName]) {
                    val += this.replaceCDATAstr(jObj[this.options.textNodeName], jObj[key]);
                } else {
                    val += this.replaceCDATAstr("", jObj[key]);
                }
            } else {//tag value
                if (key === this.options.textNodeName) {
                    if (jObj[this.options.cdataTagName]) {
                        //value will added while processing cdata
                    } else {
                        val +=  this.options.tagValueProcessor("" + jObj[key]);
                    }
                } else {
                    val += this.buildTextNode(jObj[key], key, "", level);
                }
            }
        } else if (Array.isArray(jObj[key])) {//repeated nodes
            if (this.isCDATA(key)) {
              val += this.indentate(level)
                if (jObj[this.options.textNodeName]) {
                  val += this.replaceCDATAarr(jObj[this.options.textNodeName], jObj[key]);
                } else {
                  val += this.replaceCDATAarr("", jObj[key]);
                }
            } else {//nested nodes
                const arrLen = jObj[key].length;
                for (let j = 0; j < arrLen; j++) {
                    const item = jObj[key][j];
                    if (typeof item === "undefined") {
                        // supress undefined node
                    }else if(item === null){
                        val += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
                    }else if (typeof item === "object") {
                        const result = this.j2x(item, level + 1);
                        val += this.buildObjNode(result.val, key, result.attrStr, level);
                    } else {
                        val += this.buildTextNode(item, key, "", level);
                    }
                }
            }
        } else {//nested node
            if (this.options.attrNodeName && key === this.options.attrNodeName) {
                const Ks = Object.keys(jObj[key]);
                const L = Ks.length;
                for (let j = 0; j < L; j++) {
                    attrStr += " " + Ks[j] + "=\"" + this.options.tagValueProcessor("" + jObj[key][Ks[j]]) + "\"";
                }
            } else {
                const result = this.j2x(jObj[key], level + 1);
                val += this.buildObjNode(result.val, key, result.attrStr, level);
            }
        }
    }
    return {attrStr: attrStr, val: val};
};

function replaceCDATAstr(str, cdata) {
    str = this.options.tagValueProcessor("" + str);
    if (this.options.cdataPositionChar === "" || str === "") {
        return str + "<![CDATA[" + cdata + "]]" + this.tagEndChar;
    } else {
        return str.replace(this.options.cdataPositionChar, "<![CDATA[" + cdata + "]]" + this.tagEndChar);
    }
}

function replaceCDATAarr(str, cdata) {
    str = this.options.tagValueProcessor("" + str);
    if (this.options.cdataPositionChar === "" || str === "") {
        return str + "<![CDATA[" + cdata.join("]]><![CDATA[") + "]]" + this.tagEndChar;
    } else {
        for (let v in cdata) {
            str = str.replace(this.options.cdataPositionChar, "<![CDATA[" + cdata[v] + "]]>");
        }
        return str + this.newLine;
    }
}

function buildObjectNode(val, key, attrStr, level) {
  if (attrStr && !val.includes('<')) {
    return this.indentate(level)
          + "<" + key + attrStr
          + ">"
          + val
          //+ this.newLine
          // + this.indentate(level)
          + "</" + key + this.tagEndChar;
  } else {
    return this.indentate(level)
          + "<" + key + attrStr
          + this.tagEndChar
          + val
          //+ this.newLine
          + this.indentate(level)
          + "</" + key + this.tagEndChar;
  }
}

function buildEmptyObjNode(val, key, attrStr, level) {
    if (val !== "") {
        return this.buildObjectNode(val, key, attrStr, level);
    } else {
        return this.indentate(level)
               + "<" + key + attrStr
               + "/"
               + this.tagEndChar;
        //+ this.newLine
    }
}

function buildTextValNode(val, key, attrStr, level) {
    return this.indentate(level) + "<" + key + attrStr + ">" + this.options.tagValueProcessor("" + val) + "</" + key + this.tagEndChar;
}

function buildEmptyTextNode(val, key, attrStr, level) {
    if (val !== "") {
        return this.buildTextValNode(val, key, attrStr, level);
    } else {
        return this.indentate(level) + "<" + key + attrStr + "/" + this.tagEndChar;
    }
}

function indentate(level) {
    return this.options.indentBy.repeat(level);
}

function isAttribute(name/*, options*/) {
    if (name.startsWith(this.options.attributeNamePrefix)) {
        return name.substr(this.attrPrefixLen);
    } else {
        return false;
    }
}

function isCDATA(name) {
    return name === this.options.cdataTagName;
}

//formatting
//indentation
//\n after each closing or self closing tag

module.exports = Parser;
