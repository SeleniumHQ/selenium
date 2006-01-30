package com.thoughtworks.selenium.results.servlet;
import java.util.LinkedList;
import java.util.List;

import junit.framework.TestCase;

import com.thoughtworks.selenium.results.servlet.TestResults;

public class TestResultsTest extends TestCase {

    public void testResultsParseTestNames() {
        
        String testSuiteTable = 
        "<table border=\"1\" cellpadding=\"1\" cellspacing=\"1\">" + 
            "<tbody>" + 
                "<tr><td bgcolor=\"#cfffcf\"><b>Test Suite</b></td></tr>" + 
                "<tr><td bgcolor=\"#cfffcf\"><a href=\"./TestOpen.html\">TestOpen</a></td></tr>" + 
                "<tr><td bgcolor=\"#cfffcf\"><a href=\"./TestOpen.html\">TestClose</a></td></tr>" + 
            "</tbody>" + 
        "</table>";

        TestResults results = new TestResults("", "",
                "", "", "",
                "", "", testSuiteTable, new LinkedList());
        
        List testNames = results.getTestNames();
        
        assertEquals("TestOpen", testNames.get(0));
        assertEquals("TestClose", testNames.get(1));
        
    }
}
