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

package com.thoughtworks.selenium.testing;

import org.openqa.selenium.environment.webserver.JettyAppServer;
import org.openqa.selenium.build.InProject;
import org.seleniumhq.jetty9.servlet.ServletContextHandler;

import java.nio.file.Path;

public class SeleniumAppServer extends JettyAppServer {

  private static final String RC_CONTEXT_PATH = "/selenium-server";

  public SeleniumAppServer() {
    this(detectHostname(), getHttpPortFromEnv(), getHttpsPortFromEnv());
  }

  public SeleniumAppServer(String hostname, int httpPort, int httpsPort) {
    super(hostname, httpPort, httpsPort);
    ServletContextHandler context = addResourceHandler(RC_CONTEXT_PATH, findRootOfRcTestPages());
    addServlet(context, "/cachedContentTest", CachedContentServlet.class);
  }

  protected Path findRootOfRcTestPages() {
    return InProject.locate("java/server/test/org/openqa/selenium");
  }

  @Override
  protected String getMainContextPath(String relativeUrl) {
    if (!relativeUrl.startsWith("/")) {
      relativeUrl = RC_CONTEXT_PATH + "/" + relativeUrl;
    }
    return relativeUrl;
  }

  public static void main(String[] args) {
    int httpPort = getHttpPortFromEnv();
    int httpsPort = getHttpsPortFromEnv();
    System.out.println(String.format("Starting server on HTTPS port %d and HTTPS port %d",
                                     httpPort, httpsPort));
    new SeleniumAppServer(detectHostname(), httpPort, httpsPort).start();
  }

}
