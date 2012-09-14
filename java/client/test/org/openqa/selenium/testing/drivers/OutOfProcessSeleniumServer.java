/*
Copyright 2011 Selenium committers
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

import com.google.common.io.Files;
import org.openqa.selenium.Build;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.InProject;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.LinkedList;
import java.util.List;

import static java.util.concurrent.TimeUnit.SECONDS;

public class OutOfProcessSeleniumServer {

  private String baseUrl;
  private CommandLine command;
  private boolean captureLogs = false;
  
  /**
   * Creates an out of process server with log capture enabled.
   * 
   * @return The new server.
   */
  public void enableLogCapture() {
    captureLogs = true;
  }

  public OutOfProcessSeleniumServer start() {
    if (command != null) {
      throw new RuntimeException("Server already started");
    }

    String classPath = buildServerAndClasspath();

    int port = PortProber.findFreePort();
    String localAddress = new NetworkUtils().getPrivateLocalAddress();
    baseUrl = String.format("http://%s:%d", localAddress, port);

    List<String> cmdLine = new LinkedList<String>();
    cmdLine.add("java");
    cmdLine.add("-cp");
    cmdLine.add(classPath);
    cmdLine.add("org.openqa.grid.selenium.GridLauncher");
    cmdLine.add("-port");
    cmdLine.add(String.valueOf(port));
    cmdLine.add("-browserSideLog");
    if (captureLogs) {
      cmdLine.add("-captureLogsOnQuit");
    }
    command = new CommandLine(cmdLine.toArray(new String[cmdLine.size()]));
    
    if (Boolean.getBoolean("webdriver.development")) {
      command.copyOutputTo(System.err);
    }
    command.setWorkingDirectory(InProject.locate("Rakefile").getParentFile().getAbsolutePath());
    command.executeAsync();

    try {
      URL url = new URL(baseUrl + "/wd/hub/status");
      new UrlChecker().waitUntilAvailable(60, SECONDS, url);
    } catch (UrlChecker.TimeoutException e) {
      throw Throwables.propagate(e);
    } catch (MalformedURLException e) {
      throw Throwables.propagate(e);
    }
    
    return this;
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

  private String buildServerAndClasspath() {
    new Build().of("//java/server/src/org/openqa/grid/selenium:selenium")
        .of("//java/server/src/org/openqa/grid/selenium:selenium:classpath")
        .go();

    String classpathFile = InProject.locate(
        "build/java/server/src/org/openqa/grid/selenium/selenium.classpath").getAbsolutePath();
    try {
      return Files.readFirstLine(new File(classpathFile), Charset.defaultCharset());
    } catch (IOException e) {
      Throwables.propagate(e);
    }

    return "";
  }
  
  public URL getWebDriverUrl() {
    try {
      return new URL(baseUrl + "/wd/hub");
    } catch (MalformedURLException e) {
      throw Throwables.propagate(e);
    }
  }
}
