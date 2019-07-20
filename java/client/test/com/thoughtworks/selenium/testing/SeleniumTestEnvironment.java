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

import static org.openqa.selenium.build.DevMode.isInDevMode;

import org.openqa.selenium.build.BuckBuild;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.Page;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.os.CommandLine;

import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class SeleniumTestEnvironment implements TestEnvironment {
  private CommandLine command;
  private AppServer appServer;
  private String seleniumServerUrl;

  public SeleniumTestEnvironment(int port, String... extraArgs) {
    try {
      Path serverJar = new BuckBuild()
        .of("//java/server/test/org/openqa/selenium:server-with-tests").go(isInDevMode());

      List<Object> args = new ArrayList<>();
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

//    appServer = new SeleniumAppServer();
//    appServer.start();
    appServer = new AppServer() {
      @Override
      public String getHostName() {
        return "localhost";
      }

      @Override
      public String getAlternateHostName() {
        throw new UnsupportedOperationException("getAlternateHostName");
      }

      @Override
      public String whereIs(String relativeUrl) {
        try {
          return new URL(seleniumServerUrl + "/" + relativeUrl).toString();
        } catch (MalformedURLException e) {
          throw new RuntimeException(e);
        }
      }

      @Override
      public String whereElseIs(String relativeUrl) {
        throw new UnsupportedOperationException("whereElseIs");
      }

      @Override
      public String whereIsSecure(String relativeUrl) {
        throw new UnsupportedOperationException("whereIsSecure");
      }

      @Override
      public String whereIsWithCredentials(String relativeUrl, String user, String password) {
        throw new UnsupportedOperationException("whereIsWithCredentials");
      }

      @Override
      public String create(Page page) {
        throw new UnsupportedOperationException("create");
      }

      @Override
      public void start() {
        // no-op
      }

      @Override
      public void stop() {
        command.destroy();
      }
    };
  }

  public SeleniumTestEnvironment(String... extraArgs) {
    this(4444, extraArgs);
  }

  public SeleniumTestEnvironment() {
    this(PortProber.findFreePort());
  }

  @Override
  public AppServer getAppServer() {
    return appServer;
  }

  public String getSeleniumServerUrl() {
    return seleniumServerUrl;
  }

  @Override
  public void stop() {
    appServer.stop();
    command.destroy();
  }

  public static void main(String[] args) {
    new SeleniumTestEnvironment(4444);
  }
}
