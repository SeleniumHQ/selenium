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

import static org.junit.Assert.assertEquals;

import com.thoughtworks.selenium.webdriven.WebDriverBackedSelenium;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.firefox.FirefoxDriver;

public class StartTest {

  private static TestEnvironment env;
  private static String root;

  @BeforeClass
  public static void startSelenium() {
    env = GlobalTestEnvironment.get(InProcessTestEnvironment.class);
    root = env.getAppServer().whereIs("/");
  }

  @AfterClass
  public static void killSeleniumServer() {
    env.stop();
  }

  @Test
  public void shouldBeAbleToCreateAWebDriverBackedSeleniumInstance() {
    WebDriver driver = new FirefoxDriver();
    Selenium selenium = new WebDriverBackedSelenium(driver, root);

    try {
      selenium.open(env.getAppServer().whereIs("/"));

      String seleniumTitle = selenium.getTitle();
      String title = driver.getTitle();

      assertEquals(title, seleniumTitle);
    } finally {
      selenium.stop();
    }
  }
}
