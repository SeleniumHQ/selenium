// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package com.thoughtworks.selenium;

import org.testng.ITestContext;
import org.testng.ITestResult;
import org.testng.Reporter;
import org.testng.internal.IResultListener;

import java.io.File;

public class ScreenshotListener implements IResultListener {

  File outputDirectory;
  Selenium selenium;

  public ScreenshotListener(File outputDirectory, Selenium selenium) {
    this.outputDirectory = outputDirectory;
    this.selenium = selenium;
  }

  @Override
  public void onTestFailure(ITestResult result) {
    Reporter.setCurrentTestResult(result);

    try {
      if (!outputDirectory.mkdirs()) {
        Reporter.log("Unable to take screenshot");
        return;
      }

      File outFile = File.createTempFile("TEST-" + result.getName(), ".png", outputDirectory);
      if (!outFile.delete()) {
        Reporter.log("Unable to create temporary file for screenshot");
        return;
      }
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

  @Override
  public void onConfigurationFailure(ITestResult result) {
    onTestFailure(result);
  }


  @Override
  public void onFinish(ITestContext context) {
  }

  @Override
  public void onStart(ITestContext context) {
    outputDirectory = new File(context.getOutputDirectory());
  }

  @Override
  public void onTestFailedButWithinSuccessPercentage(ITestResult result) {
  }



  @Override
  public void onTestSkipped(ITestResult result) {
  }

  @Override
  public void onTestStart(ITestResult result) {
  }

  @Override
  public void onTestSuccess(ITestResult result) {
  }

  @Override
  public void onConfigurationSuccess(ITestResult itr) {
  }


  @Override
  public void onConfigurationSkip(ITestResult itr) {
  }
}
