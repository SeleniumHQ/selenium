package org.openqa.selenium.utils;

import org.testng.ITestListener;
import org.testng.ITestResult;
import org.testng.ITestContext;

public class GhettoListener implements ITestListener {
    public void onTestStart(ITestResult iTestResult) {
    }

    public void onTestSuccess(ITestResult iTestResult) {
        System.out.println("PASS PASS PASS PASS PASS PASS PASS PASS");
        System.out.println("PASS PASS PASS PASS PASS PASS PASS PASS");
        System.out.println("PASS PASS PASS PASS PASS PASS PASS PASS");
        System.out.println("PASS PASS PASS PASS PASS PASS PASS PASS");
        System.out.println("PASS PASS PASS PASS PASS PASS PASS PASS");
        TestReporter.pass(name(iTestResult));
    }

    public void onTestFailure(ITestResult iTestResult) {
        System.out.println("FAIL FAIL FAIL FAIL FAIL FAIL FAIL FAIL");
        System.out.println("FAIL FAIL FAIL FAIL FAIL FAIL FAIL FAIL");
        System.out.println("FAIL FAIL FAIL FAIL FAIL FAIL FAIL FAIL");
        System.out.println("FAIL FAIL FAIL FAIL FAIL FAIL FAIL FAIL");
        System.out.println("FAIL FAIL FAIL FAIL FAIL FAIL FAIL FAIL");
        TestReporter.fail(name(iTestResult));
    }

    public void onTestSkipped(ITestResult iTestResult) {
        System.out.println("SKIP SKIP SKIP SKIP SKIP SKIP SKIP SKIP");
        System.out.println("SKIP SKIP SKIP SKIP SKIP SKIP SKIP SKIP");
        System.out.println("SKIP SKIP SKIP SKIP SKIP SKIP SKIP SKIP");
        System.out.println("SKIP SKIP SKIP SKIP SKIP SKIP SKIP SKIP");
        System.out.println("SKIP SKIP SKIP SKIP SKIP SKIP SKIP SKIP");
        TestReporter.skip(name(iTestResult));
    }

    public void onTestFailedButWithinSuccessPercentage(ITestResult iTestResult) {
        System.out.println("WHAT WHAT WHAT WHAT WHAT WHAT WHAT WHAT");
        System.out.println("WHAT WHAT WHAT WHAT WHAT WHAT WHAT WHAT");
        System.out.println("WHAT WHAT WHAT WHAT WHAT WHAT WHAT WHAT");
        System.out.println("WHAT WHAT WHAT WHAT WHAT WHAT WHAT WHAT");
        System.out.println("WHAT WHAT WHAT WHAT WHAT WHAT WHAT WHAT");
        TestReporter.fail(name(iTestResult));
    }

    public void onStart(ITestContext iTestContext) {
    }

    public void onFinish(ITestContext iTestContext) {
    }

    private String name(ITestResult iTestResult) {
        return iTestResult.getTestClass().getRealClass().getSimpleName() + "." + iTestResult.getMethod().getMethodName();
    }
}
