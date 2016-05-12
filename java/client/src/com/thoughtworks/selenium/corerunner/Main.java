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

package com.thoughtworks.selenium.corerunner;

import static org.openqa.selenium.firefox.FirefoxDriver.MARIONETTE;

import com.thoughtworks.selenium.webdriven.WebDriverBackedSelenium;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.opera.OperaDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.safari.SafariDriver;

public class Main {

  public static void main(String[] args) {
//    java -jar selenium-server-standalone-<version-number>.jar -htmlSuite "*firefox"
//    "http://www.google.com" "c:\absolute\path\to\my\HTMLSuite.html"
//    "c:\absolute\path\to\my\results.html"
    if (args.length < 5) {
      throw new RuntimeException("Not enough arguments");
    }
    if (!"-htmlSuite".equals(args[0])) {
      throw new RuntimeException("Apparently not running a test suite");
    }

    WebDriver driver;
    switch (args[1]) {
      case "*chrome":
      case "*firefox":
      case "*firefoxproxy":
      case "*firefoxchrome":
      case "*pifirefox":
        DesiredCapabilities caps = new DesiredCapabilities();
        caps.setCapability(MARIONETTE, false);
        driver = new FirefoxDriver(caps);
        break;

      case "*iehta":
      case "*iexplore":
      case "*iexploreproxy":
      case "*piiexplore":
        driver = new InternetExplorerDriver();
        break;

      case "*googlechrome":
        driver = new ChromeDriver();
        break;

      case "*MicrosoftEdge":
        driver = new EdgeDriver();
        break;

      case "*opera":
      case "*operablink":
        driver = new OperaDriver();
        break;

      case "*safari":
      case "*safariproxy":
        driver = new SafariDriver();
        break;

      default:
        throw new RuntimeException("Unrecognized browser: " + args[1]);
    }

    try {
      Results results = new Results();
      CoreTest test = new CoreTest(args[3]);
      test.run(results, driver, new WebDriverBackedSelenium(driver, args[2]));
    } finally {
      driver.quit();
    }
  }
}
