/**
 * 
 * @param {string} dataType 
 * @param {function} parse 
 * @param {function} parseBack 
 * @param {object} charset
 * @param {boolean} treatAsUnique
 */
function DataHandler(dataType, /* parse, parseBack, */ charset,treatAsUnique){
    this.dataType = dataType;
    //parse || (this.parse = parse);
    //parseBack || (this.parseBack = parseBack);
    if(charset){
        //this.hasFixedInstances = true;
        this.char2val = charset;
        this.val2char = {};
        var keys = Object.keys(charset);
        for(var i in keys){
            var val = charset[keys[i]];
            this.val2char[val] = keys[i];
        }

        this.charcodes = Object.keys(charset);
    }
    if(treatAsUnique){
        this.hasFixedInstances = true;
    }

    //this.treatAsUnique = treatAsUnique;
}

DataHandler.prototype.parse = function(a){
    if(this.char2val){
        return this.getCharCodeFor(a);
    }else{
        return a;
    }
}

DataHandler.prototype.parseBack = function(a){
    if(this.char2val){
        return this.getValueOf(a);
    }else{
        return a;
    }
}

/**
 * returns an array of supported characters or empty array when it supportes dynamic data
 */
DataHandler.prototype.getCharCodes =function(){
    return this.charcodes;
}

DataHandler.prototype.getValueOf =function(chCode){
    return this.char2val[chCode];
}

DataHandler.prototype.getCharCodeFor =function(value){
    return this.val2char[value];
}

module.exports = DataHandler;