/*
 * Created on Mar 25, 2006
 *
 */
package com.thoughtworks.selenium;

import junit.framework.TestCase;

import java.lang.reflect.Method;
import java.util.Arrays;

public class CSVTest extends TestCase {

    Method CSV;
    
    protected void setUp() throws Exception {
        Method[] methods = HttpCommandProcessor.class.getDeclaredMethods();
        for (int i = 0; i < methods.length; i++) {
            if ("parseCSV".equals(methods[i].getName())) {
                Method csvMethod = methods[i];
                csvMethod.setAccessible(true);
                CSV = csvMethod;
                break;
            }
        }
    }
    
    public String[] parseCSV(String input, String[] expected) {
        System.out.print(input + ": ");
        String[] output;
        try {
            output = (String[]) CSV.invoke(null, new String[] {input});
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        System.out.println(Arrays.asList(output).toString());
        compareStringArrays(expected, output);
        return output;
    }
    
    public void testSimple() {
        String input = "1,2,3";
        String[] expected = new String[] {"1","2", "3"};
        parseCSV(input, expected);
    }
    
    public void testBackSlash() {
        String input = "1,2\\,3,4"; // Java-escaped, but not CSV-escaped
        String[] expected = new String[] {"1","2,3", "4"}; // backslash should disappear in output
        parseCSV(input, expected);
    }
    
    public void testRandomSingleBackSlash() {
        String input = "1,\\2,3"; // Java-escaped, but not CSV-escaped
        String[] expected = new String[] {"1","2", "3"}; // backslash should disappear
        parseCSV(input, expected);
    }
    
    public void testDoubleBackSlashBeforeComma() {
        String input = "1,2\\\\,3"; // Java-escaped and CSV-escaped
        String[] expected = new String[] {"1","2\\", "3"}; // one backslash should disappear in output
        parseCSV(input, expected);
    }
    
    public void testRandomDoubleBackSlash() {
        String input = "1,\\\\2,3"; // Java-escaped, and CSV-escaped
        String[] expected = new String[] {"1","\\2", "3"}; // one backslash should disappear in output
        parseCSV(input, expected);
    }
    
    public void testTripleBackSlashBeforeComma() {
        String input = "1,2\\\\\\,3,4"; // Java-escaped, and CSV-escaped
        String[] expected = new String[] {"1","2\\,3", "4"}; // one backslash should disappear in output
        parseCSV(input, expected);
    }
    
    public void test4BackSlashesBeforeComma() {
        String input = "1,2\\\\\\\\,3"; // Java-escaped, and CSV-escaped
        String[] expected = new String[] {"1","2\\\\", "3"}; // two backslashes should disappear in output
        parseCSV(input, expected);
    }
    
    public void compareStringArrays(String[] expected, String[] actual) {
        assertEquals("Wrong number of elements", expected.length, actual.length);
        for (int i = 0; i < expected.length; i++) {
            assertEquals(expected[i], actual[i]);
        }
    }

}
