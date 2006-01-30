/* * Copyright 2004 ThoughtWorks, Inc. * *  Licensed under the Apache License, Version 2.0 (the "License"); *  you may not use this file except in compliance with the License. *  You may obtain a copy of the License at * *      http://www.apache.org/licenses/LICENSE-2.0 * *  Unless required by applicable law or agreed to in writing, software *  distributed under the License is distributed on an "AS IS" BASIS, *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *  See the License for the specific language governing permissions and *  limitations under the License. * */package com.thoughtworks.selenium.results.servlet;
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
