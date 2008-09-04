package com.thoughtworks.selenium;

import java.io.File;
import java.lang.reflect.Method;

import org.testng.ITestContext;
import org.testng.TestRunner;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;
import org.testng.internal.IResultListener;

public class SeleneseTestNgHelper extends SeleneseTestBase
{
    @BeforeTest
    @Override
    @Parameters({"selenium.url", "selenium.browser"})
    public void setUp(@Optional String url, @Optional String browserString) throws Exception {
        if (browserString == null) browserString = runtimeBrowserString();
        super.setUp(url, browserString);
    };
    
    @BeforeMethod
    public void setTestContext(Method method) {
        selenium.setContext(method.getDeclaringClass().getSimpleName() + "." + method.getName());
        
    }
    
    @BeforeSuite
    @Parameters({"selenium.host", "selenium.port"})
    public void attachScreenshotListener(@Optional("localhost") String host, @Optional("4444") String port, ITestContext context) {
        if (!"localhost".equals(host)) return;
        Selenium screenshotTaker = new DefaultSelenium(host, Integer.parseInt(port), "", "");
        TestRunner tr = (TestRunner) context;
        File outputDirectory = new File(context.getOutputDirectory());
        tr.addListener((IResultListener) new ScreenshotListener(outputDirectory, screenshotTaker));
    }
    
    @AfterMethod
    @Override
    public void checkForVerificationErrors() {
        super.checkForVerificationErrors();
    }
    
    @AfterTest
    @Override
    public void tearDown() throws Exception {
        super.tearDown();
    }
}
