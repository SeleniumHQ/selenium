/*
JsUnit - a JUnit port for JavaScript
Copyright (C) 2006 Joerg Schaible

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * Validates the syntax of an email address.
 * @tparam String address the email address to validate.
 * @treturn Boolean Returns true if the email address is valid.
 */
function validateEmailAddress( address )
{
    return /^(\w[\w.]*)*\w+@(localhost|\w+(\.\w{2,})+)$/.test( address );
}


/**
 * A generic validator interface.
 */
function Validator()
{
}
/**
 * Validate a text.
 * @treturn Boolean Returns true if the text is valid.
 */
Validator.prototype.validate = function(text) {}

/**
 * A validator for an email address.
 */
function EmailValidator()
{
}
EmailValidator.prototype = new Validator();
EmailValidator.prototype.validate = validateEmailAddress;
EmailValidator.fulfills( Validator );

/**
 * An element representation of a field.
 * @ctor
 * The constructor.
 * @tparam Object element the element to observe
 * @tparam Validator validator the validator of the element
 */
function ValidatingFieldElement(element, validator)
{
    element.fieldReference = this;
    element.onChange = function () {
        this.fieldReference.callback();
    }
    element.bgColor = "#FF0000";
    this.validator = validator;
    this.element = element;
}
function ValidatingFieldElement_callback()
{
    this.element.bgColor = 
        this.validator.validate( this.element.value ) ? "#00FF00" : "#FF0000";
}
ValidatingFieldElement.prototype.callback = ValidatingFieldElement_callback;
