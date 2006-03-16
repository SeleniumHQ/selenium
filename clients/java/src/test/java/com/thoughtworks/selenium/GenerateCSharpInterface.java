/*
 * Created on Mar 1, 2006
 *
 */
package com.thoughtworks.selenium;

import java.io.*;
import java.lang.reflect.*;

/**
 * Generates the CSharp interface based on the Java interface
 * 
 *  @author dfabulich
 *
 */
public class GenerateCSharpInterface {

    /**
     * @param args
     */
    public static void main(String[] args) throws Exception {
        if (args.length != 1) {
            throw new Exception("usage: " + GenerateCSharpInterface.class.getName() + " outFile.cs");
        }
        File outFile = new File(args[0]);
        generateCSharpInterface(outFile);
    }
    
    public static void generateCSharpInterface(File outFile) throws Exception {
        BufferedWriter out = new BufferedWriter(new FileWriter(outFile));
        Method[] methods = Selenium.class.getMethods();
        out.write("using System;\n\nnamespace Selenium {\n\n" +
                "/*This class was generated based on the Java Client Driver*/\n" +
                "public interface IGeneratedSelenium {\n\n");
        for (int i = 0; i < methods.length; i++) {
            Method method = methods[i];
            out.write(getCSharpName(method.getReturnType()));
            out.write(' ');
            out.write(upperCaseFirstLetter(method.getName()));
            out.write('(');
            Class[] params = method.getParameterTypes();
            for (int j = 0; j < params.length; j++) {
                Class param = params[j];
                out.write(getCSharpName(param));
                out.write(' ');
                out.write("arg");
                out.write(Integer.toString(j));
                if (j != params.length - 1) out.write(", ");
            }
            out.write(");\n");
        }
        out.write("}}");
        out.flush();
        out.close();
    }

    public static String getCSharpName(Class param) throws Exception {
        String result;
        String[] exampleArray = new String[0];
        Class stringArray = exampleArray.getClass();
        if (param.equals(boolean.class)) {
            result = "bool";
        } else if (param.equals(String.class)) {
            result = "string";
        } else if (param.equals(stringArray)) {
            result = "string[]";
        } else if (param.equals(int.class)) {
            result = "int";
        } else if (param.equals(long.class)) {
            result = "long";
        } else if (param.equals(void.class)) {
            result = "void";
        } else { 
            throw new Exception("Don't know how to handle class: " + param.getName());
        }
        return result;
    }
    
    public static String upperCaseFirstLetter(String name) {
        char firstLetter = name.charAt(0);
        firstLetter = Character.toUpperCase(firstLetter);
        String remainder = name.substring(1);
        String result = "" + firstLetter + remainder;
        return result;
    }
    
}
