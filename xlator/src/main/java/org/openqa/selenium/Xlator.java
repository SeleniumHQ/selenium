package org.openqa.selenium;

import java.io.*;

import org.mozilla.javascript.*;

/**
 * Xlator
 *
 */
public class Xlator 
{
    public static void main( String[] args ) throws Exception
    {
        // Creates and enters a Context. The Context stores information
        // about the execution environment of a script.
        Context cx = Context.enter();
        try {
            // Initialize the standard objects (Object, Function, etc.)
            // This must be done before scripts can be executed. Returns
            // a scope object that we use in later calls.
            Scriptable javaFormatterScope = cx.initStandardObjects();

            Scriptable htmlFormatterScope = cx.initStandardObjects();
            
            loadJSSource(cx, htmlFormatterScope, "C:\\svn\\selenium-ide\\trunk\\src\\content\\formats\\html.js");
            loadJSSource(cx, htmlFormatterScope, "C:\\svn\\selenium-ide\\trunk\\src\\content\\testCase.js");
            loadJSSource(cx, htmlFormatterScope, "C:\\svn\\selenium-ide\\trunk\\src\\content\\tools.js");
            
//          add window.editor.seleniumAPI
            Scriptable javaScopeSeleniumAPI = (Scriptable) cx.evaluateString(javaFormatterScope, "window = new Object(); window.editor = new Object(); window.editor.seleniumAPI = new Object();", "<JavaEval>", 1, null);
            loadJSSource(cx, javaScopeSeleniumAPI, "C:\\svn\\selenium\\trunk\\code\\javascript\\core\\scripts\\selenium-api.js");
            
            Scriptable htmlScopeSeleniumAPI = (Scriptable) cx.evaluateString(htmlFormatterScope, "window = new Object(); window.editor = new Object(); window.editor.seleniumAPI = new Object();", "<JavaEval>", 1, null);
            loadJSSource(cx, htmlScopeSeleniumAPI, "C:\\svn\\selenium\\trunk\\code\\javascript\\core\\scripts\\selenium-api.js");
            
            loadJSSource(cx, javaFormatterScope, "C:\\svn\\selenium-ide\\trunk\\src\\content\\formats\\merged-java-rc.js");
            loadJSSource(cx, javaFormatterScope, "C:\\svn\\selenium-ide\\trunk\\src\\content\\testCase.js");
            loadJSSource(cx, javaFormatterScope, "C:\\svn\\selenium-ide\\trunk\\src\\content\\tools.js");
            
            String htmlSource = loadFile("C:\\svn\\selenium\\trunk\\code\\javascript\\tests\\TestClick.html");
            
            // add log.debug
            cx.evaluateString(htmlFormatterScope, "log = new Object(); log.debug = function(msg) { }", "<JavaEval>", 1, null);
            
            Function parse = getFunction(htmlFormatterScope, "parse");
            Scriptable myTestCase = cx.newObject(htmlFormatterScope);
            parse.call(cx, htmlFormatterScope, htmlFormatterScope, new Object[] {myTestCase, htmlSource});
            
            
            
//            ScriptableObject.defineClass(javaFormatterScope, JSSeleniumCommand.class);
//            Object[] commandArgs = new Object[] {"type", "q", "hello world"};
//            Scriptable myCommand = cx.newObject(javaFormatterScope, JSSeleniumCommand.class.getName(), commandArgs);
            
            Function format = getFunction(javaFormatterScope, "format");
            Object result = format.call(cx, javaFormatterScope, javaFormatterScope, new Object[] {myTestCase, "foo"});
            
//            Function f = getFunction(javaFormatterScope, "formatCommands");
//            Object result = f.call(cx, javaFormatterScope, javaFormatterScope, new Object[] {new Object[] {myCommand}});
            System.out.println(result);

        } finally {
            // Exit from the context.
            Context.exit();
        }
    }
    
    public static String loadFile(String fileName) throws IOException {
        Reader is = new FileReader(fileName);
        StringBuffer sb = new StringBuffer( );
        char[] b = new char[8192];
        int n;

        // Read a block. If it gets any chars, append them.
        while ((n = is.read(b)) > 0) {
            sb.append(b, 0, n);
        }

        // Only construct the String object once, here.
        return sb.toString( );
    }
    
    public static void loadJSSource(Context cx, Scriptable scope, String fileName) throws IOException {
        String source = loadFile(fileName);
        cx.evaluateString(scope, source, fileName, 1, null);
    }
    
    public static Function getFunction(Scriptable scope, String functionName) {
        Object fObj = scope.get(functionName, scope);
        if (!(fObj instanceof Function)) {
            throw new RuntimeException(functionName + " is undefined or not a function.");
        } else {
            return (Function) fObj;
        }
    }
}
