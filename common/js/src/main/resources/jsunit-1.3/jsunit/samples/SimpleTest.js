/*
JsUnit - a JUnit port for JavaScript
Copyright (C) 1999,2000,2001,2002,2003,2007 Joerg Schaible

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
 * Some simple tests.
 */
function SimpleTest(name)
{
    TestCase.call( this, name );
}
function SimpleTest_setUp()
{
    this.fValue1= 2;
    this.fValue2= 3;
}
function SimpleTest_testAdd()
{
    var result = this.fValue1 + this.fValue2;
    // forced failure result == 5
    this.assertEquals( 6, result );
}
function SimpleTest_testDivideByZero()
{
    var zero = 0;
    this.assertEquals( "Infinity", 8/zero );
}
function SimpleTest_testAsserts()
{
    this.assertTrue( true );
    this.assertFalse( false );
    this.assertEquals( 1, this.fValue2 - this.fValue1 );
    this.assertNull( null );
    this.assertNotNull( this.fValue1 );
    this.assertUndefined();
    this.assertNotUndefined( true );
    this.assertSame( this, this );
    this.assertNotSame( 
        new Number( this.fValue1 ), new Number( this.fValue1 ));
}
function SimpleTest_testExceptions()
{
    for(;;)
    {
        try
        {
            var x = y;
        }
        catch( ex ) 
        {
            break;
        }
        this.fail( "Exception should have been raised", new CallStack());
    }
}
SimpleTest.prototype = new TestCase();
SimpleTest.glue();


function SimpleTestSuite()
{
    TestSuite.call( this, "SimpleTestSuite" );
    this.addTestSuite( SimpleTest );
}
SimpleTestSuite.prototype = new TestSuite();
SimpleTestSuite.prototype.suite = function () { return new SimpleTestSuite(); }

