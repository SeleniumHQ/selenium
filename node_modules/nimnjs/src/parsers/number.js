var chars = require("../chars").chars;

function parse(val){
    return val;
}

function parseBack(val){
    if(val.indexOf(".") !== -1){
        val = Number.parseFloat(val);
    }else{
        val = Number.parseInt(val,10);
    }
    return val;
}


exports.parse = parse;
exports.parseBack = parseBack;
