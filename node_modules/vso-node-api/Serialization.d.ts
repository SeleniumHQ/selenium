/**
* Metadata for deserializing an enum field on a contract/type
*/
export interface ContractEnumMetadata {
    enumValues?: {
        [name: string]: number;
    };
}
export interface SerializationData {
    requestTypeMetadata?: ContractMetadata;
    responseTypeMetadata?: ContractMetadata;
    responseIsCollection: boolean;
}
/**
* Metadata for deserializing a particular field on a contract/type
*/
export interface ContractFieldMetadata {
    isArray?: boolean;
    isDate?: boolean;
    enumType?: ContractEnumMetadata;
    typeInfo?: ContractMetadata;
    isDictionary?: boolean;
    dictionaryKeyIsDate?: boolean;
    dictionaryValueIsDate?: boolean;
    dictionaryKeyEnumType?: ContractEnumMetadata;
    dictionaryValueEnumType?: ContractEnumMetadata;
    dictionaryValueTypeInfo?: ContractMetadata;
    dictionaryValueFieldInfo?: ContractFieldMetadata;
}
/**
* Metadata required for deserializing a given type
*/
export interface ContractMetadata {
    fields?: {
        [fieldName: string]: ContractFieldMetadata;
    };
}
export interface IWebApiArrayResult {
    count: number;
    value: any[];
}
/**
* Module for handling serialization and deserialization of data contracts
* (contracts sent from the server using the VSO default REST api serialization settings)
*/
export declare module ContractSerializer {
    /**
     * Process a contract in its raw form (e.g. date fields are Dates, and Enums are numbers) and
     * return a pure JSON object that can be posted to REST endpoint.
     *
     * @param data The object to serialize
     * @param contractMetadata The type info/metadata for the contract type being serialized
     * @param preserveOriginal If true, don't modify the original object. False modifies the original object (the return value points to the data argument).
     */
    function serialize(data: any, contractMetadata: ContractMetadata, preserveOriginal: boolean): any;
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
    function deserialize(data: any, contractMetadata: ContractMetadata, preserveOriginal: boolean, unwrapWrappedCollections: boolean): any;
}
