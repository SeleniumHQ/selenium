/*
* ---------------------------------------------------------
* Copyright(C) Microsoft Corporation. All rights reserved.
* ---------------------------------------------------------
*
* ---------------------------------------------------------
* Generated file, DO NOT EDIT
* ---------------------------------------------------------
*
* See following wiki page for instructions on how to regenerate:
*   https://vsowiki.com/index.php?title=Rest_Client_Generation
*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InputDataType;
(function (InputDataType) {
    /**
     * No data type is specified.
     */
    InputDataType[InputDataType["None"] = 0] = "None";
    /**
     * Represents a textual value.
     */
    InputDataType[InputDataType["String"] = 10] = "String";
    /**
     * Represents a numberic value.
     */
    InputDataType[InputDataType["Number"] = 20] = "Number";
    /**
     * Represents a value of true or false.
     */
    InputDataType[InputDataType["Boolean"] = 30] = "Boolean";
    /**
     * Represents a Guid.
     */
    InputDataType[InputDataType["Guid"] = 40] = "Guid";
    /**
     * Represents a URI.
     */
    InputDataType[InputDataType["Uri"] = 50] = "Uri";
})(InputDataType = exports.InputDataType || (exports.InputDataType = {}));
var InputFilterOperator;
(function (InputFilterOperator) {
    InputFilterOperator[InputFilterOperator["Equals"] = 0] = "Equals";
    InputFilterOperator[InputFilterOperator["NotEquals"] = 1] = "NotEquals";
})(InputFilterOperator = exports.InputFilterOperator || (exports.InputFilterOperator = {}));
var InputMode;
(function (InputMode) {
    /**
     * This input should not be shown in the UI
     */
    InputMode[InputMode["None"] = 0] = "None";
    /**
     * An input text box should be shown
     */
    InputMode[InputMode["TextBox"] = 10] = "TextBox";
    /**
     * An password input box should be shown
     */
    InputMode[InputMode["PasswordBox"] = 20] = "PasswordBox";
    /**
     * A select/combo control should be shown
     */
    InputMode[InputMode["Combo"] = 30] = "Combo";
    /**
     * Radio buttons should be shown
     */
    InputMode[InputMode["RadioButtons"] = 40] = "RadioButtons";
    /**
     * Checkbox should be shown(for true/false values)
     */
    InputMode[InputMode["CheckBox"] = 50] = "CheckBox";
    /**
     * A multi-line text area should be shown
     */
    InputMode[InputMode["TextArea"] = 60] = "TextArea";
})(InputMode = exports.InputMode || (exports.InputMode = {}));
exports.TypeInfo = {
    InputDataType: {
        enumValues: {
            "none": 0,
            "string": 10,
            "number": 20,
            "boolean": 30,
            "guid": 40,
            "uri": 50,
        }
    },
    InputDescriptor: {
        fields: null
    },
    InputFilter: {
        fields: null
    },
    InputFilterCondition: {
        fields: null
    },
    InputFilterOperator: {
        enumValues: {
            "equals": 0,
            "notEquals": 1,
        }
    },
    InputMode: {
        enumValues: {
            "none": 0,
            "textBox": 10,
            "passwordBox": 20,
            "combo": 30,
            "radioButtons": 40,
            "checkBox": 50,
            "textArea": 60,
        }
    },
    InputValidation: {
        fields: null
    },
    InputValue: {
        fields: null
    },
    InputValues: {
        fields: null
    },
    InputValuesError: {
        fields: null
    },
    InputValuesQuery: {
        fields: null
    },
};
exports.TypeInfo.InputDescriptor.fields = {
    inputMode: {
        enumType: exports.TypeInfo.InputMode
    },
    validation: {
        typeInfo: exports.TypeInfo.InputValidation
    },
    values: {
        typeInfo: exports.TypeInfo.InputValues
    },
};
exports.TypeInfo.InputFilter.fields = {
    conditions: {
        isArray: true,
        typeInfo: exports.TypeInfo.InputFilterCondition
    },
};
exports.TypeInfo.InputFilterCondition.fields = {
    operator: {
        enumType: exports.TypeInfo.InputFilterOperator
    },
};
exports.TypeInfo.InputValidation.fields = {
    dataType: {
        enumType: exports.TypeInfo.InputDataType
    },
};
exports.TypeInfo.InputValue.fields = {};
exports.TypeInfo.InputValues.fields = {
    error: {
        typeInfo: exports.TypeInfo.InputValuesError
    },
    possibleValues: {
        isArray: true,
        typeInfo: exports.TypeInfo.InputValue
    },
};
exports.TypeInfo.InputValuesError.fields = {};
exports.TypeInfo.InputValuesQuery.fields = {
    inputValues: {
        isArray: true,
        typeInfo: exports.TypeInfo.InputValues
    },
};
