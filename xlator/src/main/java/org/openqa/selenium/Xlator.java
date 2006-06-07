package org.openqa.selenium;

import java.io.*;

import org.mozilla.javascript.*;

/**
 * Xlator
 *
 */
public class Xlator 
{
    
    private static int LOG_LEVEL = 1;
    private static String _outputFormat;
    private static File _testCaseHTML;
    private static File _outputFile;

    public static void main( String[] args ) throws Exception
    {
        parseArgs(args);
        String output = xlateTestCase(_outputFormat, Xlator.loadFile(_testCaseHTML));
        if (_outputFile == null) {
            System.out.println(output);
        } else {
            FileWriter fw = new FileWriter(_outputFile);
            fw.write(output);
            fw.flush();
            fw.close();
        }
    }
    
    private static void parseArgs(String[] args) {
        if (args.length < 2) {
            System.err.println("usage: Xlator <formatter> <input.html> [output]\n" +
                    "example: Xlator java-rc c:\\my\\TestFoo.html\n");
            System.exit(1);
        }
        int i = 0;
        _outputFormat = args[i++];
        _testCaseHTML = new File(args[i++]);
        if (args.length == 3) {
            _outputFile = new File(args[i++]);
        }
    }

    public static String xlateTestCase(String outputFormat, String htmlSource) throws IOException {
        Context cx = Context.enter();
        try {
            Scriptable scope = cx.initStandardObjects();
            loadJSSource(cx, scope, "/content/formats/html.js");
            loadJSSource(cx, scope, "/content/testCase.js");
            loadJSSource(cx, scope, "/content/tools.js");
            
//          add window.editor.seleniumAPI
            Scriptable seleniumAPI = (Scriptable) cx.evaluateString(scope, "window = new Object(); window.editor = new Object(); window.editor.seleniumAPI = new Object();", "<JavaEval>", 1, null);
            loadJSSource(cx, seleniumAPI, "/core/scripts/selenium-api.js");
            
            // add log.debug
            cx.evaluateString(scope, "log = new Object(); log.debug = function(msg) { " +
                    (LOG_LEVEL > 1 ? "java.lang.System.out.println('DEBUG: ' + msg); " : "") +
                    "}", "<JavaEval>", 1, null);
            
            Function parse = getFunction(scope, "parse");
            Scriptable myTestCase = cx.newObject(scope);
            parse.call(cx, scope, scope, new Object[] {myTestCase, htmlSource});

            Object wrappedResourceLoader = Context.javaToJS(new ResourceLoader(cx, scope), scope);
            ScriptableObject.putProperty(scope, "resourceLoader", wrappedResourceLoader);
            cx.evaluateString(scope, "function load(name) { " +
                    "var source = resourceLoader.evalResource('/content/formats/' + name);" +
                    "}", "<JavaEval>", 1, null);
            
            loadJSSource(cx, scope, "/content/formats/" + outputFormat + ".js");
            
            Function format = getFunction(scope, "format");
            Object result = format.call(cx, scope, scope, new Object[] {myTestCase, "foo"});
            
            return (String) result;

        } finally {
            // Exit from the context.
            Context.exit();
        }
    }
    
    private static String loadFile(File file) throws IOException {
        Reader is = new FileReader(file);
        return readerToString(is);
    }

    static String readerToString(Reader is) throws IOException {
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
    
    private static void loadJSSource(Context cx, Scriptable scope, String fileName) throws IOException {
        String source = Xlator.loadResource(fileName);
        cx.evaluateString(scope, source, fileName, 1, null);
    }
    
    private static Function getFunction(Scriptable scope, String functionName) {
        Object fObj = scope.get(functionName, scope);
        if (!(fObj instanceof Function)) {
            throw new RuntimeException(functionName + " is undefined or not a function.");
        } else {
            return (Function) fObj;
        }
    }

    static String loadResource(String resourceName) throws IOException {
        InputStream stream = Xlator.class.getResourceAsStream(resourceName);
        if (stream == null) throw new RuntimeException("Couldn't find resource " + resourceName);
        InputStreamReader reader = new InputStreamReader(stream);
        return readerToString(reader);
    }
}
