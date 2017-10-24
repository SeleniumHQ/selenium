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

package com.thoughtworks.selenium.webdriven;

import static org.junit.Assert.assertEquals;

import com.thoughtworks.selenium.Selenium;

import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;


public class ScriptMutatorTest extends JUnit4TestBase {

  @Test
  public void testShouldBeAbleToUseTheBrowserbot() {
    String url = pages.tables;
    Selenium selenium = new WebDriverBackedSelenium(driver, url);
    selenium.open(pages.tables);

    String rowCount = selenium.getEval(
        "var table = selenium.browserbot.findElement('id=base'); " +
        "table.rows[0].cells.length;");

    assertEquals("3", rowCount);
  }
}
