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

package org.openqa.selenium.safari;


import static org.junit.Assert.assertEquals;
import static org.junit.Assume.assumeTrue;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class TechnologyPreviewTest extends JUnit4TestBase {

  @Before
  public void checkTechnologyPreviewInstalled() {
    Path driverShim =
      Paths.get("/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver");
    assumeTrue("Technology Preview not installed", Files.exists(driverShim));
  }

  @Test
  public void canStartTechnologyPreview() {
    SafariOptions options = new SafariOptions();
    options.setUseTechnologyPreview(true);

    WebDriver driver = new SafariDriver(options);

    driver.get(pages.xhtmlTestPage);
    assertEquals("XHTML Test Page", driver.getTitle());
  }

}
