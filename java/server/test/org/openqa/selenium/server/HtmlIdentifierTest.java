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

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.server.log.LoggingManager;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class HtmlIdentifierTest {

  @Before
  public void setUp() throws Exception {
    LoggingManager.configureLogging(new RemoteControlConfiguration(), true);
  }

  @Test
  public void testMetaEquiv() {
    boolean result =
        HtmlIdentifier
            .shouldBeInjected(
                "/selenium-server/tests/proxy_injection_meta_equiv_test.js",
                "application/x-javascript",
                "<!DOCTYPE html PUBLIC \\\"-//W3C//DTD XHTML 1.0 Transitional//EN \\\" \\\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\\\"><html xmlns=\\\"http://www.w3.org/1999/xhtml\\\">\\n<head>\\n  <meta http-equiv=\\\"Content-Type\\\" content=\\\"text/html; charset=ISO-8859-\"; var s2=\"1\\\" />\\n  <title>Insert</title>\\n</head>\\n<body>n<p><strong>DWR tests passed</strong></p>\\n\\n</body>\\n</html>\\n\";");
    assertFalse("improper injection", result);
  }

  @Test
  public void testGoogleScenario() {
    boolean result = HtmlIdentifier.shouldBeInjected("http://www.google.com/webhp",
        "text/html; charset=UTF-8",
        "<html>...</html>");
    assertTrue("improper injection", result);
  }

  @Test
  public void testStupidDellDotComScenario() {
    boolean result =
        HtmlIdentifier.shouldBeInjected("/menu.htm", "text/html",
            "var x = ''; someOtherJavaScript++; blahblahblah;");
    assertFalse("improper injection", result);
  }

}
