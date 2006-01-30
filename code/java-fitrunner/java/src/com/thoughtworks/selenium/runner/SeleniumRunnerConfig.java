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
package com.thoughtworks.selenium.runner;

import java.io.File;

import com.thoughtworks.selenium.launch.WindowsIEBrowserLauncher;

/**
 * @author Darren Cotterill
 * @author Ajit George
 */
public class SeleniumRunnerConfig {
    private String resultsURL;
    private String testRunnerURL;
    private boolean isBrowserVisible;
    private File outputFile;
    private WindowsIEBrowserLauncher browserLauncher;
    private int maxPollAttempts;
    private String jacobDirectory;
    
    public WindowsIEBrowserLauncher getBrowserLauncher() {
        return browserLauncher;
    }
    
    public void setBrowserLauncher(WindowsIEBrowserLauncher browserLauncher) {
        this.browserLauncher = browserLauncher;
    }
    
    public boolean isBrowserVisible() {
        return isBrowserVisible;
    }
    
    public void setBrowserVisible(boolean isBrowserVisible) {
        this.isBrowserVisible = isBrowserVisible;
    }
    
    public int getMaxPollAttempts() {
        return maxPollAttempts;
    }
    
    public void setMaxPollAttempts(int maxPollAttempts) {
        this.maxPollAttempts = maxPollAttempts;
    }
    
    public File getOutputFile() {
        return outputFile;
    }
    
    public void setOutputFile(File outputFile) {
        this.outputFile = outputFile;
    }
    
    public String getResultsURL() {
        return resultsURL;
    }
    
    public void setResultsURL(String resultsURL) {
        this.resultsURL = resultsURL;
    }
    
    public String getTestRunnerURL() {
        return testRunnerURL;
    }
    
    public void setTestRunnerURL(String testRunnerURL) {
        this.testRunnerURL = testRunnerURL;
    }

    public String getJacobDirectory() {
        return jacobDirectory;
    }
    

    public void setJacobDirectory(String jacobDirectory) {
        this.jacobDirectory = jacobDirectory;
    }
    
    
}
