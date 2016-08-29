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

package org.openqa.selenium.server.htmlrunner;

/**
 * Handles results of HTMLRunner (aka TestRunner, FITRunner) in automatic mode.
 *
 * @author Dan Fabulich
 * @author Darren Cotterill
 * @author Ajit George
 *
 */
@SuppressWarnings("serial")
public class SeleniumHTMLRunnerResultsHandler  {
//  static Logger log = Logger.getLogger(SeleniumHTMLRunnerResultsHandler.class.getName());
//
//  HttpContext context;
//  List<HTMLResultsListener> listeners;
//  boolean started = false;
//
//  public SeleniumHTMLRunnerResultsHandler() {
//    listeners = new Vector<HTMLResultsListener>();
//  }
//
//  public void addListener(HTMLResultsListener listener) {
//    listeners.add(listener);
//  }
//
//  public void handle(String pathInContext, String pathParams, HttpRequest request, HttpResponse res)
//      throws HttpException, IOException {
//    if (!"/postResults".equals(pathInContext)) return;
//    request.setHandled(true);
//    log.info("Received posted results");
//    String result = request.getParameter("result");
//    if (result == null) {
//      res.getOutputStream().write("No result was specified!".getBytes());
//    }
//    String seleniumVersion = request.getParameter("selenium.version");
//    String seleniumRevision = request.getParameter("selenium.revision");
//    String totalTime = request.getParameter("totalTime");
//    String numTestTotal = request.getParameter("numTestTotal");
//    String numTestPasses = request.getParameter("numTestPasses");
//    String numTestFailures = request.getParameter("numTestFailures");
//    String numCommandPasses = request.getParameter("numCommandPasses");
//    String numCommandFailures = request.getParameter("numCommandFailures");
//    String numCommandErrors = request.getParameter("numCommandErrors");
//    String suite = request.getParameter("suite");
//    String postedLog = request.getParameter("log");
//
//    int numTotalTests = Integer.parseInt(numTestTotal);
//
//    List<String> testTables = createTestTables(request, numTotalTests);
//
//
//    HTMLTestResults results =
//        new HTMLTestResults(seleniumVersion, seleniumRevision,
//            result, totalTime, numTestTotal,
//            numTestPasses, numTestFailures, numCommandPasses, numCommandFailures, numCommandErrors,
//            suite, testTables, postedLog);
//
//    for (Iterator<HTMLResultsListener> i = listeners.iterator(); i.hasNext();) {
//      HTMLResultsListener listener = i.next();
//      listener.processResults(results);
//      i.remove();
//    }
//    processResults(results, res);
//  }
//
//  /** Print the test results out to the HTML response */
//  private void processResults(HTMLTestResults results, HttpResponse res) throws IOException {
//    res.setContentType("text/html");
//    OutputStream out = res.getOutputStream();
//    Writer writer = new OutputStreamWriter(out, StringUtil.__ISO_8859_1);
//    results.write(writer);
//    writer.flush();
//  }
//
//  private List<String> createTestTables(HttpRequest request, int numTotalTests) {
//    List<String> testTables = new LinkedList<String>();
//    for (int i = 1; i <= numTotalTests; i++) {
//      String testTable = request.getParameter("testTable." + i);
//      // System.out.println("table " + i);
//      // System.out.println(testTable);
//      testTables.add(testTable);
//    }
//    return testTables;
//  }
//
//  public String getName() {
//    return SeleniumHTMLRunnerResultsHandler.class.getName();
//  }
//
//  public HttpContext getHttpContext() {
//    return context;
//  }
//
//  public void initialize(HttpContext c) {
//    this.context = c;
//
//  }
//
//  public void start() throws Exception {
//    started = true;
//  }
//
//  public void stop() throws InterruptedException {
//    started = false;
//  }
//
//  public boolean isStarted() {
//    return started;
//  }
}
