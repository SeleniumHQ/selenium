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

package org.openqa.selenium.firefox;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.After;
import org.junit.Test;
import org.junit.Before;

import org.openqa.selenium.printoptions.print.PageSize;
import org.openqa.selenium.printoptions.PrintOptions;
import org.openqa.selenium.testing.JUnit4TestBase;

public class FireFoxPrintCommandTest extends JUnit4TestBase {

  private FirefoxDriver localDriver = new FirefoxDriver();
  private static String MAGIC_STRING = "JVBER";

  @Before
  public void setUp() {
    localDriver.get(pages.printPage);
  }
  @After
  public void tearDown() {
    if (localDriver != null) {
      localDriver.quit();
    }
  }

  @Test
  public void canPrintPage() {
    PrintOptions printOptions = new PrintOptions();

    String response = localDriver.printPage(printOptions);
    assertThat(response.contains(MAGIC_STRING)).isTrue();
  }

  @Test
  public void canPrintwoPages() {
    PrintOptions printOptions = new PrintOptions();
    printOptions.setPageRanges(new String[]{"1-2"});

    String response = localDriver.printPage(printOptions);
    assertThat(response.contains(MAGIC_STRING)).isTrue();
  }

  @Test
  public void canPrintWithValidParams() {
    PrintOptions printOptions = new PrintOptions();
    PageSize pageSize = new PageSize();
    pageSize.setWidth(30.0);

    printOptions.setPageRanges(new String[]{"1-2"});
    printOptions.setOrientation(PrintOptions.PrintOrientation.Landscape);
    printOptions.setPageSize(pageSize);

    String response = localDriver.printPage(printOptions);
    assertThat(response.contains(MAGIC_STRING)).isTrue();
  }
}
