package org.openqa.selenium;

import java.io.*;
import java.util.*;
import java.util.logging.Logger;

import javax.xml.parsers.*;

import org.mozilla.javascript.*;
import org.w3c.dom.*;

/**
 * Xlator
 *
 */
public class Xlator 
{
    
    private static final String PROPERTY_PREFIX = "selenium.options.";

    public static void main( String[] args ) throws Exception
    {
        if (args.length < 3) {
            System.err.println("usage: Xlator <formatter> <input.html> <baseUrl> [output]\n" +
                    "example: Xlator java-rc c:\\my\\TestFoo.html http://foo.com\n");
            System.exit(1);
        }
        int i = 0;
        String outputFormat = args[i++];
        File testCaseHTML = new File(args[i++]);
        String baseUrl = args[i++];
        File outputFile = null;
        if (args.length == 3) {
            outputFile = new File(args[i++]);
        }
        HashMap<String, String> options = extractOptions();
        String testName = extractTestName(testCaseHTML);
        String output = xlateTestCase(testName, baseUrl, outputFormat, Xlator.loadFile(testCaseHTML), options, null);
        if (outputFile == null) {
            System.out.println(output);
        } else {
            FileWriter fw = new FileWriter(outputFile);
            fw.write(output);
            fw.flush();
            fw.close();
        }
    }
    
    public static HashMap<String, String> extractOptions() {
        HashMap<String, String> options = new HashMap<String, String>();
        for (Object o : System.getProperties().keySet()) {
            String key = (String) o;
            if (key.startsWith(PROPERTY_PREFIX)) {
                String optionName = key.substring(PROPERTY_PREFIX.length());
                options.put(optionName, System.getProperty(key));
            }
        }
        return options;
    }
    
    static String extractTestName(File testFile) {
        int dotIndex = testFile.getName().indexOf('.');
        if (dotIndex == -1) return testFile.getName();
        return testFile.getName().substring(0, dotIndex);
    }

    public static String xlateTestCase(String testName, String baseUrl, String outputFormat, String htmlSource, HashMap<String, String> options, Logger log) throws Exception {
        Context cx = Context.enter();
        try {
            Scriptable scope = cx.initStandardObjects();
            loadJSSource(cx, scope, "/content/xhtml-entities.js");
            loadJSSource(cx, scope, "/content/formats/html.js");
            loadJSSource(cx, scope, "/content/tools.js");
            loadJSSource(cx, scope, "/content/testCase.js");
            
            
//          add window.editor.seleniumAPI
			InputStream stream = Xlator.class.getResourceAsStream("/core/iedoc-core.xml");
            Document apiDoc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(stream);
			stream.close();
			
			Object wrappedAPIDoc = Context.javaToJS(apiDoc, scope);
			Scriptable commandClass = (Scriptable) scope.get("Command", scope);
			ScriptableObject.putProperty(commandClass, "apiDocument", wrappedAPIDoc);

            Scriptable seleniumAPI = (Scriptable) cx.evaluateString(scope, "window = new Object(); window.editor = new Object(); window.editor.seleniumAPI = new Object();", "<JavaEval>", 1, null);
            loadJSSource(cx, seleniumAPI, "/core/scripts/selenium-api.js");
            
            // add logger
            if (log != null) {
                Scriptable logObject = (Scriptable) scope.get("Log", scope);
                ScriptableObject.putProperty(logObject, "rhinoLogger", log);
                cx.evaluateString(scope, "Log.prototype._write = function(msg) { Log.rhinoLogger.info(msg) };", "<JavaEval>", 1, null);
            } else {
                cx.evaluateString(scope, "Log.prototype._write = function(msg) {};", "<JavaEval>", 1, null);
            }
			
            cx.evaluateString(scope, "log = new Log('format');", "<JavaEval>", 1, null);
            
            Function parse = getFunction(scope, "parse");
            Scriptable myTestCase = cx.newObject(scope, "TestCase");
            parse.call(cx, scope, scope, new Object[] {myTestCase, htmlSource});
            
            ScriptableObject.putProperty(myTestCase, "title", testName);
            ScriptableObject.putProperty(myTestCase, "baseURL", baseUrl);

            Object wrappedResourceLoader = Context.javaToJS(new ResourceLoader(cx, scope), scope);
            ScriptableObject.putProperty(scope, "resourceLoader", wrappedResourceLoader);
            cx.evaluateString(scope, "function load(name) { " +
                    "var source = resourceLoader.evalResource('/content/formats/' + name);" +
                    "}", "<JavaEval>", 1, null);
            
            loadJSSource(cx, scope, "/content/formats/" + outputFormat + ".js");
            
            if (options != null) {
                for (String option : options.keySet()) {
                    Scriptable jsOptions = (Scriptable) scope.get("options", scope);
                    ScriptableObject.putProperty(jsOptions, option, options.get(option));
                }
            }
            
            Function format = getFunction(scope, "format");
            Object result = format.call(cx, scope, scope, new Object[] {myTestCase, testName});
            
            return (String) result;

        } finally {
            // Exit from the context.
            Context.exit();
        }
    }
    
    static String loadFile(File file) throws IOException {
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
        }
        return (Function) fObj;
    }

    static String loadResource(String resourceName) throws IOException {
        InputStream stream = Xlator.class.getResourceAsStream(resourceName);
        if (stream == null) throw new RuntimeException("Couldn't find resource " + resourceName);
        InputStreamReader reader = new InputStreamReader(stream);
        return readerToString(reader);
    }
}
