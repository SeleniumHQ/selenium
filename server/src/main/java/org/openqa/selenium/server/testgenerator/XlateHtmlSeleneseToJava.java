/*
 * Created on Mar 12, 2006
 *
 */
package org.openqa.selenium.server.testgenerator;

import java.io.*;
import java.util.*;

import javax.xml.parsers.*;

import org.w3c.dom.*;

/**
 * Given an HTML file containing a Selenese test case, generate equivalent Java code w/ calls
 * to the Selenium object to execute that same test case.
 * 
 *  @author nsproul
 *
 */

public class XlateHtmlSeleneseToJava {
    static Set generatedJavaClassNames = new HashSet();
    
    static final String BEGIN_SELENESE = ">>>>>";
    static final String END_SELENESE   = "<<<<<";
    static final String SELENESE_TOKEN_DIVIDER = "//////";

    static HashMap declaredVariables = new HashMap();

    private static int varNameSeed = 1;

    private static String EOL = "\n\t\t";

    private static int timeOut = 30000;
    private static String domain;

    private static boolean silentMode = false;

    private static boolean dontThrowOnTranslationDifficulties = false;

    private static Map funcTypes = null;

    public static void main(String[] args) throws IOException {
        boolean generateSuite = false;
        if (args.length < 2) {
            Usage("too few args");
            return;
        }
        HashMap skipList = new HashMap();
        String javaSeleneseFileDirectoryName = args[0];
        for (int j = 1; j < args.length; j++) {
            if (args[j].equals("-silent")) {
                silentMode  = true;
            }
            else if (args[j].equals("-skip")) {
                skipList.put(args[++j], Boolean.TRUE);
            }
            else if (args[j].equals("-dontThrowOnTranslationDifficulties")) {
                dontThrowOnTranslationDifficulties = true;
            }
            else if (args[j].equals("-suite")) {
                generateSuite = true;
            }
            else if (args[j].equals("-dir")) {
                String dirName = args[++j];
                File dir = new File(dirName);
                if (!dir.isDirectory()) {
                    Usage("-dir is not a directory: " + dirName);
                }
                String children[] = dir.list();
                for (int k = 0; k < children.length; k++) {
                    String fileName = children[k];
                    if (!skipList.containsKey(fileName) && fileName.indexOf(".htm")!=-1 && fileName.indexOf("Suite")==-1) {
                        generateJavaClassFromSeleneseHtml(dirName + "/" + fileName, javaSeleneseFileDirectoryName);
                    }
                }
            }
            else {
                String htmlSeleneseFileName = args[j];
                generateJavaClassFromSeleneseHtml(htmlSeleneseFileName, javaSeleneseFileDirectoryName);
            }
        }
        if (generateSuite) {
            generateSuite(javaSeleneseFileDirectoryName);
        }
    }
    
    
    private static void generateSuite(String javaSeleneseFileDirectoryName) throws IOException {
        if (generatedJavaClassNames.size()==1) {
            return; // this is a test run focusing on a single file, so a suite wouldn't be useful
        }
        String beginning = "package com.thoughtworks.selenium.corebased;\n" + 
        "\n" + 
        "import junit.framework.Test;\n" + 
        "import junit.framework.TestSuite;\n" +
        "\n" + 
        "public class SeleneseSuite {\n" + 
        "    static public Test suite() {\n" + 
        "        TestSuite suite =  new TestSuite();\n";
        String ending = "        return suite;\n" + 
        "    }\n" + 
        "}\n";
        StringBuffer middle = new StringBuffer();
        Iterator i = generatedJavaClassNames.iterator();
        while (i.hasNext()) {
            String generatedJavaClassName = (String) i.next();
            if (!generatedJavaClassName.equals("TestJavascriptParameters")){
                middle.append("         suite.addTestSuite(")
                .append(generatedJavaClassName)
                .append(".class);\n");            
            }
        }
        WriteFileContents(beginning + middle + ending, openFile(javaSeleneseFileDirectoryName + "/SeleneseSuite.java"));
    }

    private static void generateJavaClassFromSeleneseHtml(String htmlSeleneseFileName, 
            String javaSeleneseFileDirectoryName) throws IOException {
        String base = htmlSeleneseFileName;
        base = base.replaceAll(".*/", "");
        base = base.replaceAll("\\.html?$", "");
        
        String javaSeleneseFileName = javaSeleneseFileDirectoryName + "/" + base + ".java";
        
        generatedJavaClassNames.add(base);
        
        System.out.println("Generating test class " + base + " from\t" 
                + htmlSeleneseFileName + "...");
        
        File htmlSeleneseFile = openFile(htmlSeleneseFileName);
        File javaSeleneseFile = openFile(javaSeleneseFileName);
        
        try {
            javaSeleneseFile.createNewFile();
        } catch (IOException e) {
            Usage(e.toString());
        }

        if (!htmlSeleneseFile.canRead()) {
            Usage("can't read " + htmlSeleneseFileName);
        }
        if (!javaSeleneseFile.canWrite()) {
            Usage("can't write " + javaSeleneseFileName);
        }
        
        
        String htmlSelenese = ReadFileContents(htmlSeleneseFile);
        String javaSelenese = XlateString(base, htmlSeleneseFileName, htmlSelenese);        
        WriteFileContents(javaSelenese, javaSeleneseFile);
    }


    private static void WriteFileContents(String s, File f) throws IOException {
        FileWriter output = new FileWriter(f);
        if (!silentMode) {
            System.out.println(">>>>" + s + "<<<<");
        }
        output.write(s);
        output.close();
    }
    
    protected static String possiblyDeclare(String variableName, String op) {
        if (!declaredVariables.containsKey(variableName)) {
            declaredVariables.put(variableName, variableName);
            if (opIsBoolean(op)) {
                return "boolean " + variableName;
            } else {
                return "String " + variableName;
            }
        }
        return variableName;
    }
    
    private static String XlateString(String base, String htmlSeleneseFileName, String htmlSelenese) {
        declaredVariables.clear();
        domain = null;
        String preamble = "package com.thoughtworks.selenium.corebased;\n" + 
        "import com.thoughtworks.selenium.*;\n" +
        "/**\n" + 
        " * @author XlateHtmlSeleneseToJava\n" +
        " * Generated from " + htmlSeleneseFileName + ".\n" +
        " */\n" + 
        "public class " + base + " extends SeleneseTestCase\n" + 
        "{\n" + 
        "   public void " + makeTestName(base) + "() throws Throwable {\n\t\t";
        
        StringBuffer java = new StringBuffer();
        
        String body = htmlSelenese.replaceAll("[\n]", "");
        body = body.replaceAll("\\s*<", "<");
        body = body.replaceAll("</?em/?>", "");
        body = body.replaceAll("\r", "");
        body = body.replaceAll("</?[bi]/?>", "");
        
        body = body.replaceFirst(".*<title>([^<]+)</title>.*?<table.*?>", "selenium.setContext(\"$1\", \"info\");\n");
        body = body.replaceAll("<br>", ""); // these pop up all over and break other regexps
        
        body = body.replaceAll("\\\\", "\\\\\\\\"); // double the backslashes to avoid invalid escape sequences
        body = body.replaceAll(">\\s*<", "><");
        body = body.replaceAll("</?tbody>", "");
        body = body.replaceAll("<tr><t[dh]\\s+(rowspan=\"1\"\\s+)?colspan=\"3\">([^<]+)</t[dh]></tr>", 
                "\n/* $2 */\n");
        if (!silentMode) {
            System.out.println("-------------------------------------------------------------\n" + body);
        }
        body = body.replaceAll("&nbsp;?", "");  // sic -- need to match test code's typos
        body = body.replaceAll("</table>.*?<table.*?>", "");
        body = body.replaceAll("</table>.*", "");
        body = body.replaceAll("</?tbody>", "");
        
        if (!silentMode) {
            System.out.println("-------------------------------------------------------------\n" + body);
        }

        //      since I use <tr> to decide where to call the selenium object, make sure there's
        // no leading comment which would confuse matters:
        body = body.replaceAll("(<tr>)(<!--.*?-->)", "$2$1");
        body = body.replaceAll("<!--\\s*", EOL + "/* ");
        body = body.replaceAll("\\s*-->", " */\n");         
        body = body.replaceAll("<tr>\\s*(<td>)?", BEGIN_SELENESE);
        body = body.replaceAll("</tr>", END_SELENESE + "\n");
        body = body.replaceAll("</td><td>", SELENESE_TOKEN_DIVIDER);
        body = body.replaceAll("</?td>", "");
        body = body.replaceAll("\\s*\\)", ")");
        body = body.replaceAll("<td/>", "");
        if (!silentMode) {
            System.out.println("-------------------------------------------------------------\n" + body);
        }
        String lines[] = body.split("\n");
        for (int j = 0; j < lines.length;) {
            String line = lines[j];
            if (!line.startsWith(BEGIN_SELENESE)) {
                java.append(line);
                j++;
            }
            else {
                j = XlateSeleneseStatement(java, lines, j);
            }
            java.append("\n");
        }
        
        String possibleSetup = (domain==null ? "" : "\tpublic void setUp() throws Exception {\n" + 
                "\t\tsuper.setUp(\"" + domain + "\");\n" + 
                "\t}\n");
        
        if (!silentMode) {
            System.out.println("-------------------------------------------------------------\n" + java);
        }
        String ending = "\n\t\tcheckForVerificationErrors();\n\t}\n" + possibleSetup + "}\n";
                return preamble + java.toString() + ending;
    }


    private static String makeTestName(String base) {
        if (base.startsWith("test")) {
            return base;
        }
        if (base.startsWith("Test")) {
            return base.replaceFirst("Test", "test");
        }
        return "test" + base;
    }


    private static int XlateSeleneseStatement(StringBuffer java, String[] lines, int j) {
        return XlateSeleneseStatement(java, lines, j, true);
    }
    
    private static int XlateSeleneseStatement(StringBuffer java, String[] lines, int j, boolean tryCatchAllowed) {
        String line = lines[j];
        String splitTokens[] = line.replaceFirst(BEGIN_SELENESE, "").replaceFirst(END_SELENESE, "").split(SELENESE_TOKEN_DIVIDER);
        String tokens[] = getValuesOrBlankStrings(splitTokens);
        String op = tokens[0];                
        
        if (op.equals("typeRepeated")) {
            lines[j] = lines[j].replaceFirst("typeRepeated", "type");
            op = tokens[0] = "type";
            tokens[2] = tokens[2] + tokens[2];
        }
        if (op.startsWith("waitFor")
                && !op.equals("waitForCondition")
                && !op.equals("waitForPopUp")
                && !op.equals("waitForPageToLoad")
           )
        {
            String conditionCkVarName = "sawCondition" + j;
            java.append("\t\tboolean " + conditionCkVarName + " = false;"+ EOL)
            .append("for (int second = 0; second < 60; second++) {" + EOL)
            .append("\ttry {" + EOL)
            .append("\t\tif (");
            lines[j] = lines[j].replaceFirst("waitFor", "assert");
            StringBuffer testStatementSB = new StringBuffer();
            XlateSeleneseStatement(testStatementSB, lines, j, false);
            
            String testStatement = testStatementSB.toString();
            if (testStatement.matches("^/\\*.*\\*/$")) {
                // oops -- the translator returns a comment and when it cannot figure out how to translate something.
                // a comment in this context will not do.  Arbitrarily add "false" so that the output will at least compile:
                testStatement += " false";
            }
            testStatement = testStatement.replaceAll("\t//.*", "");
            testStatement = testStatement.replaceFirst("^\\s*", "");
            if (testStatement.startsWith("assertTrue")) {
                testStatement.replaceFirst("assertTrue", "");
            }
            else if (testStatement.startsWith("assertEquals")) {
                testStatement = testStatement.replaceFirst("assertEquals", "seleniumEquals");
            }
            else if (testStatement.startsWith("assertNotEquals")) {
                testStatement = testStatement.replaceFirst("assertNotEquals", "!seleniumEquals");
            }
            testStatement = testStatement.replaceFirst(";$", "");
                
            java.append(testStatement)            
            .append(") {" + EOL)
            .append("\t\t\t" + conditionCkVarName + " = true;"+ EOL)
            .append("\t\t\tbreak;" + EOL)
            .append("\t\t}" + EOL)
            .append("\t}" + EOL)
            .append("\tcatch (Exception ignore) {" + EOL)
            .append("\t}" + EOL)
            .append("\tpause(1000);" + EOL)
            .append("}" + EOL)
            .append("assertTrue(" + conditionCkVarName + ");" + EOL);
        }
        else if (op.matches("setTimeout")) {
            timeOut  = Integer.parseInt(tokens[1]);
        }
        else if (op.matches(".*(Error|Failure)OnNext") ) {
            String throwCkVarName = "sawThrow" + j;
            if (tryCatchAllowed) {
                java.append(EOL + "boolean " + throwCkVarName + " = false;" + EOL + "try {" + EOL + "\t");
            }
            boolean throwExpected;
            if (op.indexOf("ErrorOnNext") != -1 || op.indexOf("FailureOnNext") != -1) {
                throwExpected = true; 
                j++;
            }
            else {
                java.append("// originally " + tokens[0] + "|" + tokens[1] + "|" + tokens[2] + EOL);
                throwExpected = false;
            }
            String wrapper = (lines[j].startsWith(BEGIN_SELENESE + "verify")) ? "verify" : "assert";
            lines[j] = lines[j].replaceFirst("verify", "assert");
            StringBuffer testStatement = new StringBuffer();
            XlateSeleneseStatement(testStatement, lines, j, false);
            
            // need an exception to catch; \t is to avoid changing commented-out pre-xlation line
            java.append(testStatement.toString().replaceFirst("\tverify", "\tassert"));
            
            if (tryCatchAllowed) {
                java.append(EOL + "}" + EOL            
                        + "catch (Throwable e) {" + EOL + "\t" 
                        + "" + throwCkVarName + " = true;" + EOL
                        + "}" + EOL
                        + wrapper + (throwExpected ? "True" : "False") + "(" + throwCkVarName + ");" + EOL);
            }
        }
        else {
            java.append(XlateSeleneseStatementTokens(op, tokens, line));
        }
        return j+1;
    }
    
    private static void initializeFuncTypes() {
        if (funcTypes != null) return;
        funcTypes = new HashMap();
        InputStream stream = XlateHtmlSeleneseToJava.class.getResourceAsStream("/core/iedoc.xml");
        try {
            Document d = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(stream);
            NodeList functions = d.getElementsByTagName("function");
            for (int i = 0; i < functions.getLength(); i++) {
                Element function = (Element) functions.item(i);
                String funcName = function.getAttribute("name");
                NodeList returnElements = function.getElementsByTagName("return");
                if (returnElements.getLength() == 0) {
                    funcTypes.put(funcName, void.class);
                } else {
                    Element ret = (Element) returnElements.item(0);
                    String retType = ret.getAttribute("type");
                    if ("boolean".equals(retType)) {
                        funcTypes.put(funcName, boolean.class);
                    } else if ("string".equals(retType)) {
                        funcTypes.put(funcName, String.class);
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    
    private static boolean opIsBoolean(String op) {
        return (boolean.class.equals(getOpType(op)));
    }
    
    private static Class getOpType(String op) {
        initializeFuncTypes();
        if (funcTypes.get(op) != null) return (Class) funcTypes.get(op);
        String swappedOp = op.replaceFirst("store", "get");
        if (funcTypes.get(swappedOp) != null) return (Class) funcTypes.get(swappedOp);
        swappedOp = op.replaceFirst("store", "is");
        if (funcTypes.get(swappedOp) != null) return (Class) funcTypes.get(swappedOp);
        throw new RuntimeException("don't recognize op: " + op);
    }

    private static String XlateSeleneseStatementTokens(String op, String[] tokens, String oldLine) {
        String beginning = "\t\t// " + oldLine
        .replaceFirst(BEGIN_SELENESE, "")
        .replaceFirst(END_SELENESE, "")
        .replaceAll(SELENESE_TOKEN_DIVIDER, "|") + EOL; 
        
        String ending = ";";
        if (op.endsWith("AndWait")) {
            if (!op.startsWith("click")) {
                // there are several test cases where a clickAndWait is used on a button which leads to an alert/
                // confirmation being thrown up; this leads to an exception when it occurs while waitForPageToLoad
                // is running.  I'm not sure if I am correct here, but I know the tests succeed if I do this.
                // TODO: is this right?
                ending += EOL + "selenium.waitForPageToLoad(\"" + timeOut + "\");";
            }
            op = op.replaceFirst("AndWait", "");
            tokens[0] = tokens[0].replaceFirst("AndWait", "");
        }
        if (op.equals("storeText")) {
            return beginning + "String " + tokens[2] + " = selenium.getText(" + quote(tokens[1]) + ");";
        }
        if (op.equals("storeTextLength")) {
            return beginning + "Integer " + tokens[2] + " = new Integer(selenium.getText(" + quote(tokens[1]) + ").length());";
        }
        if (op.equals("store")) {
            return beginning + possiblyDeclare(tokens[2], op) + " = " + XlateSeleneseArgument(tokens[1]) + ";";
        }
        if (op.equals("storeAttribute")) {
            return beginning + possiblyDeclare(tokens[2], op) + " = selenium.getAttribute(" + 
                    XlateSeleneseArgument(tokens[1]) + ");";
        }
        if (op.equals("storeBodyText")) {
            return beginning + possiblyDeclare(tokens[1], op) + " = this.getText();";
        }
        if (op.equals("storeValue")) {
            if (tokens[2].equals("")) {
                return beginning + possiblyDeclare(tokens[1], op) + " = this.getText();";
            }
            return beginning + possiblyDeclare(tokens[2], op) + " = selenium.getValue(" + XlateSeleneseArgument(tokens[1]) + ");";
        }
        if (op.startsWith("store")) {
            return beginning + possiblyDeclare(tokens[1], op) + " = " + (op.endsWith("NotPresent") ? "!" : "") + 
                    "selenium." + (op.endsWith("Present") ? "is" : "get") + op.replaceFirst("store", "") + "();";
        }
        if (op.startsWith("verify") || op.startsWith("assert")) {
            String middle;
            if (op.startsWith("verify")) {
                beginning += "verifyEquals(";
            }
            else {
                beginning += "assertEquals(";
            }
            ending = ")" + ending;
            op = op.replaceFirst("assert|verify", "");
            if (op.equals("AlertPresent")
                    || op.equals("PromptPresent")
                    || op.equals("ConfirmationPresent")) {
                return "\t\tassertTrue(selenium.is" + op + "());";
            }
            if (op.equals("AlertNotPresent")
                    || op.equals("PromptNotPresent")
                    || op.equals("ConfirmationNotPresent")) {
                op = op.replaceFirst("Not", "");
                return "\t\tassertFalse(selenium.is" + op + "());";
            }
            if (op.equals("ElementPresent") || op.equals("ElementNotPresent")
                    || op.equals("TextPresent") || op.equals("TextNotPresent")
                    || op.equals("Editable") || op.equals("NotEditable")
                    || op.equals("Visible") || op.equals("NotVisible")) {
                //assert beginning.indexOf("assert") != -1;  // because verify's will be picked off by the caller
                return "\t\tselenium.assert" + op + "(" + XlateSeleneseArgument(tokens[1]) + ");";
            }
            if (op.equals("Selected") || op.equals("NotSelected")) {
                return "selenium.assert" + op + "(" + XlateSeleneseArgument(tokens[1]) + ", " + XlateSeleneseArgument(tokens[2]) + ");";
            }
            if (op.startsWith("Not") || op.endsWith("NotPresent")) {
                beginning = invertAssertion(beginning);
                op = op.replaceFirst("Not", "");
            }
            if (op.equals("Attribute")) {
                return beginning + XlateSeleneseArgument(tokens[2]) + ", selenium.getAttribute(" + 
                XlateSeleneseArgument(tokens[1]) + "));";        
            }
            else if (op.equals("Text")) {
                middle = XlateSeleneseArgument(tokens[2]) + ", selenium.getText(" + XlateSeleneseArgument(tokens[1]) + ")";
            }
            else if (op.equals("TextLength")) {
                middle = XlateSeleneseArgument(tokens[2]) + ", \"\" + selenium.getText(" + XlateSeleneseArgument(tokens[1]) + ").length()";
            }
            else if (op.equals("Location")) {
                return "\t\tselenium.assertLocation(" + XlateSeleneseArgument(tokens[1]) + ");";
            }
            else if (op.equals("AbsoluteLocation")) {
                middle = XlateSeleneseArgument(tokens[1]) + ", selenium.getAbsoluteLocation()";
            }
            else if (op.equals("Title")) {
                middle = XlateSeleneseArgument(tokens[1]) + ", selenium.getTitle()";
            }
            else if (op.equals("Value")) {
                middle = XlateSeleneseArgument(tokens[2]) + ", selenium.getValue(" + XlateSeleneseArgument(tokens[1]) + ")";
            }
            else if (op.equals("Alert")) {
                middle = XlateSeleneseArgument(tokens[1]) + ", selenium.getAlert()";
            }
            else if (op.equals("Prompt")) {
                middle = XlateSeleneseArgument(tokens[1]) + ", selenium.getPrompt()";
            }
            else if (op.equals("Confirmation")) {
                middle = XlateSeleneseArgument(tokens[1]) + ", selenium.getConfirmation()";
            }
            else if (op.equals("Checked")) {
                middle = XlateSeleneseArgument(tokens[2]) + ", selenium.getChecked(" + XlateSeleneseArgument(tokens[1]) + ")";
            }
            else if (op.equals("Expression")) {
                middle = XlateSeleneseArgument(tokens[1]) + ", " + 
                XlateSeleneseArgument(tokens[2]);
            }
            else if (op.equals("ErrorOnNext")
                    || op.equals("FailureOnNext")) {
                String t = "these line-spanning ops should be handled by the caller: " + oldLine;
                if (dontThrowOnTranslationDifficulties ) {
                    return "// " + t;
                }
                throw new RuntimeException(t);
            }
            else if (op.equals("Selected")
                    || op.equals("ValueRepeated")
                    || op.equals("modalDialogTest")) {
                return "// skipped undocumented " + oldLine;
            }
            else if (op.equals("SelectOptions") || op.equals("SelectedOptions")) {
                String tmpArrayVarName = newTmpName();
                beginning = "\t\t" + declareAndInitArray(tmpArrayVarName, tokens[2]) + "\n" + beginning;
                middle = tmpArrayVarName + ", selenium.get" + op + "(" + XlateSeleneseArgument(tokens[1]) + ")";
            }
            else if (op.equals("Table")) {
                middle =  XlateSeleneseArgument(tokens[2]) + ", selenium.get" + op + "(" + XlateSeleneseArgument(tokens[1]) + ")";
            }
            else {
                middle = "selenium.is" + op + "()";
            }
            return beginning + middle + ending;
        }
        if (op.equals("pause")) {
            return beginning + op + "(" + tokens[1] + ")" + ending;
        }
        if (op.equals("modalDialogTest")
                || op.equals("ValueRepeated")
               ) {
            return "// skipped undocumented, unsupported op in " + oldLine;
        }
        if (op.equals("open")) {
            recordFirstDomain(tokens[1]);
        }
        int expectedArgCount = 2;
        if (op.equals("open")
                || op.equals("answerOnNextPrompt")
                || op.equals("click")
                || op.equals("check")
                || op.equals("selectWindow")
                || op.equals("submit")
                || op.equals("uncheck")
                || op.equals("answerOnNextPrompt")
                ) {
            expectedArgCount = 1;
        }
        else if (op.equals("chooseCancelOnNextConfirmation")
                || op.equals("close")
                || op.equals("refresh")
                || op.equals("goBack")) {
            expectedArgCount = 0;
        }
        return beginning + XlateSeleneseStatementDefault(expectedArgCount, "selenium", tokens) + ending;
    }

    private static void recordFirstDomain(String urlToOpen) {
        if (domain!=null) {
            return;   // first domain already recorded, apparently
        }
        if (urlToOpen.indexOf("//")==-1) {
            return;  // apparently no protocol, so I'm not sure how to find the domain
        }
        domain = urlToOpen.replaceFirst("://", ":::") // get those slashes out of the way, so I don't need to use (<?/)/[^/] 
        .replaceFirst("/.*", "")
        .replaceFirst("\\?.*", "")
        .replaceFirst(":::", "://");  // put the slashes back
    }


    private static String declareAndInitArray(String name, String commaSeparatedValue) {
        String DIVIDER = ">>>>>>>><<<<<>>>>>>";
        commaSeparatedValue = commaSeparatedValue.replaceAll("([^\\\\]),", "$1" + DIVIDER);
        boolean trailingEmptyValue = false;
        String BOGUS_EXTRA_VALUE_SO_SPLIT_WILL_ALLOCATE_FINAL_ENTRY = "dummy";
        if (commaSeparatedValue.lastIndexOf(DIVIDER) == commaSeparatedValue.length() - DIVIDER.length()) {
            trailingEmptyValue = true;
            commaSeparatedValue += BOGUS_EXTRA_VALUE_SO_SPLIT_WILL_ALLOCATE_FINAL_ENTRY;
        }
        String vals[] = commaSeparatedValue.split(DIVIDER);
        if (trailingEmptyValue) {
            vals[vals.length - 1] = "";
        }
        String declaration = "String[] " + name + " = {";
        for (int j = 0; j < vals.length; j++) {
            if (j > 0) {
                declaration += ", ";
            }
            declaration += "\"" + vals[j] + "\"";
        }
        declaration += "};";
        return declaration;
    }

    private static String newTmpName() {
        return "tmp" + varNameSeed ++;
    }

    private static String invertAssertion(String s) {
        if (s.indexOf("Equals") != -1) {
            return s.replaceFirst("Equals", "NotEquals");
        }
        //assert s.indexOf("True") != -1;
        return s.replaceFirst("True", "False");
    }

    private static String[] getValuesOrBlankStrings(String[] splitTokens) {
        String[] valuesOrBlankStrings = { "", "", "" };
        valuesOrBlankStrings[0] = splitTokens[0];
        valuesOrBlankStrings[1] = splitTokens.length > 1 ? splitTokens[1] : "";
        valuesOrBlankStrings[2] = splitTokens.length > 2 ? splitTokens[2] : "";
        return valuesOrBlankStrings;
    }

    protected static String quote(String value) {
        return "\"" + value.replaceAll("\"", "\\\"") + "\"";
    }

    private static String XlateSeleneseStatementDefault(int expectedArgCount, String objName, String[] tokens) {
        StringBuffer sb = new StringBuffer(objName);
        
        sb.append(".")
        .append(tokens[0])
        .append("(")
        .append(XlateSeleneseArguments(expectedArgCount, tokens))
        .append(")");  
        return sb.toString(); 
    }

    private static String XlateSeleneseArguments(int expectedArgCount, String[] tokens) {
        StringBuffer sb = new StringBuffer();
        for (int j = 1; j < tokens.length && j <= expectedArgCount; j++) {
            if (j > 1) {
                sb.append(", ");
            }
            sb.append(XlateSeleneseArgument(tokens[j]));
        }
        return sb.toString();
    }

    private static String XlateSeleneseArgument(String oldArg) {
        String arg = oldArg.replaceAll("\"", "\\\\\"");
        arg = arg.replaceFirst("^", "\"");
        arg = arg.replaceFirst("$", "\"");
        if (arg.startsWith("\"javascript{")) {
            arg = arg.replaceFirst("^\"javascript\\{(.*)\\}\"$", "$1");
            arg = arg.replaceAll("storedVars\\['(.*?)'\\]", "\" + $1 + \"");
            arg = "selenium.getEval(\"" + arg + "\")";
        }
        arg = arg.replaceAll("\\$\\{(.*?)}", "\" + $1 + \"");
        arg = arg.replaceAll(" \\+ \"\"", "");
        arg = arg.replaceAll("\"\" \\+ ", "");
        return 
        //"\n/*" + oldArg + "*/" + 
        arg;
    }

    private static String ReadFileContents(File f) throws IOException {
        FileReader input = new FileReader(f);
        StringBuffer sb = new StringBuffer();
        while (true) {
            int c = input.read();
            if (c==-1) {
                break;
            }
            sb.append((char)c);
        }
        return sb.toString();
    }


    private static File openFile(String fileName) {
        File f = new File(fileName);
        return f;
    }
    
    
    private static void Usage(String errorMessage) {
        System.err.println(errorMessage + "\nUsage: XlateHtmlSeleneseToJava [-suite] [-silent] [seleneseJavaFileNameDirectory] [-dir seleneseHtmlDirName] [seleneseHtmlFileName1 seleneseHtmlFileName2 ...] \n"
                + "e.g., XlateHtmlSeleneseToJava a/b/c x/y/z/seleneseTestCase.html" 
                + "will take x/y/z/seleneseTestCase.html as its input and produce as its output an equivalent Java" 
                + "class at a/b/c/seleneseTestCase.java.");
        System.exit(-1);
    }
}
