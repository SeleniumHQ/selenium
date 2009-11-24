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
 * @file
 * Test unit classes for a Netscape Server environment.
 * This file contains extensions for the test unit framework especially for 
 * output of the results at a Netscape Server.
 */

/**
 * PrinterWriter for an application running test suites with the Netscape 
 * Server.
 */
function NSServerWriter()
{
}
/** 
 * \internal 
 */
function NSServerWriter__flush( str )
{
    print( str ); 
}
NSServerWriter.prototype = new PrinterWriter();
NSServerWriter.prototype._flush = NSServerWriter__flush;


/**
 * Class for an application running test suites with a Netscape Server.
 * @see TextTestRunner
 * @see NSServerWriter
 * @deprecated since 1.2 in favour of TextTestRunner in combination with a 
 * NSServerWriter.
 */
function NSServerTestRunner()
{
    TextTestRunner.call( this );
}
/**
 * Write a header starting the application.
 * @deprecated since 1.2
 */
function NSServerTestRunner_printHeader()
{
    write( "<pre>" );
    TextTestRunner.prototype.printHeader.call( this );
}
/**
 * Write a footer at application end with a summary of the tests.
 * @tparam TestResult result The result of the test run.
 * @deprecated since 1.2
 */
function NSServerTestRunner_printFooter( result )
{
    TextTestRunner.prototype.printFooter.call( this, result );
    write( "</pre>" );
}
/**
 * Write a line of text to the console to the browser window.
 * @tparam String str The text to print on the line.
 * @deprecated since 1.2
 */
function NSServerTestRunner_writeLn( str ) { write( str + "\n" ); }

NSServerTestRunner.prototype = new TextTestRunner();
NSServerTestRunner.prototype.printHeader = NSServerTestRunner_printHeader;
NSServerTestRunner.prototype.printFooter = NSServerTestRunner_printFooter;
NSServerTestRunner.prototype.writeLn = NSServerTestRunner_writeLn;

