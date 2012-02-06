/*
Copyright 2011 WebDriver committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium.testing.drivers;

import com.google.common.base.Throwables;

import org.openqa.selenium.Build;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.InProject;

import java.net.MalformedURLException;
import java.net.URL;

import static java.util.concurrent.TimeUnit.SECONDS;

public class OutOfProcessSeleniumServer {

  private String baseUrl;
  private CommandLine command;

  public void start() {
    if (command != null) {
      throw new RuntimeException("Server already started");
    }
    String path = buildServer();

    int port = PortProber.findFreePort();
    String localAddress = new NetworkUtils().getPrivateLocalAddress();
    baseUrl = String.format("http://%s:%d", localAddress, port);

    command = new CommandLine("java", "-jar", path, "-port", String.valueOf((port)), "-browserSideLog");
    command.executeAsync();

    try {
      URL url = new URL(baseUrl + "/wd/hub/status");
      new UrlChecker().waitUntilAvailable(60, SECONDS, url);
    } catch (UrlChecker.TimeoutException e) {
      throw Throwables.propagate(e);
    } catch (MalformedURLException e) {
      throw Throwables.propagate(e);
    }
  }

  public Capabilities describe() {
    // Default to supplying firefox instances.
    // TODO(simon): It's wrong to have this here.
    DesiredCapabilities capabilities = DesiredCapabilities.firefox();
    capabilities.setCapability("selenium.server.url", baseUrl);
    return capabilities;
  }

  public void stop() {
    if (command == null) {
      return;
    }
    command.destroy();
    command = null;
  }

  private String buildServer() {
    new Build().of("//java/server/src/org/openqa/grid/selenium:selenium:uber").go();
    return InProject.locate(
        "build/java/server/src/org/openqa/grid/selenium/selenium-standalone.jar").getAbsolutePath();
  }

  public URL getWebDriverUrl() {
    try {
      return new URL(baseUrl + "/wd/hub");
    } catch (MalformedURLException e) {
      throw Throwables.propagate(e);
    }
  }
}
