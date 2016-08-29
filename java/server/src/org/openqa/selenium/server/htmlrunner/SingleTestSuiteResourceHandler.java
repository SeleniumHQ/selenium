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
 * Generates a test suite table designed to run a single Selenium test; to use it, point
 * TestRunner.html to /singleTest/http://my.com/single/test.html
 *
 * @author dfabulich
 *
 */
public class SingleTestSuiteResourceHandler  {
//
//  private static final String HTML =
//      "<html>\n<head>\n<title>{0} Suite</title>\n</head>\n<body>\n<table cellpadding=\"1\" cellspacing=\"1\" border=\"1\">\n<tbody>\n<tr><td><b>{0} Suite</b></td></tr>\n<tr><td><a href=\"{1}\">{0}</a></td></tr>\n</tbody>\n</table>\n</body>\n</html>";
//
//  /** Handles the HTTP request and generates the suite table */
//  @Override
//  public void handle(String pathInContext, String pathParams,
//      HttpRequest request, HttpResponse response) throws HttpException,
//      IOException {
//    if (!pathInContext.startsWith("/singleTest/")) return;
//    request.setHandled(true);
//    String url = pathInContext.substring("/singleTest/".length());
//    OutputStream outStream = response.getOutputStream();
//    if (url == null) {
//      outStream.write("No singleTest was specified!".getBytes());
//      outStream.flush();
//      return;
//    }
//    response.setContentType("text/html");
//    String suiteName = getSuiteName(url);
//    Writer writer = new OutputStreamWriter(response.getOutputStream(), StringUtil.__ISO_8859_1);
//    writer.write(MessageFormat.format(HTML, new Object[] {suiteName, url}));
//    writer.flush();
//  }
//
//  private String getSuiteName(String path) {
//    int lastSlash = path.lastIndexOf('/');
//    String fileName = path.substring(lastSlash + 1);
//    return fileName;
//  }
}
