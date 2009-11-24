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

if( !this.JsUtil )
{
    if( this.WScript )
    {
        var fso = new ActiveXObject( "Scripting.FileSystemObject" );
        var file = fso.OpenTextFile( "../lib/JsUtil.js", 1 );
        var all = file.ReadAll();
        file.Close();
        eval( all );
    }
    else
        load( "../lib/JsUtil.js" );
    
    eval( JsUtil.prototype.include( "../lib/JsUnit.js" ));
    eval( JsUtil.prototype.include( "ArrayTest.js" ));
    eval( JsUtil.prototype.include( "demo/Demo.js" ));
    eval( JsUtil.prototype.include( "demo/DemoTest.js" ));
    eval( JsUtil.prototype.include( "money/IMoney.js" ));
    eval( JsUtil.prototype.include( "money/Money.js" ));
    eval( JsUtil.prototype.include( "money/MoneyBag.js" ));
    eval( JsUtil.prototype.include( "money/MoneyTest.js" ));
    eval( JsUtil.prototype.include( "SimpleTest.js" ));
}

function AllTests()
{
    TestSuite.call( this, "AllTests" );
}
function AllTests_suite()
{
    var suite = new AllTests();
    suite.addTest( ArrayTestSuite.prototype.suite());
    suite.addTest( MoneyTestSuite.prototype.suite());
    suite.addTest( SimpleTestSuite.prototype.suite());
    return suite;
}
AllTests.prototype = new TestSuite();
AllTests.prototype.suite = AllTests_suite;

var args;
if( this.WScript )
{
    args = new Array();
    for( var i = 0; i < WScript.Arguments.Count(); ++i )
        args[i] = WScript.Arguments( i );
}
else if( this.arguments )
    args = arguments;
else
    args = new Array();
    
var result = TextTestRunner.prototype.main( args );
JsUtil.prototype.quit( result );

