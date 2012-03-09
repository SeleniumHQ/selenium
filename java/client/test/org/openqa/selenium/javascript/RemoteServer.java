/*
Copyright 2011 Software Freedom Conservancy.

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

package org.openqa.selenium.javascript;

import com.google.common.base.Throwables;

import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.testing.drivers.OutOfProcessSeleniumServer;

import java.net.URL;
import java.util.concurrent.TimeUnit;

import javax.servlet.Servlet;

enum RemoteServer implements AppServer {
  INSTANCE;

  private final OutOfProcessSeleniumServer server;

  RemoteServer() {
    server = new OutOfProcessSeleniumServer();
  }

  public void start() {
    try {
      server.start();

      URL statusUrl = new URL(whereIs("/wd/hub/status"));
      new UrlChecker().waitUntilAvailable(20, TimeUnit.SECONDS, statusUrl);
    } catch (Exception e) {
      throw Throwables.propagate(e);
    }
  }

  public void stop() {
    server.stop();
  }

  public String getHostName() {
    return "localhost";
  }

  public String getAlternateHostName() {
    return getHostName();
  }

  public String whereIs(String relativeUrl) {
    URL webDriverUrl = server.getWebDriverUrl();
    return String.format("http://localhost:%d%s", webDriverUrl.getPort(), relativeUrl);
  }

  public String whereElseIs(String relativeUrl) {
    return whereIs(relativeUrl);
  }

  public void addAdditionalWebApplication(String context, String absolutePath) {}
  public void addServlet(String name, String url, Class<? extends Servlet> servletClass) {}
  public void listenOn(int port) {}
  public void listenSecurelyOn(int port) {}
  public String whereIsSecure(String relativeUrl) { return null; }
  public String whereIsWithCredentials(String relativeUrl, String user, String password) {
    return null;
  }
}
