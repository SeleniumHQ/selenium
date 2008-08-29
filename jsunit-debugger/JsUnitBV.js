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
 * Test unit classes for BroadVision environment.
 * This file contains extensions for the test unit framework especially 
 * for BroadVision
 */

/**
 * Class for an application running test suites with the BroadVision ctxdriver
 * and console output.
 */
function CtxWriter()
{
}
/** 
 * \internal 
 */
function CtxWriter__flush( str )
{
    print( str.substring( 0, str.length - 1 )); 
}
CtxWriter.prototype = new PrinterWriter();
CtxWriter.prototype._flush = CtxWriter__flush;


/**
 * Class for an application running test suites with the BroadVision ctxdriver 
 * and console output.
 * @see TextTestRunner
 * @see CtxWriter
 * @deprecated since 1.2 in favour of TextTestRunner in combination with a 
 * CtxWriter.
 */
function CtxTestRunner()
{
    TextTestRunner.call( this );
}
/**
 * Write a line of text to the browser window.
 * @tparam String str The text to print on the line.
 * @deprecated since 1.2
 */
function CtxTestRunner_writeLn( str ) { print( str ); }

CtxTestRunner.prototype = new TextTestRunner();
CtxTestRunner.prototype.writeLn = CtxTestRunner_writeLn;

