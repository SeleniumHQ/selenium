/*
Copyright 2011 Selenium committers

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

package org.openqa.selenium.v1;

import org.openqa.selenium.environment.webserver.AppServer;

import javax.servlet.Servlet;

public class SeleniumAppServer implements AppServer {
  private final int port;

  public SeleniumAppServer(int port) {
    this.port = port;
  }

  public String getHostName() {
    return "localhost";
  }

  public String getAlternateHostName() {
    throw new UnsupportedOperationException("getAlternateHostName");
  }

  public String whereIs(String relativeUrl) {
    return "http://localhost:" + port + relativeUrl;
  }

  public String whereElseIs(String relativeUrl) {
    throw new UnsupportedOperationException("whereElseIs");
  }

  public String whereIsSecure(String relativeUrl) {
    throw new UnsupportedOperationException("whereIsSecure");
  }

  public String whereIsWithCredentials(String relativeUrl, String user, String password) {
    throw new UnsupportedOperationException("whereIsWithCredentials");
  }

  public void start() {
    // does nothing
  }

  public void stop() {
    // does nothing
  }

  public void addAdditionalWebApplication(String context, String absolutePath) {
    throw new UnsupportedOperationException("addAdditionalWebApplication");
  }

  public void addServlet(String name, String url, Class<? extends Servlet> servletClass) {
    throw new UnsupportedOperationException("addServlet");
  }

  public void listenOn(int port) {
    throw new UnsupportedOperationException("listenOn");
  }

  public void listenSecurelyOn(int port) {
    throw new UnsupportedOperationException("listenSecurelyOn");
  }
}
