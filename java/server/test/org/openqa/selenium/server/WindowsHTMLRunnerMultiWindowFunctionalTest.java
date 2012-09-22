/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.server;

import org.junit.Assume;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Platform;

import static org.junit.Assert.fail;
import static org.openqa.selenium.Platform.WINDOWS;

public class WindowsHTMLRunnerMultiWindowFunctionalTest extends HTMLRunnerTestBase {
  public WindowsHTMLRunnerMultiWindowFunctionalTest() {
    super.multiWindow = true;
  }

  @Before
  public void assumeOnLinux() {
    Assume.assumeTrue(Platform.getCurrent().is(WINDOWS));
  }

  @Test
  public void testFirefox() throws Exception {
    runHTMLSuite("*firefox", false);
  }

  @Test
  public void testIExplore() throws Exception {
    runHTMLSuite("*iexplore", false);
  }

  @Test
  public void testChrome() throws Exception {
    runHTMLSuite("*chrome", false);
  }

  @Test
  public void testOpera() throws Exception {
    runHTMLSuite("*opera", false);
  }

  @Test
  public void testHTA() throws Exception {
    try {
      runHTMLSuite("*iehta", false);
      fail("Didn't catch expected exception");
    } catch (UnsupportedOperationException e) {
      System.out.println("caught expected exception");
    }
  }

}
