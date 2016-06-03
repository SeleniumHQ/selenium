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

import com.google.common.collect.Lists;

import org.openqa.selenium.BuckBuild;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.os.CommandLine;

import java.net.URL;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.concurrent.TimeUnit;

public class SeleniumTestEnvironment implements TestEnvironment {
  private CommandLine command;
  private AppServer appServer;
  private String seleniumServerUrl;

  public SeleniumTestEnvironment(int port, String... extraArgs) {
    try {
      Path serverJar = new BuckBuild()
        .of("//java/server/test/org/openqa/selenium:server-with-tests").go();

      ArrayList<Object> args = Lists.newArrayList();
      if (Boolean.getBoolean("webdriver.debug")) {
        args.add("-Xdebug");
        args.add("-Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005");
      }

      args.add("-jar");
      args.add(serverJar.toAbsolutePath().toString());
      args.add("-port");
      args.add(String.valueOf(port));

      if (Boolean.getBoolean("singlewindow")) {
        args.add("singlewindow");
      }
      if (Boolean.getBoolean("webdriver.debug")) {
        args.add("-browserSideLog");
      }

      args.addAll(Arrays.asList(extraArgs));

      command = new CommandLine("java", args.toArray(new String[args.size()]));
      command.copyOutputTo(System.out);
      command.executeAsync();

      PortProber.pollPort(port);
      seleniumServerUrl = "http://localhost:" + port;

      URL status = new URL(seleniumServerUrl + "/tests");
      new UrlChecker().waitUntilAvailable(60, TimeUnit.SECONDS, status);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }

    appServer = new SeleniumAppServer();
    appServer.start();
  }

  public SeleniumTestEnvironment(String... extraArgs) {
    this(4444, extraArgs);
  }

  public SeleniumTestEnvironment() {
    this(PortProber.findFreePort());
  }

  public AppServer getAppServer() {
    return appServer;
  }

  public String getSeleniumServerUrl() {
    return seleniumServerUrl;
  }

  public void stop() {
    appServer.stop();
    command.destroy();
  }

  public static void main(String[] args) {
    new SeleniumTestEnvironment(4444);
  }
}
