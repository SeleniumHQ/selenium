"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* Module for handling serialization and deserialization of data contracts
* (contracts sent from the server using the VSO default REST api serialization settings)
*/
var ContractSerializer;
(function (ContractSerializer) {
    var _legacyDateRegExp;
    /**
     * Process a contract in its raw form (e.g. date fields are Dates, and Enums are numbers) and
     * return a pure JSON object that can be posted to REST endpoint.
     *
     * @param data The object to serialize
     * @param contractMetadata The type info/metadata for the contract type being serialized
     * @param preserveOriginal If true, don't modify the original object. False modifies the original object (the return value points to the data argument).
     */
    function serialize(data, contractMetadata, preserveOriginal) {
        if (data && contractMetadata) {
            if (Array.isArray(data)) {
                return _getTranslatedArray(data, contractMetadata, true, preserveOriginal);
            }
            else {
                return _getTranslatedObject(data, contractMetadata, true, preserveOriginal);
            }
        }
        else {
            return data;
        }
    }
    ContractSerializer.serialize = serialize;
    /**
     * Process a pure JSON object (e.g. that came from a REST call) and transform it into a JS object
     * where date strings are converted to Date objects and enum values are converted from strings into
     * their numerical value.
     *
     * @param data The object to deserialize
     * @param contractMetadata The type info/metadata for the contract type being deserialize
     * @param preserveOriginal If true, don't modify the original object. False modifies the original object (the return value points to the data argument).
     * @param unwrapWrappedCollections If true check for wrapped arrays (REST apis will not return arrays directly as the root result but will instead wrap them in a { values: [], count: 0 } object.
     */
    function deserialize(data, contractMetadata, preserveOriginal, unwrapWrappedCollections) {
        if (data) {
            if (unwrapWrappedCollections && Array.isArray(data.value)) {
                // Wrapped json array - unwrap it and send the array as the result
                data = data.value;
            }
            if (contractMetadata) {
                if (Array.isArray(data)) {
                    data = _getTranslatedArray(data, contractMetadata, false, preserveOriginal);
                }
                else {
                    data = _getTranslatedObject(data, contractMetadata, false, preserveOriginal);
                }
            }
        }
        return data;
    }
    ContractSerializer.deserialize = deserialize;
    function _getTranslatedArray(array, typeMetadata, serialize, preserveOriginal) {
        var resultArray = array;
        var arrayCopy = [];
        var i;
        for (i = 0; i < array.length; i++) {
            var item = array[i];
            var processedItem;
            // handle arrays of arrays
            if (Array.isArray(item)) {
                processedItem = _getTranslatedArray(item, typeMetadata, serialize, preserveOriginal);
            }
            else {
                processedItem = _getTranslatedObject(item, typeMetadata, serialize, preserveOriginal);
            }
            if (preserveOriginal) {
                arrayCopy.push(processedItem);
                if (processedItem !== item) {
                    resultArray = arrayCopy;
                }
            }
            else {
                array[i] = processedItem;
            }
        }
        return resultArray;
    }
    function _getTranslatedObject(typeObject, typeMetadata, serialize, preserveOriginal) {
        var processedItem = typeObject, copiedItem = false;
        if (typeObject && typeMetadata.fields) {
            for (var fieldName in typeMetadata.fields) {
                var fieldMetadata = typeMetadata.fields[fieldName];
                var fieldValue = typeObject[fieldName];
                var translatedValue = _getTranslatedField(fieldValue, fieldMetadata, serialize, preserveOriginal);
                if (fieldValue !== translatedValue) {
                    if (preserveOriginal && !copiedItem) {
                        processedItem = this._extend({}, typeObject);
                        copiedItem = true;
                    }
                    processedItem[fieldName] = translatedValue;
                }
            }
        }
        return processedItem;
    }
    function _getTranslatedField(fieldValue, fieldMetadata, serialize, preserveOriginal) {
        if (!fieldValue) {
            return fieldValue;
        }
        if (fieldMetadata.isArray) {
            if (Array.isArray(fieldValue)) {
                var newArray = [], processedArray = fieldValue;
                for (var index = 0; index < fieldValue.length; index++) {
                    var arrayValue = fieldValue[index];
                    var processedValue = arrayValue;
                    if (fieldMetadata.isDate) {
                        processedValue = _getTranslatedDateValue(arrayValue, serialize);
                    }
                    else if (fieldMetadata.enumType) {
                        processedValue = _getTranslatedEnumValue(fieldMetadata.enumType, arrayValue, serialize);
                    }
                    else if (fieldMetadata.typeInfo) {
                        if (Array.isArray(arrayValue)) {
                            processedValue = _getTranslatedArray(arrayValue, fieldMetadata.typeInfo, serialize, preserveOriginal);
                        }
                        else {
                            processedValue = _getTranslatedObject(arrayValue, fieldMetadata.typeInfo, serialize, preserveOriginal);
                        }
                    }
                    if (preserveOriginal) {
                        newArray.push(processedValue);
                        if (processedValue !== arrayValue) {
                            processedArray = newArray;
                        }
                    }
                    else {
                        fieldValue[index] = processedValue;
                    }
                }
                return processedArray;
            }
            else {
                return fieldValue;
            }
        }
        else if (fieldMetadata.isDictionary) {
            var dictionaryModified = false;
            var newDictionary = {};
            for (var key in fieldValue) {
                var dictionaryValue = fieldValue[key];
                var newKey = key, newValue = dictionaryValue;
                if (fieldMetadata.dictionaryKeyIsDate) {
                    newKey = _getTranslatedDateValue(key, serialize);
                }
                else if (fieldMetadata.dictionaryKeyEnumType) {
                    newKey = _getTranslatedEnumValue(fieldMetadata.dictionaryKeyEnumType, key, serialize);
                }
                if (fieldMetadata.dictionaryValueIsDate) {
                    newValue = _getTranslatedDateValue(dictionaryValue, serialize);
                }
                else if (fieldMetadata.dictionaryValueEnumType) {
                    newValue = _getTranslatedEnumValue(fieldMetadata.dictionaryValueEnumType, dictionaryValue, serialize);
                }
                else if (fieldMetadata.dictionaryValueTypeInfo) {
                    newValue = _getTranslatedObject(newValue, fieldMetadata.dictionaryValueTypeInfo, serialize, preserveOriginal);
                }
                else if (fieldMetadata.dictionaryValueFieldInfo) {
                    newValue = _getTranslatedField(dictionaryValue, fieldMetadata.dictionaryValueFieldInfo, serialize, preserveOriginal);
                }
                newDictionary[newKey] = newValue;
                if (key !== newKey || dictionaryValue !== newValue) {
                    dictionaryModified = true;
                }
            }
            return dictionaryModified ? newDictionary : fieldValue;
        }
        else {
            if (fieldMetadata.isDate) {
                return _getTranslatedDateValue(fieldValue, serialize);
            }
            else if (fieldMetadata.enumType) {
                return _getTranslatedEnumValue(fieldMetadata.enumType, fieldValue, serialize);
            }
            else if (fieldMetadata.typeInfo) {
                return _getTranslatedObject(fieldValue, fieldMetadata.typeInfo, serialize, preserveOriginal);
            }
            else {
                return fieldValue;
            }
        }
    }
    function _getTranslatedEnumValue(enumType, valueToConvert, serialize) {
        if (serialize && typeof valueToConvert === "number") {
            // Serialize: number --> String
            // Because webapi handles the numerical value for enums, there is no need to convert to string.
            // Let this fall through to return the numerical value.
        }
        else if (!serialize && typeof valueToConvert === "string") {
            // Deserialize: String --> number
            var result = 0;
            if (valueToConvert) {
                var splitValue = valueToConvert.split(",");
                for (var i = 0; i < splitValue.length; i++) {
                    var valuePart = splitValue[i];
                    //equivalent to jquery trim
                    //copied from https://github.com/HubSpot/youmightnotneedjquery/blob/ef987223c20e480fcbfb5924d96c11cd928e1226/comparisons/utils/trim/ie8.js
                    var enumName = valuePart.replace(/^\s+|\s+$/g, '') || "";
                    if (enumName) {
                        var resultPart = enumType.enumValues[enumName];
                        if (!resultPart) {
                            // No matching enum value. Try again but case insensitive
                            var lowerCaseEnumName = enumName.toLowerCase();
                            if (lowerCaseEnumName !== enumName) {
                                for (var name in enumType.enumValues) {
                                    var value = enumType.enumValues[name];
                                    if (name.toLowerCase() === lowerCaseEnumName) {
                                        resultPart = value;
                                        return false;
                                    }
                                }
                            }
                        }
                        if (resultPart) {
                            result |= resultPart;
                        }
                    }
                }
            }
            return result;
        }
        return valueToConvert;
    }
    function _getTranslatedDateValue(valueToConvert, serialize) {
        if (!serialize && typeof valueToConvert === "string") {
            // Deserialize: String --> Date
            var dateValue = new Date(valueToConvert);
            if (isNaN(dateValue) && navigator.userAgent && /msie/i.test(navigator.userAgent)) {
                dateValue = _convertLegacyIEDate(valueToConvert);
            }
            return dateValue;
        }
        return valueToConvert;
    }
    function _convertLegacyIEDate(dateStringValue) {
        // IE 8/9 does not handle parsing dates in ISO form like:
        // 2013-05-13T14:26:54.397Z
        var match;
        if (!_legacyDateRegExp) {
            _legacyDateRegExp = new RegExp("(\\d+)-(\\d+)-(\\d+)T(\\d+):(\\d+):(\\d+).(\\d+)Z");
        }
        match = _legacyDateRegExp.exec(dateStringValue);
        if (match) {
            return new Date(Date.UTC(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]), parseInt(match[4]), parseInt(match[5]), parseInt(match[6]), parseInt(match[7])));
        }
        else {
            return null;
        }
    }
    // jquery extend method in native javascript (used to clone objects)
    // copied from https://github.com/HubSpot/youmightnotneedjquery/blob/ef987223c20e480fcbfb5924d96c11cd928e1226/comparisons/utils/extend/ie8.js
    var _extend = function (out) {
        out = out || {};
        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i])
                continue;
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key))
                    out[key] = arguments[i][key];
            }
        }
        return out;
    };
})(ContractSerializer = exports.ContractSerializer || (exports.ContractSerializer = {}));
