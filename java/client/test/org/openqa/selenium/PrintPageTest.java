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

package org.openqa.selenium;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assume.assumeTrue;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.print.PageSize;
import org.openqa.selenium.print.PrintOptions;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NoDriverBeforeTest;

public class PrintPageTest extends JUnit4TestBase {
  private static final String MAGIC_STRING = "JVBER";
  private PrintsPage printer;

  @Before
  public void setUp() {
    System.setProperty("webdriver.chrome.headless", "true");
    createNewDriver(new ImmutableCapabilities());
    assumeTrue(driver instanceof PrintsPage);
    printer = (PrintsPage) driver;
    driver.get(pages.printPage);
  }

  @After
  public void tearDown() {
    System.clearProperty("webdriver.chrome.headless");
  }

  @Test
  @NoDriverBeforeTest
  @NoDriverAfterTest
  public void canPrintPage() {
    PrintOptions printOptions = new PrintOptions();

    Pdf pdf = printer.print(printOptions);
    assertThat(pdf.getContent().contains(MAGIC_STRING)).isTrue();
  }

  @Test
  @NoDriverBeforeTest
  @NoDriverAfterTest
  public void canPrintTwoPages() {
    PrintOptions printOptions = new PrintOptions();
    printOptions.setPageRanges("1-2");

    Pdf pdf = printer.print(printOptions);
    assertThat(pdf.getContent().contains(MAGIC_STRING)).isTrue();
  }

  @Test
  @NoDriverBeforeTest
  @NoDriverAfterTest
  public void canPrintWithValidParams() {
    PrintOptions printOptions = new PrintOptions();
    PageSize pageSize = new PageSize();
    pageSize.setWidth(30.0);

    printOptions.setPageRanges("1-2");
    printOptions.setOrientation(PrintOptions.Orientation.Landscape);
    printOptions.setPageSize(pageSize);

    Pdf pdf = printer.print(printOptions);
    assertThat(pdf.getContent().contains(MAGIC_STRING)).isTrue();
  }

}
