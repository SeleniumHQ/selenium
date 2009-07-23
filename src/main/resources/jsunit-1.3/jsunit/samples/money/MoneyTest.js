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

function MoneyTest( name )
{
    TestCase.call( this, name );
}   
function MoneyTest_setUp()
{
    this.f12CHF = new Money(12, "CHF");
    this.f14CHF = new Money(14, "CHF");
    this.f7USD = new Money(7, "USD");
    this.f21USD = new Money(21, "USD");
    this.fMB1 = MoneyBag.prototype.create(this.f12CHF, this.f7USD);
    this.fMB2 = MoneyBag.prototype.create(this.f14CHF, this.f21USD);
}
function MoneyTest_testBagMultiply()
{
    // {[12 CHF][7 USD]} *2 == {[24 CHF][14 USD]}
    var expected = MoneyBag.prototype.create( 
        new Money( 24, "CHF" ), new Money( 14, "USD" ));
    this.assertTrue( expected.equals( this.fMB1.multiply( 2 ))); 
    this.assertTrue( this.fMB1.equals( this.fMB1.multiply( 1 )));
    this.assertTrue( this.fMB1.multiply( 0 ).isZero());
}
function MoneyTest_testBagNegate()
{
    // {[12 CHF][7 USD]} negate == {[-12 CHF][-7 USD]}
    var expected = MoneyBag.prototype.create( 
        new Money( -12, "CHF" ), new Money( -7, "USD" ));
    this.assertTrue( expected.equals( this.fMB1.negate()));
}
function MoneyTest_testBagSimpleAdd()
{
    // {[12 CHF][7 USD]} + [14 CHF] == {[26 CHF][7 USD]}
    var expected = MoneyBag.prototype.create( 
        new Money( 26, "CHF" ), new Money( 7, "USD" ));
    this.assertTrue( expected.equals( this.fMB1.add( this.f14CHF )));
}
function MoneyTest_testBagSubtract()
{
    // {[12 CHF][7 USD]} - {[14 CHF][21 USD] == {[-2 CHF][-14 USD]}
    var expected = MoneyBag.prototype.create( 
        new Money( -2, "CHF" ), new Money( -14, "USD" ));
    this.assertTrue( expected.equals( this.fMB1.subtract( this.fMB2 )));
}
function MoneyTest_testBagSumAdd()
{
    // {[12 CHF][7 USD]} + {[14 CHF][21 USD]} == {[26 CHF][28 USD]}
    var expected = MoneyBag.prototype.create( 
        new Money( 26, "CHF" ), new Money( 28, "USD" ));
    this.assertTrue( expected.equals( this.fMB1.add( this.fMB2 )));
}
function MoneyTest_testIsZero()
{
    this.assertTrue( this.fMB1.subtract( this.fMB1 ).isZero()); 
    this.assertTrue( MoneyBag.prototype.create( 
        new Money( 0, "CHF" ), new Money( 0, "USD" )).isZero());
}
function MoneyTest_testMixedSimpleAdd()
{
    // [12 CHF] + [7 USD] == {[12 CHF][7 USD]}
    var expected = MoneyBag.prototype.create( this.f12CHF, this.f7USD );
    this.assertTrue( expected.equals( this.f12CHF.add( this.f7USD )));
}
function MoneyTest_testMoneyBagEquals()
{
    this.assertFalse( this.fMB1.equals( null )); 

    this.assertTrue( this.fMB1.equals( this.fMB1 ));
    var equal = MoneyBag.prototype.create( 
        new Money( 12, "CHF" ), new Money( 7, "USD" ));
    this.assertTrue( this.fMB1.equals( equal ));
    this.assertFalse( this.fMB1.equals( this.f12CHF ));
    this.assertFalse( this.f12CHF.equals( this.fMB1 ));
    this.assertFalse( this.fMB1.equals( this.fMB2 ));
}
/* 
function MoneyTest_testMoneyBagHash()
{
    var equal = MoneyBag.prototype.create( 
        new Money( 12, "CHF" ), new Money( 7, "USD" ));
    this.assertEquals( this.fMB1.hashCode(), equal.hashCode());
} 
*/
function MoneyTest_testMoneyEquals()
{
    this.assertFalse( this.f12CHF.equals( null )); 
    var equalMoney = new Money( 12, "CHF" );
    this.assertTrue( this.f12CHF.equals( this.f12CHF ));
    this.assertTrue( this.f12CHF.equals( equalMoney ));
    //this.assertEquals( this.f12CHF.hashCode(), equalMoney.hashCode());
    this.assertFalse( this.f12CHF.equals( this.f14CHF ));
}
/* 
function MoneyTest_testMoneyHash()
{
    this.assertFalse( this.f12CHF.equals( null )); 
    var equal= new Money( 12, "CHF" );
    this.assertEquals( this.f12CHF.hashCode(), equal.hashCode());
} 
*/
function MoneyTest_testSimplify()
{
    var moneyBag = MoneyBag.prototype.create( 
        new Money( 26, "CHF" ), new Money( 28, "CHF" ));
    var expected = new Money( 54, "CHF" );
    this.assertTrue( expected.equals( moneyBag ));
}
function MoneyTest_testNormalize2()
{
    // {[12 CHF][7 USD]} - [12 CHF] == [7 USD]
    var expected = new Money( 7, "USD" );
    this.assertTrue( expected.equals( this.fMB1.subtract( this.f12CHF )));
}
function MoneyTest_testNormalize3()
{
    // {[12 CHF][7 USD]} - {[12 CHF][3 USD]} == [4 USD]
    var ms1 = MoneyBag.prototype.create( 
        new Money( 12, "CHF" ), new Money( 3, "USD" ));
    var expected = new Money( 4, "USD" );
    this.assertTrue( expected.equals( this.fMB1.subtract( ms1 )));
}
function MoneyTest_testNormalize4()
{
    // [12 CHF] - {[12 CHF][3 USD]} == [-3 USD]
    var ms1 = MoneyBag.prototype.create( 
        new Money( 12, "CHF" ), new Money( 3, "USD" ));
    var expected = new Money( -3, "USD" );
    this.assertTrue( expected.equals( this.f12CHF.subtract( ms1 )));
}
function MoneyTest_testPrint()
{
    this.assertEquals( "[12 CHF]", this.f12CHF.toString());
}
function MoneyTest_testSimpleAdd()
{
    // [12 CHF] + [14 CHF] == [26 CHF]
    var expected = new Money( 26, "CHF" );
    this.assertEquals( expected.toString(), 
        this.f12CHF.add( this.f14CHF ).toString());
}
function MoneyTest_testSimpleBagAdd()
{
    // [14 CHF] + {[12 CHF][7 USD]} == {[26 CHF][7 USD]}
    var expected = MoneyBag.prototype.create( 
        new Money( 26, "CHF" ), new Money( 7, "USD" ));
    this.assertTrue( expected.equals( this.f14CHF.add( this.fMB1 )));
}
function MoneyTest_testSimpleMultiply()
{
    // [14 CHF] *2 == [28 CHF]
    var expected = new Money( 28, "CHF" );
    this.assertEquals( expected.toString(), 
        this.f14CHF.multiply( 2 ).toString());
}
function MoneyTest_testSimpleNegate()
{
    // [14 CHF] negate == [-14 CHF]
    var expected= new Money( -14, "CHF" );
    this.assertEquals( expected.toString(), 
        this.f14CHF.negate().toString());
}
function MoneyTest_testSimpleSubtract()
{
    // [14 CHF] - [12 CHF] == [2 CHF]
    var expected= new Money( 2, "CHF" );
    this.assertEquals( expected.toString(), 
        this.f14CHF.subtract( this.f12CHF ).toString());
}
MoneyTest.prototype = new TestCase();
MoneyTest.prototype.setUp = MoneyTest_setUp;
MoneyTest.prototype.testBagMultiply = MoneyTest_testBagMultiply;
MoneyTest.prototype.testBagNegate = MoneyTest_testBagNegate;
MoneyTest.prototype.testBagSimpleAdd = MoneyTest_testBagSimpleAdd;
MoneyTest.prototype.testBagSubtract = MoneyTest_testBagSubtract;
MoneyTest.prototype.testBagSumAdd = MoneyTest_testBagSumAdd;
MoneyTest.prototype.testIsZero = MoneyTest_testIsZero;
MoneyTest.prototype.testMixedSimpleAdd = MoneyTest_testMixedSimpleAdd;
MoneyTest.prototype.testMoneyBagEquals = MoneyTest_testMoneyBagEquals;
// MoneyTest.prototype.testMoneyBagHash = MoneyTest_testMoneyBagHash;
MoneyTest.prototype.testMoneyEquals = MoneyTest_testMoneyEquals;
// MoneyTest.prototype.testMoneyHash = MoneyTest_testMoneyHash;
MoneyTest.prototype.testSimplify = MoneyTest_testSimplify;
MoneyTest.prototype.testNormalize2 = MoneyTest_testNormalize2;
MoneyTest.prototype.testNormalize3 = MoneyTest_testNormalize3;
MoneyTest.prototype.testNormalize4 = MoneyTest_testNormalize4;
MoneyTest.prototype.testPrint = MoneyTest_testPrint;
MoneyTest.prototype.testSimpleAdd = MoneyTest_testSimpleAdd;
MoneyTest.prototype.testSimpleBagAdd = MoneyTest_testSimpleBagAdd;
MoneyTest.prototype.testSimpleMultiply = MoneyTest_testSimpleMultiply;
MoneyTest.prototype.testSimpleNegate = MoneyTest_testSimpleNegate;
MoneyTest.prototype.testSimpleSubtract = MoneyTest_testSimpleSubtract;


function MoneyTestSuite()
{
    TestSuite.call( this, "MoneyTestSuite" );
    this.addTestSuite( MoneyTest );
}
MoneyTestSuite.prototype = new TestSuite();
MoneyTestSuite.prototype.suite = function () { return new MoneyTestSuite(); }

