/*
 * Created on Mar 1, 2006
 *
 */
package com.thoughtworks.selenium;

import java.io.*;
import java.lang.reflect.*;
import java.util.regex.*;

/**
 * Generates the CSharp interface based on the Java interface
 * 
 *  @author dfabulich
 *
 */
public class GeneratePythonInterface {

    /**
     * @param args
     */
    public static void main(String[] args) throws Exception {
        if (args.length != 1) {
            throw new Exception("usage: " + GeneratePythonInterface.class.getName() + " outFile.py");
        }
        File outFile = new File(args[0]);
        generatePythonInterface(outFile);
    }
    
    public static void generatePythonInterface(File outFile) throws Exception {
        BufferedWriter out = new BufferedWriter(new FileWriter(outFile));
        Method[] methods = Selenium.class.getMethods();
        out.write("# These functions were generated based on the Java Client Driver\n");
        for (int i = 0; i < methods.length; i++) {
            Method method = methods[i];
            if (method.getName().equals("start")) continue;
            if (method.getName().equals("stop")) continue;
            out.write("\tdef ");
            out.write(getPythonName(method.getName()));
            out.write("(self");
            Class[] params = method.getParameterTypes();
            for (int j = 0; j < params.length; j++) {
                out.write(", ");
                Class param = params[j];
                out.write("arg");
                out.write(Integer.toString(j));
            }
            out.write("):\n");
            out.write("\t\t");
            if (method.getName().startsWith("verify")) {
                out.write("self.do_verify(\"");
                out.write(method.getName());
                out.write("\"");
            } else if (method.getName().startsWith("get")) {
                out.write("return self.do_command(\"");
                out.write(method.getName());
                out.write("\"");
            } else {
                out.write("self.do_action(\"");
                out.write(method.getName());
                out.write("\"");
            }
            
            for (int j = 0; j < params.length; j++) {
                out.write(", ");
                Class param = params[j];
                out.write("arg");
                out.write(Integer.toString(j));
            }
            out.write(")\n\n");
        }
        out.flush();
        out.close();
    }

    public static String getPythonName(String methodName) throws Exception {
        Matcher m = Pattern.compile("([A-Z])").matcher(methodName);
        boolean result = m.find();
        if (result) {
            StringBuffer sb = new StringBuffer();
            do {
                m.appendReplacement(sb, "_" + m.group(1).toLowerCase());
                result = m.find();
            } while (result);
            m.appendTail(sb);
            return sb.toString();
        }
        return methodName;
    }

    
    public static String upperCaseFirstLetter(String name) {
        char firstLetter = name.charAt(0);
        firstLetter = Character.toUpperCase(firstLetter);
        String remainder = name.substring(1);
        String result = "" + firstLetter + remainder;
        return result;
    }
    
}
