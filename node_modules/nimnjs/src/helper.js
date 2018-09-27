
/**
 * Verify if all the datahandlers are added given in schema.
 * @param {*} schema 
 * @param {*} datahandlers 
 */
var validateSchema = function(schema,datahandlers){
    if(Array.isArray(schema)){
        validateSchema(schema[0],datahandlers);
    }else if(typeof schema === "object"){
        var keys = Object.keys(schema);
        var len = keys.length;

        for(var i=0; i< len; i++){
            var key = keys[i];
            var nextKey = keys[i+1];

            validateSchema(schema[key],datahandlers);
        }
    }else{
        if(!datahandlers[schema]){
            throw Error("You've forgot to add data handler for " + schema)
        }
    }
}

exports.validateSchema = validateSchema;