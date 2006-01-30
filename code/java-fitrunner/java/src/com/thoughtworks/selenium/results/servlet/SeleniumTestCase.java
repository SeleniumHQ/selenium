package com.thoughtworks.selenium.results.servlet;

import junit.framework.TestCase;

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
