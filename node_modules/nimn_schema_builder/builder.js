
/**
 * Build Schema for nimnification of JSON data
 * @param {*} jsObj 
 */
function buildSchema(jsObj){
    var type = typeOf(jsObj);
    switch(type){
        case "array":
            return [buildSchema(jsObj[0])];
        case "object":
            var schema = {  };
            var keys = Object.keys(jsObj);
            for(var i in keys){
                var key = keys[i];
                /* if(key === null || typeof key === "undefined"){//in case of null or undefined, take sibling's type
                    if(keys[i+1] ){
                        schema[key] = buildSchema(jsObj[keys[i+1]]);        
                    }else if(keys[i-1]){
                        schema[key] = buildSchema(jsObj[keys[i-1]]);        
                    }
                    continue;
                } */
                schema[key] = buildSchema(jsObj[key]);
            }
            return schema;
        case "string":
        case "number":
        case "date":
        case "boolean":
            return type;
        default:
            throw Error("Unacceptable type : " + type);
    }
}

function typeOf(obj){
    if(obj === null) return "null";
    else if(Array.isArray(obj)) return "array";
    else if(obj instanceof Date) return "date";
    else return typeof obj;
}

module.exports.build = buildSchema;