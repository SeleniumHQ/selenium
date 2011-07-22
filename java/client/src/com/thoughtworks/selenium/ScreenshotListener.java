package com.thoughtworks.selenium;

import java.io.File;

import org.testng.ITestContext;
import org.testng.ITestResult;
import org.testng.Reporter;
import org.testng.internal.IResultListener;

public class ScreenshotListener implements IResultListener {

    File outputDirectory;
    Selenium selenium;
    
    public ScreenshotListener(File outputDirectory, Selenium selenium) {
        this.outputDirectory = outputDirectory;
        this.selenium = selenium;
    }
    
    public void onTestFailure(ITestResult result) {
        Reporter.setCurrentTestResult(result);
        
        try {
            outputDirectory.mkdirs();
            File outFile = File.createTempFile("TEST-"+result.getName(), ".png", outputDirectory);
            outFile.delete();
            selenium.captureScreenshot(outFile.getAbsolutePath());
            Reporter.log("<a href='" +
            		outFile.getName() +
            		"'>screenshot</a>");
        } catch (Exception e) {
            e.printStackTrace();
            Reporter.log("Couldn't create screenshot");
            Reporter.log(e.getMessage());
        }  
        
        Reporter.setCurrentTestResult(null);
    }

    public void onConfigurationFailure(ITestResult result) {
        onTestFailure(result);
    }


    public void onFinish(ITestContext context) {}

    public void onStart(ITestContext context) {
        outputDirectory = new File(context.getOutputDirectory());
    }

    public void onTestFailedButWithinSuccessPercentage(ITestResult result) {}

    

    public void onTestSkipped(ITestResult result) {}

    public void onTestStart(ITestResult result) {}

    public void onTestSuccess(ITestResult result) {}

    public void onConfigurationSuccess(ITestResult itr) {
    }


    public void onConfigurationSkip(ITestResult itr) {
    }
}
