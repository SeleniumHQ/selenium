export declare enum InputDataType {
    /**
     * No data type is specified.
     */
    None = 0,
    /**
     * Represents a textual value.
     */
    String = 10,
    /**
     * Represents a numberic value.
     */
    Number = 20,
    /**
     * Represents a value of true or false.
     */
    Boolean = 30,
    /**
     * Represents a Guid.
     */
    Guid = 40,
    /**
     * Represents a URI.
     */
    Uri = 50,
}
/**
 * Describes an input for subscriptions.
 */
export interface InputDescriptor {
    /**
     * The ids of all inputs that the value of this input is dependent on.
     */
    dependencyInputIds: string[];
    /**
     * Description of what this input is used for
     */
    description: string;
    /**
     * The group localized name to which this input belongs and can be shown as a header for the container that will include all the inputs in the group.
     */
    groupName: string;
    /**
     * If true, the value information for this input is dynamic and should be fetched when the value of dependency inputs change.
     */
    hasDynamicValueInformation: boolean;
    /**
     * Identifier for the subscription input
     */
    id: string;
    /**
     * Mode in which the value of this input should be entered
     */
    inputMode: InputMode;
    /**
     * Gets whether this input is confidential, such as for a password or application key
     */
    isConfidential: boolean;
    /**
     * Localized name which can be shown as a label for the subscription input
     */
    name: string;
    /**
     * Gets whether this input is included in the default generated action description.
     */
    useInDefaultDescription: boolean;
    /**
     * Information to use to validate this input's value
     */
    validation: InputValidation;
    /**
     * A hint for input value. It can be used in the UI as the input placeholder.
     */
    valueHint: string;
    /**
     * Information about possible values for this input
     */
    values: InputValues;
}
/**
 * Defines a filter for subscription inputs. The filter matches a set of inputs if any (one or more) of the groups evaluates to true.
 */
export interface InputFilter {
    /**
     * Groups of input filter expressions. This filter matches a set of inputs if any (one or more) of the groups evaluates to true.
     */
    conditions: InputFilterCondition[];
}
/**
 * An expression which can be applied to filter a list of subscription inputs
 */
export interface InputFilterCondition {
    /**
     * Whether or not to do a case sensitive match
     */
    caseSensitive: boolean;
    /**
     * The Id of the input to filter on
     */
    inputId: string;
    /**
     * The "expected" input value to compare with the actual input value
     */
    inputValue: string;
    /**
     * The operator applied between the expected and actual input value
     */
    operator: InputFilterOperator;
}
export declare enum InputFilterOperator {
    Equals = 0,
    NotEquals = 1,
}
export declare enum InputMode {
    /**
     * This input should not be shown in the UI
     */
    None = 0,
    /**
     * An input text box should be shown
     */
    TextBox = 10,
    /**
     * An password input box should be shown
     */
    PasswordBox = 20,
    /**
     * A select/combo control should be shown
     */
    Combo = 30,
    /**
     * Radio buttons should be shown
     */
    RadioButtons = 40,
    /**
     * Checkbox should be shown(for true/false values)
     */
    CheckBox = 50,
    /**
     * A multi-line text area should be shown
     */
    TextArea = 60,
}
/**
 * Describes what values are valid for a subscription input
 */
export interface InputValidation {
    dataType: InputDataType;
    isRequired: boolean;
    maxLength: number;
    maxValue: number;
    minLength: number;
    minValue: number;
    pattern: string;
    patternMismatchErrorMessage: string;
}
/**
 * Information about a single value for an input
 */
export interface InputValue {
    /**
     * Any other data about this input
     */
    data: {
        [key: string]: any;
    };
    /**
     * The text to show for the display of this value
     */
    displayValue: string;
    /**
     * The value to store for this input
     */
    value: string;
}
/**
 * Information about the possible/allowed values for a given subscription input
 */
export interface InputValues {
    /**
     * The default value to use for this input
     */
    defaultValue: string;
    /**
     * Errors encountered while computing dynamic values.
     */
    error: InputValuesError;
    /**
     * The id of the input
     */
    inputId: string;
    /**
     * Should this input be disabled
     */
    isDisabled: boolean;
    /**
     * Should the value be restricted to one of the values in the PossibleValues (True) or are the values in PossibleValues just a suggestion (False)
     */
    isLimitedToPossibleValues: boolean;
    /**
     * Should this input be made read-only
     */
    isReadOnly: boolean;
    /**
     * Possible values that this input can take
     */
    possibleValues: InputValue[];
}
/**
 * Error information related to a subscription input value.
 */
export interface InputValuesError {
    /**
     * The error message.
     */
    message: string;
}
export interface InputValuesQuery {
    currentValues: {
        [key: string]: string;
    };
    /**
     * The input values to return on input, and the result from the consumer on output.
     */
    inputValues: InputValues[];
    /**
     * Subscription containing information about the publisher/consumer and the current input values
     */
    resource: any;
}
export declare var TypeInfo: {
    InputDataType: {
        enumValues: {
            "none": number;
            "string": number;
            "number": number;
            "boolean": number;
            "guid": number;
            "uri": number;
        };
    };
    InputDescriptor: {
        fields: any;
    };
    InputFilter: {
        fields: any;
    };
    InputFilterCondition: {
        fields: any;
    };
    InputFilterOperator: {
        enumValues: {
            "equals": number;
            "notEquals": number;
        };
    };
    InputMode: {
        enumValues: {
            "none": number;
            "textBox": number;
            "passwordBox": number;
            "combo": number;
            "radioButtons": number;
            "checkBox": number;
            "textArea": number;
        };
    };
    InputValidation: {
        fields: any;
    };
    InputValue: {
        fields: any;
    };
    InputValues: {
        fields: any;
    };
    InputValuesError: {
        fields: any;
    };
    InputValuesQuery: {
        fields: any;
    };
};
