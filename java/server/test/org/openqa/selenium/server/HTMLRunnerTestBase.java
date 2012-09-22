/*
 * Copyright 2011 Software Freedom Conservancy.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.openqa.selenium.server;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.rules.TestName;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.selenium.server.htmlrunner.HTMLLauncher;
import org.openqa.selenium.server.htmlrunner.HTMLResultsListener;
import org.openqa.selenium.server.htmlrunner.HTMLTestResults;

import java.io.File;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public abstract class HTMLRunnerTestBase implements HTMLResultsListener {

  @Rule public TestName name = new TestName();

  SeleniumServer server;
  HTMLLauncher launcher;
  HTMLTestResults results = null;
  protected boolean multiWindow = true;
  protected String suiteName = "TestSuite.html";
  protected String browserURL;
  File output;

  public HTMLRunnerTestBase() {
    super();
  }

  @Before
  public void setUp() throws Exception {
    output = new File(name.getMethodName() + "-results.html");
    System.out.println("Will print results to " + output.getAbsolutePath());
    HttpRequest.__maxFormContentSize = 400000;

  }

  protected void runHTMLSuite(String browser, boolean slowResources) throws Exception {
    server = new SeleniumServer(slowResources);
    launcher = new HTMLLauncher(server);
    server.start();
    browserURL = "http://localhost:" + server.getPort();
    String testURL = browserURL + "/selenium-server/tests/" + suiteName;
    int timeout = 60 * 15; // fifteen minutes
    String result =
        launcher.runHTMLSuite(browser, browserURL, testURL, output, timeout, multiWindow);
    assertTrue("Results file doesn't exist: " + output.getAbsolutePath(), output.exists());
    assertEquals("Tests didn't pass, check HTML output for details: " + output.getAbsolutePath(),
        "PASSED", result);
  }


  @After
  public void tearDown() throws Exception {
    if (server != null) server.stop();
  }

  public void processResults(HTMLTestResults r) {
    this.results = r;
  }
}
