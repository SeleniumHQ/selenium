var chars = require("./chars").chars;

decoder.prototype._d = function(schema){
    if(ifNil(this.currentChar())){
        this.index++;
        return null;
    }else if(ifMissing(this.currentChar())){
        this.index++;
        return undefined;
    }else if(typeof schema.type === "string"){//premitive
        return this.readPremitiveValue(schema);
    }else if(Array.isArray(schema)){
        if(this.currentChar() === chars.emptyChar){
            this.index++;
            return [];
        }else if(this.currentChar() !== chars.arrStart){
            throw Error("Parsing error: Array start char was expected");
        }else{
            this.index++;//skip array start char
            var item = schema[0];
            var obj = []
            do{
                var r =  this._d(item) ;
                if(r !== undefined){
                    obj.push(r);
                }
            }while(this.dataToDecode[this.index] !== chars.arrayEnd);
            ++this.index;
            return obj;
        }
    }else{//object
        if(this.currentChar() === chars.emptyChar){
            this.index++;
            return {};
        }else if(this.currentChar() !== chars.objStart){
            throw Error("Parsing error: Object start char was expected : " + this.currentChar());
        }else{
            this.index++;//skip object start char
            var keys = Object.keys(schema);
            var len = keys.length;
            var obj = {};
            for(var i=0; i< len; i++){
                
                var r =  this._d(schema[keys[i]]) ;
                if(r !== undefined){
                    obj[keys[i]] = r;
                }
            }
            return obj;
        }
    }
}

function ifNil(ch){
    return ch === chars.nilChar || ch === chars.nilPremitive;
}

function ifMissing(ch){
    return ch === chars.missingChar || ch === chars.missingPremitive;
}
/**
 * returns character index pointing to
 */
decoder.prototype.currentChar = function(){
    return this.dataToDecode[this.index];
}

decoder.prototype.readPremitiveValue = function(schemaOfCurrentKey){
    var val = this.readFieldValue(schemaOfCurrentKey);
    if(this.currentChar() === chars.boundryChar) this.index++;
    var dh = this.dataHandlers[schemaOfCurrentKey.type];
    return dh.parseBack(val);
}

/**
 * Read characters until app supported char is found
 */
decoder.prototype.readFieldValue = function(schemaOfCurrentKey){
    if(schemaOfCurrentKey.readUntil){
        if(this.currentChar() === chars.emptyValue){
            this.index++;
            return "";
        }else{
            var until = schemaOfCurrentKey.readUntil;
            var len = this.dataToDecode.length;
            var start = this.index;
            
            for(;this.index < len && until.indexOf(this.currentChar()) === -1;this.index++);
            return this.dataToDecode.substr(start, this.index-start);
        }
    }else{
        return this.dataToDecode[this.index++];
    }    
}


decoder.prototype.decode = function(objStr){
    this.index= 0;
    if(!objStr || typeof objStr !== "string" || objStr.length === 0) throw Error("input should be a valid string");
    this.dataToDecode = objStr;
    return this._d(this.schema);
}

function decoder(schema,dataHandlers){
    this.schema = schema;
    this.dataHandlers = dataHandlers;
}
module.exports = decoder;