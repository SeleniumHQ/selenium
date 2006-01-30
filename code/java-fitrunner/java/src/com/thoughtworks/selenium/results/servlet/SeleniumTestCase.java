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
package com.thoughtworks.selenium.results.servlet;

import junit.framework.TestCase;

/**
 * @author Darren Cotterill
 * @author Ajit George
 */
public class SeleniumTestCase extends TestCase {

    private boolean _testPassed = true;
    private String _result;
    
    public SeleniumTestCase(String testName) {
        super(testName);
    }

    public void runTest() {
        if (!_testPassed) {
            fail(_result);
        }
    }
    public String getResult() {
        return _result;
    }
    public void setResult(String result) {
        _result = result;
    }
    public boolean isTestPassed() {
        return _testPassed;
    }
    public void setTestPassed(boolean testPassed) {
        _testPassed = testPassed;
    }
}
