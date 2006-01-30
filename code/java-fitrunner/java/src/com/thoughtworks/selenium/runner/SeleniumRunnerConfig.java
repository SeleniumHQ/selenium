package com.thoughtworks.selenium.runner;

import java.io.File;

import com.thoughtworks.selenium.launch.WindowsIEBrowserLauncher;

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
