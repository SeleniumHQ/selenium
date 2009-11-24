/*
JsUnit - a JUnit port for JavaScript
Copyright (C) 1999,2000,2001,2002,2003,2006,2007 Joerg Schaible

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
 * Utility classes needed for the JsUnit classes.
 * JsUnit need several helper classes to work properly. This file contains
 * anything that is not related directly to JsUnit, but may be useful in other
 * environments, too.
 */


if( !this.Error )
{
    /**
     * Error class according ECMA specification.
     * This class is only active, if the ECMA implementation of the current
     * engine does not support it.
     * @ctor
     * Constructor.
     * The constructor initializes the \c message member with the argument 
     * \a msg.
     * \attention The ECMA standard does not ensure, that the constructor
     * of the internal Error class may be called by derived objects. It will
     * normally return a new Error instance if called as function.
     * @tparam String msg The error message.
     */
    function Error( msg )
    {
        if( this instanceof Error )
        {
            /**
             * The error message.
             * @type String
             */
            this.message = msg || "";
            return;
        }
        else
        {
            return new Error( msg );
        }
    }
    /**
     * String representation of the error.
     * @treturn String Returns a \c String containing the Error class name 
     * and the error message.
     * \attention The format of the returned string is not defined by ECMA
     * and is up to the vendor only. This implementation follows the behavior
     * of Mozilla.org's SpiderMonkey.
     */
    function Error_toString()
    {
        var msg = this.message;
        return this.name + ": " + msg;
    }
    Error.prototype = new Object();
    Error.prototype.toString = Error_toString;
    /**
     * The name of the Error class as String.
     * @type String
     */
    Error.prototype.name = "Error";
    /**
     * \internal
     */
    Error.prototype.testable = true;
}
else 
{
    /**
     * \internal
     */
    Error.prototype.testable = false;
}


/**
 * JsUnitError class.
 * Since ECMA does not define any inheritability of the Error class and the
 * class itself is highly vender specific, JsUnit uses its own base class for
 * all errors in the framework.
 * @ctor
 * Constructor.
 * The constructor initializes the \c message member with the argument 
 * \a msg.
 * \attention The ECMA standard does not ensure, that the constructor
 * of the internal Error class may be called by derived objects. It will
 * normally return a new Error instance if called as function.
 * @tparam String msg The error message.
 * \attention This constructor may <b>not</b> be called as normal function.
 */
function JsUnitError( msg )
{
    this.message = msg || "";   
}
/**
 * String representation of the error.
 * The format of the returned string is not defined by ECMA
 * and is up to the vendor only. This implementation follows the behavior
 * of Mozilla.org's SpiderMonkey.
 * @treturn String Returns a \c String containing the Error class name 
 * and the error message.
 */
function JsUnitError_toString()
{
    var msg = this.message;
    return this.name + ": " + msg;
}
JsUnitError.prototype = new Error();
JsUnitError.prototype.toString = JsUnitError_toString;
/**
 * The name of the Error class as String.
 * @type String
 */
JsUnitError.prototype.name = "JsUnitError";


/**
 * InterfaceDefinitionError class.
 * This error class is used for interface definitions. Such definitions are 
 * simulated using Function::fulfills. The class has no explicit functionality
 * despite the separate type
 * @see Function::fulfills
 * @ctor
 * Constructor.
 * The constructor initializes the \c message member with the argument 
 * \a msg.
 * @tparam String msg The error message.
 **/
function InterfaceDefinitionError( msg )
{
    JsUnitError.call( this, msg );
}
InterfaceDefinitionError.prototype = new JsUnitError();
/**
 * The name of the InterfaceDefinitionError class as String.
 * @type String
 **/
InterfaceDefinitionError.prototype.name = "InterfaceDefinitionError";


/**
 * FunctionGluingError class.
 * This error class is used for gluing member functions to a class. This convenience
 * functionality of Function::glue ensures by throwing an instance of this class, that
 * only valid functions are injected to the prototype. The class has no explicit 
 * functionality despite the separate type
 * @see Function::glue
 * @ctor
 * Constructor.
 * The constructor initializes the \c message member with the argument 
 * \a msg.
 * @tparam String msg The error message.
 **/
function FunctionGluingError( msg )
{
    JsUnitError.call( this, msg );
}
FunctionGluingError.prototype = new JsUnitError();
/**
 * The name of the FunctionGluingError class as String.
 * @type String
 **/
FunctionGluingError.prototype.name = "FunctionGluingError";


/**
 * \class Function
 * Standard ECMA class.
 * \docgen function Function() {}
 */
/**
 * Ensures that a function fulfills an interface.
 * Since with ECMA 262 (3rd edition) interfaces are not supported yet, this
 * function will simulate the functionality. The arguments for the functions
 * are all classes that the current class will implement. The function checks
 * whether the current class fulfills the interface of the given classes or not.
 * @exception TypeError If the current object is not a class or the interface
 * is not a Function object with a prototype.
 * @exception InterfaceDefinitionError If an interface is not fulfilled or the 
 * interface has invalid members.
 */
function Function_fulfills()
{
    for( var i = 0; i < arguments.length; ++i )
    {
        var I = arguments[i];
        if( typeof I != "function" || !I.prototype )
            throw new InterfaceDefinitionError( 
                I.toString() + " is not an Interface" );
        if( !this.prototype )
            throw new InterfaceDefinitionError( 
                "Current instance is not a Function definition" );
        for( var f in I.prototype )
        {
            if( typeof I.prototype[f] != "function" )
                throw new InterfaceDefinitionError( f.toString() 
                    + " is not a method in Interface " + I.toString());
            if(    typeof this.prototype[f] != "function" 
                && typeof this[f] != "function" )
            {
                if(    typeof this.prototype[f] == "undefined" 
                    && typeof this[f] == "undefined" )
                    throw new InterfaceDefinitionError( 
                        f.toString() + " is not defined" );
                else
                    throw new InterfaceDefinitionError( 
                        f.toString() + " is not a function" );
            }
        }
    }
}
/**
 * Glue functions to a JavaScript class as member functions.
 * The method attaches the functions given as arguments to the prototype of the
 * current instance.
 * @exception InterfaceDefinitionError If the current instance of a given
 * argument is not a Function object with a prototype.
 */
function Function_glue( scope )
{
    if( !this.prototype )
        throw new FunctionGluingError( 
            "Current instance is not a Function definition" );
    var r = /function (\w+)[^\{\}]*\)/;
    if( !r.exec( this.toString()))
        throw new FunctionGluingError( "Cannot glue to anonymous function" );
    var className = new String( RegExp.$1 );
    if( scope  === undefined )
        scope = JsUtil.prototype.global;
    for( var name in scope ) 
    {
        if( name.indexOf( className + "_" ) == 0 )
        {
            var fnName = name.substr( className.length + 1 );
            var fn = scope[name];
            if( typeof( fn ) == "function" ) 
            {
                if( ! /^[a-z_][\w]*$/.test( fnName ))
                    throw new FunctionGluingError( 
                        "Not a valid method name: " + fnName );
                this.prototype[fnName] = fn;
            }
        }
    }
}
Function.prototype.fulfills = Function_fulfills;
Function.prototype.glue = Function_glue;


// MS engine does not implement Array.push and Array.pop until JScript 5.6
if( !Array.prototype.pop )
{
    /**
     * \class Array
     * Standard ECMA class.
     * \docgen function Array() {}
     */
    /**
     * Pops last element from Array.
     * The function is an implementation of the Array::pop method described
     * in the ECMA standard. It removes the last element of the Array and
     * returns it.
     *
     * The function is active if the ECMA implementation does not implement
     * it (like Microsoft JScript engine up to version 5.5).
     * @treturn Object Last element or undefined
     */
    function Array_pop()
    {
        var obj;
        if( this instanceof Array && this.length > 0 )
        {
            var last = parseInt( this.length ) - 1;
            obj = this[last];
            this.length = last;
        }
        return obj;
    }
    Array.prototype.pop = Array_pop;
}   
if( !Array.prototype.push )
{ 
    /**
     * Pushes elements into Array.
     * The function is an implementation of the Array::push method described
     * in the ECMA standard. It adds all given parameters at the end of the
     * array.
     *
     * The function is active if the ECMA implementation does not implement
     * it (like Microsoft JScript engine up to version 5.5).
     * @treturn Object Number of added elements
     */
    function Array_push()
    {
        var i = 0;
        if( this instanceof Array )
        {
            i = this.length;
            
            // Preallocation of array
            if( arguments.length > 0 )
                this[arguments.length + this.length - 1] = null;
            
            for( ; i < this.length; ++i )
                this[i] = arguments[i - this.length + arguments.length];
        }       
        return i;
    }
    Array.prototype.push = Array_push;
}


/**
 * \class String
 * Standard ECMA class.
 * \docgen function String() {}
 */
/**
 * Trims characters from string.
 * @tparam String chars String with characters to remove.  The character may
 * also be a regular expression character class like "\\s" (which is the 
 * default).
 *
 * The function removes the given characters \a chars from the beginning an 
 * the end from the current string and returns the result. The function will 
 * not modify the current string.
 *
 * The function is written as String enhancement and available as new member 
 * function of the class String.
 * @treturn String String without given characters at start or end.
 */
function String_trim( chars )
{
    if( !chars )
        chars = "\\s";
    var re = new RegExp( "^[" + chars + "]*(.*?)[" + chars + "]*$" );
    var s = this.replace( re, "$1" );
    return s;
}
String.prototype.trim = String_trim;


/**
 * Helper class with static flags.
 */
function JsUtil()
{
}
/** 
 * Retrieve the caller of a function.
 * @tparam Function fn The function to examine.
 * @treturn Function The caller as Function or undefined.
 **/
function JsUtil_getCaller( fn )
{
    switch( typeof( fn ))
    {
        case "undefined":
            return JsUtil_getCaller( JsUtil_getCaller );
            
        case "function":
            if( fn.caller )
                return fn.caller;
            if( fn.arguments && fn.arguments.caller )
                return fn.arguments.caller;
    }
    return undefined;
}
/**
 * Includes a JavaScript file.
 * @tparam String fname The file name.
 * Loads the content of a JavaScript file into a String that has to be
 * evaluated. Works for command line shells WSH, Rhino and SpiderMonkey.
 * @note This function is highly quirky. While WSH works as expected, the
 * Mozilla shells will evaluate the file immediately and add any symbols to
 * the global name space and return just "true". Therefore you have to 
 * evaluate the returned string for WSH at global level also. Otherwise the
 * function is not portable.
 * @treturn String The JavaScript code to be evaluated.
 */
function JsUtil_include( fname )
{
    var ret = "true";
    if( JsUtil.prototype.isMozillaShell || JsUtil.prototype.isKJS )
    {
        load( fname );
    }
    else if( JsUtil.prototype.isWSH )
    {
        var fso = new ActiveXObject( "Scripting.FileSystemObject" );
        var file = fso.OpenTextFile( fname, 1 );
        ret = file.ReadAll();
        file.Close();
    }
    return ret;
}
/**
 * Returns the SystemWriter.
 * Instantiates a SystemWriter depending on the current JavaScript engine.
 * Works for command line shells WSH, Rhino and SpiderMonkey.
 * @type SystemWriter
 */
function JsUtil_getSystemWriter()
{
    if( !JsUtil.prototype.mWriter )
        JsUtil.prototype.mWriter = new SystemWriter();
    return JsUtil.prototype.mWriter;
}
/**
 * Quits the JavaScript engine.
 * @tparam Number ret The exit code.
 * Stops current JavaScript engine and returns an exit code. Works for 
 * command line shells WSH, Rhino and SpiderMonkey.
 */
function JsUtil_quit( ret )
{
    if( JsUtil.prototype.isMozillaShell )
        quit( ret );
    else if( JsUtil.prototype.isKJS )
        exit( ret );
    else if( JsUtil.prototype.isWSH )
        WScript.Quit( ret );
}
JsUtil.prototype.getCaller = JsUtil_getCaller;
JsUtil.prototype.getSystemWriter = JsUtil_getSystemWriter;
JsUtil.prototype.include = JsUtil_include;
JsUtil.prototype.quit = JsUtil_quit;
/**
 * The SystemWriter.
 * @type SystemWriter
 * @see getSystemWriter
 */
JsUtil.prototype.mWriter = null;
/**
 * Flag for a browser.
 * @type Boolean
 * The member is true, if the script runs within a browser environment.
 */
JsUtil.prototype.isBrowser = this.window != null;
/**
 * Flag for Microsoft JScript.
 * @type Boolean
 * The member is true, if the script runs in the Microsoft JScript engine.
 */
JsUtil.prototype.isJScript = this.ScriptEngine != null;
/**
 * Flag for Microsoft Windows Scripting Host.
 * @type Boolean
 * The member is true, if the script runs in the Microsoft Windows Scripting
 * Host.
 */
JsUtil.prototype.isWSH = this.WScript != null;
/**
 * Flag for Microsoft IIS.
 * @type Boolean
 * The member is true, if the script runs in the Microsoft JScript engine.
 */
JsUtil.prototype.isIIS = 
       JsUtil.prototype.isJScript
    && this.Server != null;
/**
 * Flag for Netscape Enterprise Server (iPlanet) engine.
 * @type Boolean
 * The member is true, if the script runs in the iPlanet as SSJS.
 */
JsUtil.prototype.isNSServer = 
       this.Packages != null 
    && !this.importPackage 
    && !JsUtil.prototype.isBrowser;
/**
 * Flag for Rhino.
 * @type Boolean
 * The member is true, if the script runs in an embedded Rhino of Mozilla.org.
 */
JsUtil.prototype.isRhino = 
       this.java != null 
    && this.java.lang != null 
    && this.java.lang.System != null;
/**
 * Flag for a Mozilla JavaScript shell.
 * @type Boolean
 * The member is true, if the script runs in a command line shell of a
 * Mozilla.org script engine (either SpiderMonkey or Rhino).
 */
JsUtil.prototype.isMozillaShell = this.quit != null;
/**
 * Flag for a KJS shell.
 * @type Boolean
 * The member is true, if the script runs in a command line shell of a
 * KDE's script engine.
 */
JsUtil.prototype.isKJS = this.exit != null;
/**
 * Flag for a command line shell.
 * @type Boolean
 * The member is true, if the script runs in a command line shell.
 */
JsUtil.prototype.isShell = 
       JsUtil.prototype.isMozillaShell 
    || JsUtil.prototype.isKJS 
    || JsUtil.prototype.isWSH;
/**
 * Flag for Obtree C4.
 * @type Boolean
 * The member is true, if the script runs in Obtree C4 of IXOS.
 */
JsUtil.prototype.isObtree = this.WebObject != null;
/**
 * Flag for call stack support.
 * @type Boolean
 * The member is true, if the engine provides call stack info.
 */
JsUtil.prototype.hasCallStackSupport = 
       JsUtil.prototype.getCaller() !== undefined;
/**
 * The global object.
 * @type Object
 * The member keeps the execution scope of this file, which is normally the 
 * global object.
 */
JsUtil.prototype.global = this;


/**
 * CallStack object.
 * The object is extremely system dependent, since its functionality is not
 * within the range of ECMA 262, 3rd edition. It is supported by JScript
 * and SpiderMonkey and was supported in Netscape Enterprise Server 2.x, 
 * but not in the newer version 4.x.
 * @ctor
 * Constructor.
 * The object collects the current call stack up to the JavaScript engine.
 * Most engines will not support call stack information with a recursion.
 * Therefore the collection is stopped when the stack has two identical
 * functions in direct sequence.
 * @tparam Number depth Maximum recorded stack depth (defaults to 10).
 **/
function CallStack( depth )
{
    /**
     * The array with the stack. 
     * @type Array<String>
     */
    this.mStack = null;
    if( JsUtil.prototype.hasCallStackSupport )
        this._fill( depth );
}

/**
 * \internal
 */
function CallStack__fill( depth )
{
    this.mStack = new Array();
    
    // set stack depth to default
    if( depth == null )
        depth = 10;

    ++depth;
    var fn = JsUtil.prototype.getCaller( CallStack__fill );
    while( fn != null && depth > 0 )
    {
        var s = new String( fn );
        --depth;

        // Extract function name and argument list
        var r = /function (\w+)([^\{\}]*\))/;
        r.exec( s );
        var f = new String( RegExp.$1 );
        var args = new String( RegExp.$2 );
        this.mStack.push(( f + args ).replace( /\s/g, "" ));

        // Retrieve caller function
        if( fn == JsUtil.prototype.getCaller( fn ))
        {
            // Some interpreter's caller use global objects and may start
            // an endless recursion.
            this.mStack.push( "[JavaScript recursion]" );
            break;
        }
        else
            fn = JsUtil.prototype.getCaller( fn );
    }

    if( fn == null )
        this.mStack.push( "[JavaScript engine]" );

    // remove direct calling function CallStack or CallStack_fill
    this.mStack.shift();
}
/**
 * Fills the object with the current call stack info.
 * The function collects the current call stack up to the JavaScript engine.
 * Any previous data of the instance is lost.
 * Most engines will not support call stack information with a recursion.
 * Therefore the collection is stopped when the stack has two identical
 * functions in direct sequence.
 * @tparam Number depth Maximum recorded stack depth (defaults to 10).
 **/
function CallStack_fill( depth )
{
    this.mStack = null;
    if( JsUtil.prototype.hasCallStackSupport )
        this._fill( depth );
}
/**
 * Retrieve call stack as array.
 * The function returns the call stack as Array of Strings. 
 * @treturn Array<String> The call stack as array of strings.
 **/
function CallStack_getStack()
{
    var a = new Array();
    if( this.mStack != null )
        for( var i = this.mStack.length; i--; )
            a[i] = this.mStack[i];
    return a;
}
/**
 * Retrieve call stack as string.
 * The function returns the call stack as string. Each stack frame has an 
 * own line and is prepended with the call stack depth.
 * @treturn String The call stack as string.
 **/
function CallStack_toString()
{
    var s = "";
    if( this.mStack != null )
        for( var i = 1; i <= this.mStack.length; ++i )
        {
            if( s.length != 0 )
                s += "\n";
            s += i.toString() + ": " + this.mStack[i-1];
        }
    return s;
}
CallStack.prototype._fill = CallStack__fill;
CallStack.prototype.fill = CallStack_fill;
CallStack.prototype.getStack = CallStack_getStack;
CallStack.prototype.toString = CallStack_toString;


/**
 * PrinterWriterError class.
 * This error class is used for errors in the PrinterWriter.
 * @see PrinterWriter::close
 * @ctor
 * Constructor.
 * The constructor initializes the \c message member with the argument 
 * \a msg.
 * @tparam String msg The error message.
 **/
function PrinterWriterError( msg )
{
    JsUnitError.call( this, msg );
}
PrinterWriterError.prototype = new JsUnitError();
/**
 * The name of the PrinterWriterError class as String.
 * @type String
 **/
PrinterWriterError.prototype.name = "PrinterWriterError";


/**
 * A PrinterWriter is an abstract base class for printing text.
 * @note This is a helper construct to support different writers in 
 * ResultPrinter e.g. depending on the JavaScript engine.
 */
function PrinterWriter()
{
    this.mBuffer = null;    
    this.mClosed = false;
}
/**
 * Closes the writer.
 * After closing the steam no further writing is allowed. Multiple calls to
 * close should be allowed.
 */
function PrinterWriter_close() 
{
    this.flush();
    this.mClosed = true;
}
/**
 * Flushes the writer.
 * Writes any buffered data to the underlaying output stream system immediately.
 * @exception PrinterWriterError If flush was called after closing.
 */
function PrinterWriter_flush()
{
    if( !this.mClosed )
    {
        if( this.mBuffer !== null )
        {
            this._flush( this.mBuffer + "\n" );
            this.mBuffer = null;    
        }
    }
    else    
        throw new PrinterWriterError( 
            "'flush' called for closed PrinterWriter." );
}
/**
 * Prints into the writer.
 * @tparam Object data The data to print as String.
 * @exception PrinterWriterError If print was called after closing.
 */
function PrinterWriter_print( data )
{
    if( !this.mClosed )
    {
        var undef;
        if( data === undef || data == null )
            data = "";
        if( this.mBuffer )
            this.mBuffer += data.toString();
        else
            this.mBuffer = data.toString();
    }
    else    
        throw new PrinterWriterError( 
            "'print' called for closed PrinterWriter." );
}
/**
 * Prints a line into the writer.
 * @tparam Object data The data to print as String.
 * @exception PrinterWriterError If println was called after closing.
 */
function PrinterWriter_println( data )
{
    this.print( data );
    this.flush();
}
PrinterWriter.prototype.close = PrinterWriter_close;
PrinterWriter.prototype.flush = PrinterWriter_flush;
PrinterWriter.prototype.print = PrinterWriter_print;
PrinterWriter.prototype.println = PrinterWriter_println;
/** 
 * \internal 
 */
PrinterWriter.prototype._flush = function() {};


/**
 * The PrinterWriter of the JavaScript engine.
 */
function SystemWriter() 
{
    PrinterWriter.call( this );
} 
/**
 * Closes the writer.
 * Function just flushes the writer. Closing the system writer is not possible.
 */
function SystemWriter_close() 
{
    this.flush();
}
/** 
 * \internal 
 */
function SystemWriter__flush( str ) 
{
    /* self-modifying code ... */
    if( JsUtil.prototype.isMozillaShell )
        this._flush = 
            function SystemWriter__flush( str ) 
            { 
                print( str.substring( 0, str.length - 1 )); 
            }
    else if( JsUtil.prototype.isKJS )
        this._flush = 
            function SystemWriter__flush( str ) 
            { 
                print( str ); 
            }
    else if( JsUtil.prototype.isBrowser )
        this._flush = 
            function SystemWriter__flush( str ) 
            { 
                document.write( str );
            }
    else if( JsUtil.prototype.isWSH )
        this._flush = 
            function SystemWriter__flush( str ) 
            { 
                WScript.Echo( str.substring( 0, str.length - 1 )); 
            }
    else if( JsUtil.prototype.isIIS )
        this._flush = 
            function SystemWriter__flush( str ) 
            { 
                Response.write( str ); 
            }
    /*
    else if( JsUtil.prototype.isNSServer )
        this._flush = 
            function SystemWriter__flush( str ) 
            { 
                write( str );
            }
    */
    else if( JsUtil.prototype.isObtree )
        this._flush = 
            function SystemWriter__flush( str ) 
            { 
                write( str ); 
            }
    else
        this._flush = function() {}

    this._flush( str );
}
SystemWriter.prototype = new PrinterWriter();
SystemWriter.prototype.close = SystemWriter_close;
SystemWriter.prototype._flush = SystemWriter__flush;


/**
 * The PrinterWriter into a String.
 */
function StringWriter() 
{
    PrinterWriter.call( this );
    this.mString = "";
} 
/**
 * Returns the written String.
 * The function will close also the stream if it is still open.
 * @type String
 */
function StringWriter_get() 
{
    if( !this.mClosed )
        this.close();
    return this.mString;
}
/** 
 * \internal 
 */
function StringWriter__flush( str )
{
    this.mString += str;
}
StringWriter.prototype = new PrinterWriter();
StringWriter.prototype.get = StringWriter_get;
StringWriter.prototype._flush = StringWriter__flush;


/**
 * A filter for a PrinterWriter encoding HTML.
 * @ctor
 * Constructor.
 * @tparam PrinterWriter writer The writer to filter.
 * The constructor accepts the writer to wrap.
 */
function HTMLWriterFilter( writer )
{
    PrinterWriter.call( this );
    this.setWriter( writer );
}
/**
 * Returns the wrapped PrinterWriter.
 * @type PrinterWriter
 */
function HTMLWriterFilter_getWriter() 
{
    return this.mWriter;
}
/**
 * Sets the PrinterWriter to wrap.
 * @tparam PrinterWriter writer The writer to filter.
 * If the argument is omitted a StringWriter is created and wrapped.
 */
function HTMLWriterFilter_setWriter( writer ) 
{
    this.mWriter = writer ? writer : new StringWriter();
}
/** 
 * \internal 
 */
function HTMLWriterFilter__flush( str )
{
    str = str.toString();
    str = str.replace( /&/g, "&amp;" ); 
    str = str.replace( /</g, "&lt;" ); 
    str = str.replace( />/g, "&gt;" ); 
    str = str.replace( /\'/g, "&apos;" ); 
    str = str.replace( /\"/g, "&quot;" ); 
    str = str.replace( /\n/g, "<br>" );
    this.mWriter._flush( str );
}
HTMLWriterFilter.prototype = new PrinterWriter();
HTMLWriterFilter.prototype.getWriter = HTMLWriterFilter_getWriter;
HTMLWriterFilter.prototype.setWriter = HTMLWriterFilter_setWriter;
HTMLWriterFilter.prototype._flush = HTMLWriterFilter__flush;
