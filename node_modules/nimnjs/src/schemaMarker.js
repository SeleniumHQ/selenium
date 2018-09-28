var chars = require("./chars").chars;
var appCharsArr = require("./chars").charsArr;

schemaMarker.prototype._m = function(schema){
    if(Array.isArray(schema)){
        if(typeof schema[0] === "string"){
            var itemSchema = {
                type : schema[0]
            }
            this.setReadUntil(itemSchema, schema[0]);
            schema[0] = itemSchema;//make it object so a function cant set it's value
            if(schema[0].readUntil)
                schema[0].readUntil.push(chars.arrayEnd);
        }else{
            this._m(schema[0]);//let's object portion handle it
            var lastMostKey = getLastMostKey(schema[0]);
            if(lastMostKey){
                this.setReadUntil(lastMostKey, schema[0]);
                if(lastMostKey.readUntil)
                    lastMostKey.readUntil.push(chars.arrayEnd);
            }else{
                //lastmostkey was set as it was under an array
            }
        }
    }else if(typeof schema === "object"){
        var keys = Object.keys(schema);
        var len = keys.length;

        for(var i=0; i< len; i++){
            var key = keys[i];
            var nextKey = keys[i+1];
            
            this._m(schema[key]);
            if(Array.isArray(schema[key])) continue;
            else if(nextKey){
                if(typeof schema[key] !== "string"){//not an object
                    var lastMostKey = getLastMostKey(schema[key]);
                    if(lastMostKey){
                        this.setReadUntil(lastMostKey,schema[nextKey]);
                    }else{
                        //lastmostkey was set as it was under an array
                    }
                }else{
                    var itemSchema = {
                        type : schema[key]
                    }
                    this.setReadUntil(itemSchema,schema[nextKey]);
                    schema[key] = itemSchema ;
                }
            }else{
                if(typeof schema[key] === "object") continue;
                schema[key] = {
                    type : schema[key]
                }
            }
        }
    }else{
        if(!this.dataHandlers[schema]){//handled
            throw Error("You've forgot to add data handler for " + schema)
        }
    }
}


schemaMarker.prototype.setReadUntil = function(current,next){
    //status: R,S
    if(this.dataHandlers[current.type].hasFixedInstances){
        //if current char is set by user and need to be separated by boundary char
        //then don't set readUntil, read current char
        return ;
    }else{
        
        //return [chars.boundryChar, chars.missingPremitive, chars.nilPremitive];
        if(Array.isArray(next)){
            current.readUntil =  [ chars.arrStart, chars.missingChar, chars.emptyChar, chars.nilChar];
        }else if(typeof next === "object"){
            current.readUntil =  [ chars.objStart, chars.missingChar, chars.emptyChar, chars.nilChar];
        }else{
            if(this.dataHandlers[next] && this.dataHandlers[next].hasFixedInstances){//but need to be separated by boundary char
                //status,boolean
                current.readUntil = [chars.missingPremitive, chars.nilPremitive];
                current.readUntil = current.readUntil.concat(this.dataHandlers[next].getCharCodes());
            }else{
                ///status,age
                current.readUntil =   [chars.boundryChar, chars.emptyValue, chars.missingPremitive, chars.nilPremitive];
            }
        }
    }
}

/**
 * obj can't be an array
 * @param {*} obj 
 */
function getLastMostKey(obj){
    var lastProperty;
    if(Array.isArray(obj)){
        return;
    }else{
        var keys = Object.keys(obj);
        lastProperty = obj[keys[keys.length-1]];
    }
    
    if(typeof lastProperty === "object" && !(lastProperty.type && typeof lastProperty.type === "string")){
        return getLastMostKey(lastProperty);
    }else{
        return lastProperty;
    }
}


schemaMarker.prototype.markNextPossibleChars = function(schema){
    this._m(schema);
    if(!Array.isArray(schema)){
        var lastMostKey = getLastMostKey(schema);
        if(lastMostKey){
            lastMostKey.readUntil = [chars.nilChar]
        }
    }
}
function schemaMarker(dataHandlers){
    this.dataHandlers = dataHandlers;
}

module.exports = schemaMarker;