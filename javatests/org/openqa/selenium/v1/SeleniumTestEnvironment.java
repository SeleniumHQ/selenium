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

package org.openqa.selenium.v1;

import java.io.File;
import java.io.IOException;

import com.google.common.io.Files;
import org.openqa.selenium.Build;
import org.openqa.selenium.DevMode;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.internal.CommandLine;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.internal.InProject;
import org.openqa.selenium.internal.PortProber;

public class SeleniumTestEnvironment implements TestEnvironment {
  private int port = 4444;
  private CommandLine command;

  public SeleniumTestEnvironment() {
    try {
      if (DevMode.isInDevMode()) {
        new Build().of("//selenium:server-with-tests:uber").go();
        copyAtomsToSeleniumBuildDir();
      }

      File seleniumJar = InProject.locate("build/java/org/openqa/selenium/server/server-with-tests-standalone.jar");
      command = new CommandLine("java", "-jar", seleniumJar.getAbsolutePath(), "-port", "" + port);
      command.executeAsync();

      PortProber.pollPort(port);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private void copyAtomsToSeleniumBuildDir() throws IOException {
    File classes = InProject.locate("selenium/build/classes");
    File scriptsDir = new File(classes, "scripts/selenium");
    FileHandler.createDir(scriptsDir);

    File sourceDir = InProject.locate("build/common/src/js/selenium");
    String[] sources = new String[] {
        "findElement.js",
        "isElementPresent.js",
        "isTextPresent.js",
        "isVisible.js",
    };

    for (String source : sources) {
      Files.copy(new File(sourceDir, source), new File(scriptsDir, source));
    }
  }


  public AppServer getAppServer() {
    throw new UnsupportedOperationException("getAppServer");
  }

  public void stop() {
    command.destroy();
  }

  public static void main(String[] args) throws IOException {
    new SeleniumTestEnvironment();
  }
}
