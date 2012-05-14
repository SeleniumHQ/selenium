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

package org.openqa.selenium.server.htmlrunner;

import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.http.handler.ResourceHandler;
import org.openqa.jetty.util.StringUtil;

import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.text.MessageFormat;

/**
 * Generates a test suite table designed to run a single Selenium test; to use it, point
 * TestRunner.html to /singleTest/http://my.com/single/test.html
 * 
 * @author dfabulich
 * 
 */
public class SingleTestSuiteResourceHandler extends ResourceHandler {

  private static final String HTML =
      "<html>\n<head>\n<title>{0} Suite</title>\n</head>\n<body>\n<table cellpadding=\"1\" cellspacing=\"1\" border=\"1\">\n<tbody>\n<tr><td><b>{0} Suite</b></td></tr>\n<tr><td><a href=\"{1}\">{0}</a></td></tr>\n</tbody>\n</table>\n</body>\n</html>";

  /** Handles the HTTP request and generates the suite table */
  @Override
  public void handle(String pathInContext, String pathParams,
      HttpRequest request, HttpResponse response) throws HttpException,
      IOException {
    if (!pathInContext.startsWith("/singleTest/")) return;
    request.setHandled(true);
    String url = pathInContext.substring("/singleTest/".length());
    OutputStream outStream = response.getOutputStream();
    if (url == null) {
      outStream.write("No singleTest was specified!".getBytes());
      outStream.flush();
      return;
    }
    response.setContentType("text/html");
    String suiteName = getSuiteName(url);
    Writer writer = new OutputStreamWriter(response.getOutputStream(), StringUtil.__ISO_8859_1);
    writer.write(MessageFormat.format(HTML, new Object[] {suiteName, url}));
    writer.flush();
  }

  private String getSuiteName(String path) {
    int lastSlash = path.lastIndexOf('/');
    String fileName = path.substring(lastSlash + 1);
    return fileName;
  }
}
