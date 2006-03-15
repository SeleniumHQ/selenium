/*
 * Copyright 2004 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.openqa.selenium.server.htmlrunner;

import java.io.*;
import java.net.*;
import java.text.*;
import java.util.*;

/**
 * A data model class for the results of the Selenium HTMLRunner (aka TestRunner, FITRunner)
 * 
 * @author Darren Cotterill
 * @author Ajit George
 */
public class HTMLTestResults {
    private final String result;
    private final String totalTime;
    private final String numTestPasses;
    private final String numTestFailures;
    private final String numCommandPasses;
    private final String numCommandFailures;
    private final String numCommandErrors;
    private final String suite;

    private static final String SUMMARY_HTML = "<html><body>\n<h1>Test suite results </h1>" +
            "\n\n<table>\n<tr>\n<td>result:</td>\n<td>{0}</td>\n" +
            "</tr>\n<tr>\n<td>totalTime:</td>\n<td>{1}</td>\n</tr>\n" +
            "<tr>\n<td>numTestPasses:</td>\n<td>{2}</td>\n</tr>\n" +
            "<tr>\n<td>numTestFailures:</td>\n<td>{3}</td>\n</tr>\n" +
            "<tr>\n<td>numCommandPasses:</td>\n<td>{4}</td>\n</tr>\n" +
            "<tr>\n<td>numCommandFailures:</td>\n<td>{5}</td>\n</tr>\n" +
            "<tr>\n<td>numCommandErrors:</td>\n<td>{6}</td>\n</tr>\n" +
            "<tr>\n<td>{7}</td>\n<td>&nbsp;</td>\n</tr>";
    
    private static final String SUITE_HTML = "<tr>\n<td>{0}</td>\n<td>&nbsp;</td>\n</tr>";
    
    private final List testTables;
    
    public HTMLTestResults(String postedResult, String postedTotalTime, 
            String postedNumTestPasses, String postedNumTestFailures, 
            String postedNumCommandPasses, String postedNumCommandFailures, 
            String postedNumCommandErrors, String postedSuite, List postedTestTables) {

        result = postedResult;
        numCommandFailures = postedNumCommandFailures;
        numCommandErrors = postedNumCommandErrors;
        suite = postedSuite;
        totalTime = postedTotalTime;
        numTestPasses = postedNumTestPasses;
        numTestFailures = postedNumTestFailures;
        numCommandPasses = postedNumCommandPasses;
        testTables = postedTestTables;
    }


    public List getTestNames() {
        List testNames = new LinkedList();
        
        int testStartIndex = 0;
        int testEndIndex = 0;
        
        while (suite.indexOf(".html\">", testEndIndex) != -1) {
            testStartIndex = suite.indexOf(".html\">", testEndIndex) + 7;
            testEndIndex = suite.indexOf("</a>", testStartIndex);
            String testName = suite.substring(testStartIndex, testEndIndex);
            testNames.add(testName);
        }
        
        return testNames;
    }

    public String getDecodedTestSuite() {
        return new UrlDecoder().decode(suite);
    }
    
    public List getDecodedTestTables() {
        return new UrlDecoder().decodeListOfStrings(testTables);
    }
    
    public String getResult() {
        return result;
    }
    public String getNumCommandErrors() {
        return numCommandErrors;
    }
    public String getNumCommandFailures() {
        return numCommandFailures;
    }
    public String getNumCommandPasses() {
        return numCommandPasses;
    }
    public String getNumTestFailures() {
        return numTestFailures;
    }
    public String getNumTestPasses() {
        return numTestPasses;
    }
    public String getSuite() {
        return suite;
    }
    public Collection getTestTables() {
        return testTables;
    }
    public String getTotalTime() {
        return totalTime;
    }
    public int getNumTotalTests() {
        return Integer.parseInt(numTestPasses) + Integer.parseInt(numTestFailures);
    }

    public void write(Writer out) throws IOException {
        Object[] parameters = new Object[] {
                result,
                totalTime,
                numTestPasses,
                numTestFailures,
                numCommandPasses,
                numCommandFailures,
                numCommandErrors,
                getDecodedTestSuite(),
        };
        out.write(MessageFormat.format(SUMMARY_HTML,parameters));
        parameters = new Object[1];
        for (Iterator i = getDecodedTestTables().iterator(); i.hasNext();) {
            String table = (String) i.next();
            parameters[0] = table;
            out.write(MessageFormat.format(SUITE_HTML, parameters));
        }
        out.write("</table></body></html>");
        out.flush();
    }
    
    class UrlDecoder {

        public String decode(String string) {
            try {
                return URLDecoder.decode(string, System.getProperty("file.encoding"));
            } catch (UnsupportedEncodingException e) {
                return string;
            }
        }
        
        public List decodeListOfStrings(List list) {
            List decodedList = new LinkedList();
            
            for (Iterator i = list.iterator(); i.hasNext();) {
                decodedList.add(decode((String) i.next()));
            }
            
            return decodedList;
        }
    }
}
