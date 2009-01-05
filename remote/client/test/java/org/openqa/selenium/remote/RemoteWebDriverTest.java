/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.remote;

import junit.framework.TestCase;

import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.Jetty6AppServer;
import org.openqa.selenium.remote.server.DriverServlet;

import java.io.File;

public class RemoteWebDriverTest extends TestCase {

  public void xtestShouldBeAbleToCreateANewSession() throws Exception {
    AppServer servletServer = new Jetty6AppServer() {
      protected File findRootOfWebApp() {
        File common = super.findRootOfWebApp();
        return new File(common, "../../../remote/server/src/web");
      }
    };
    servletServer.listenOn(7055);
    servletServer.addServlet("remote webdriver", "/hub/*", DriverServlet.class);
    servletServer.start();

    Jetty6AppServer mainServer = new Jetty6AppServer();
    mainServer.listenOn(3000);
    mainServer.start();

    RemoteWebDriver driver = new RemoteWebDriver(DesiredCapabilities.htmlUnit());
    driver.get("http://localhost:3000/xhtmlTest.html");
    System.out.println("title = " + driver.getTitle());
    System.out.println("url = " + driver.getCurrentUrl());
  }

  public static void main(String[] args) {
    AppServer servletServer = new Jetty6AppServer() {
      protected File findRootOfWebApp() {
        File common = super.findRootOfWebApp();
        return new File(common, "../../../remote/server/src/web");
      }
    };
    servletServer.listenOn(7055);
    servletServer.addServlet("remote webdriver", "/hub/*", DriverServlet.class);
    servletServer.start();
  }

}
