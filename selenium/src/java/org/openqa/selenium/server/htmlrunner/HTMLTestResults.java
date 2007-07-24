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

import java.io.IOException;
import java.io.Writer;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

/**
 * A data model class for the results of the Selenium HTMLRunner (aka TestRunner, FITRunner)
 * 
 * @author Darren Cotterill
 * @author Ajit George
 */
public class HTMLTestResults {
    private final String result;
    private final String totalTime;
    private final String numTestTotal;
    private final String numTestPasses;
    private final String numTestFailures;
    private final String numCommandPasses;
    private final String numCommandFailures;
    private final String numCommandErrors;
    private final String seleniumVersion;
    private final String seleniumRevision;

    public HTMLTestResults(String postedSeleniumVersion, String postedSeleniumRevision, 
            String postedResult, String postedTotalTime, 
            String postedNumTestTotal, String postedNumTestPasses, 
            String postedNumTestFailures, String postedNumCommandPasses, String postedNumCommandFailures, String postedNumCommandErrors, String postedSuite, List postedTestTables) {
        result = postedResult;
        numCommandFailures = postedNumCommandFailures;
        numCommandErrors = postedNumCommandErrors;
        totalTime = postedTotalTime;
        numTestTotal = postedNumTestTotal;
        numTestPasses = postedNumTestPasses;
        numTestFailures = postedNumTestFailures;
        numCommandPasses = postedNumCommandPasses;
        seleniumVersion = postedSeleniumVersion;
        seleniumRevision = postedSeleniumRevision;
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
    public Collection getTestTables() {
        return Collections.EMPTY_LIST;
    }
    public String getTotalTime() {
        return totalTime;
    }
    public int getNumTotalTests() {
        return Integer.parseInt(numTestPasses) + Integer.parseInt(numTestFailures);
    }

    public void write(Writer out) throws IOException {
       // no-op
    }
}
