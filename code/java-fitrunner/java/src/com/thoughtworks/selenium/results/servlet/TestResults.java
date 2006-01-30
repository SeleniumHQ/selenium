package com.thoughtworks.selenium.results.servlet;

import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

public class TestResults {
    private final String result;
    private final String totalTime;
    private final String numTestPasses;
    private final String numTestFailures;
    private final String numCommandPasses;
    private final String numCommandFailures;
    private final String numCommandErrors;
    private final String suite;

    private final List testTables;
    
    public TestResults(String postedResult, String postedTotalTime, 
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


}
