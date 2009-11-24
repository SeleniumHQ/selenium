/*
JsUnit - a JUnit port for JavaScript
Copyright (C) 1999,2000,2001,2002,2003,2006 Joerg Schaible

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
 * A sample test case, testing <code>Array</code> object.
 */
function ArrayTest( name )
{
    TestCase.call( this, name );
}
function ArrayTest_setUp()
{
    this.fEmpty = new Array();
    this.fFull = [1, 2, 3];
}
function ArrayTest_testCapacity() 
{
    var size = this.fFull.length; 
    for( var i = 0; i < 100; i++ )
        this.fFull[size + i] = i;
    this.assertEquals( 100+size, this.fFull.length );
}
function ArrayTest_testConcat() 
{
    for( var i = 0; i < 3; i++ )
        this.fEmpty[i] = i+4;
    var all = this.fFull.concat( this.fEmpty );
    this.assertEquals( "1,2,3,4,5,6", all );
}
function ArrayTest_testJoin() 
{
    this.assertEquals( "1-2-3", this.fFull.join( "-" ));
}
function ArrayTest_testReverse() 
{
    this.assertEquals( "3,2,1", this.fFull.reverse());
}
function ArrayTest_testSlice() 
{
    this.assertEquals( "2,3", this.fFull.slice( 1 ));
    this.assertEquals( "2", this.fFull.slice( 1, 2 ));
    this.assertEquals( "1,2", this.fFull.slice( 0, -1 ));
}
function ArrayTest_testSort() 
{
    for( var i = 0; i < 3; i++ )
        this.fEmpty[i] = i+4;
    var all = this.fEmpty.concat( this.fFull );
    this.assertEquals( "1,2,3,4,5,6", all.sort());
}
ArrayTest.prototype = new TestCase();
ArrayTest.prototype.setUp = ArrayTest_setUp;
ArrayTest.prototype.testCapacity = ArrayTest_testCapacity;
ArrayTest.prototype.testConcat = ArrayTest_testConcat;
ArrayTest.prototype.testJoin = ArrayTest_testJoin;
ArrayTest.prototype.testReverse = ArrayTest_testReverse;
ArrayTest.prototype.testSlice = ArrayTest_testSlice;
ArrayTest.prototype.testSort = ArrayTest_testSort;

function ArrayTestSuite()
{
    TestSuite.call( this, "ArrayTestSuite" );
    this.addTestSuite( ArrayTest );
}
ArrayTestSuite.prototype = new TestSuite();
ArrayTestSuite.prototype.suite = function () { return new ArrayTestSuite(); }

