/*
JsUnit - a JUnit port for JavaScript
Copyright (C) 2006,2007 Joerg Schaible

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
 * Verifies the syntax of an email address.
 * @tparam String email the email address to verify.
 */
function EmailValidatorTest( name )
{
    TestCase.call( this, name );
}
function EmailValidatorTest_testStandardEmail()
{
    this.assertTrue( validateEmailAddress( "john.doe@acme.com" ));
}
function EmailValidatorTest_testEmailToLocalhost()
{
    this.assertTrue( validateEmailAddress( "root@localhost" ));
}
function EmailValidatorTest_testEmailHasAnAtSign()
{
    this.assertFalse( validateEmailAddress( "john.doe.AT.acme.org" ));
}
function EmailValidatorTest_testEmailUsesASCII7Charcters()
{
    this.assertFalse( validateEmailAddress( "jörg@localhost" ));
}
function EmailValidatorTest_testDomainHasARoot()
{
    this.assertFalse( validateEmailAddress( "john.doe@noroot" ));
}
function EmailValidatorTest_testDomainRootHasAtLeastTwoCharacters()
{
    this.assertFalse( validateEmailAddress( "john.doe@test.x" ));
}
function EmailValidatorTest_testNameMayNotEndWithDot()
{
    this.assertFalse( validateEmailAddress( "john.@test.x" ));
}
function EmailValidatorTest_testNameMayNotStartWithDot()
{
    this.assertFalse( validateEmailAddress( ".doe@test.x" ));
}
function EmailValidatorTest_testNameMustExist()
{
    this.assertFalse( validateEmailAddress( "@test.x" ));
}
function EmailValidatorTest_testDomainMustExist()
{
    this.assertFalse( validateEmailAddress( "joehn.doe@" ));
}
function EmailValidatorTest_testUndefinedArgumentAsAddress()
{
    this.assertFalse( validateEmailAddress());
}
function EmailValidatorTest_testEmptyAddress()
{
    this.assertFalse( validateEmailAddress( "" ));
}
EmailValidatorTest.prototype = new TestCase();
EmailValidatorTest.glue();



function ValidatingElementTest( name )
{
    TestCase.call( this, name );
}
function ValidatingElementTest_testWithEmailValidator()
{
    var element = new Object();
    var validator = new EmailValidator();
    var field = new ValidatingFieldElement( element, validator );

    this.assertEquals("#FF0000", element.bgColor);
    element.value = "john.doe@acme.org";
    element.onChange();
    this.assertEquals("#00FF00", element.bgColor);
}
function ValidatingElementTest_testWithMock()
{
    var element = new Object();
    var validator = new Validator();
    validator.validate = function ()
    {
        Assert.prototype.assertEquals("demo");
        this.wasCalled = true;
    }
    var field = new ValidatingFieldElement( element, validator );

    element.value = "demo";
    element.onChange();
    this.assertTrue(validator.wasCalled);
}
ValidatingElementTest.prototype = new TestCase();
ValidatingElementTest.glue();



function ObjectProvidingTest( name )
{
    TestCase.call( this, name );
}
function ObjectProvidingTest_setUp()
{
    this.writer = new StringWriter();
    this.printer = new XMLResultPrinter( this.writer );
}
function ObjectProvidingTest_testPrint()
{
    var xml = '<?xml version="1.0" encoding="ISO-8859-1" ?>\n'
        +  '<testsuite errors="0" failures="0" name="TestSuite" tests="1" time="1.1">\n'
        +  '    <testcase name="TestCase1" time="0.2"/>\n'
        +  '</testsuite>\n';
    var result = new TestResult();
    result.runCount = function() { return 1; }
    this.printer.mSuite = "TestSuite";
    var test = new Object();
    test.mName = "TestCase1";
    test.mTime = "0.2";
    this.printer.mTests.push( test );
    this.printer.print( result, 1100 );
    this.assertEquals( xml, this.writer.get());
}
ObjectProvidingTest.prototype = new TestCase();
ObjectProvidingTest.glue();


