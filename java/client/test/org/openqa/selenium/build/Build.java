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
package org.openqa.selenium.build;

import static org.junit.Assert.fail;
import static org.openqa.selenium.Platform.WINDOWS;
import static org.openqa.selenium.build.DevMode.isInDevMode;

import org.openqa.selenium.Platform;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;

public class Build {
  private static Logger log = Logger.getLogger(Build.class.getName());

  private List<String> targets = new ArrayList<>();

  public Build of(String... targets) {
    this.targets.addAll(Arrays.asList(targets));
    return this;
  }

  public void go() {
    if (!isInDevMode()) {
      // we should only need to do this when we're in dev mode
      // when running in a test suite, our dependencies should already
      // be listed.
      log.info("Not in dev mode. Ignoring attempt to build: " + targets);
      return;
    }

    if (targets.isEmpty()) {
      throw new IllegalStateException("No targets specified");
    }
    System.out.println("\nBuilding " + targets + " ...");
    ProcessBuilder builder = prepareBuild();
    try {
      executeBuild(builder);
    } catch (Exception e) {
      e.printStackTrace(System.err);
      fail("Cannot build");
    }
  }

  private ProcessBuilder prepareBuild() {
    List<String> command = new ArrayList<>();
    if (Platform.getCurrent().is(WINDOWS)) {
      command.add("cmd.exe");
      command.add("/c");
      command.add("go.bat");
    } else {
      command.add("./go");
    }
    command.addAll(targets);
    ProcessBuilder builder = new ProcessBuilder(command);
    builder.directory(InProject.locate("Rakefile").getParent().toFile());
    builder.redirectErrorStream(true);
    return builder;
  }

  private void executeBuild(ProcessBuilder builder) throws Exception {
    Process process = builder.start();
    BuildWatcher buildWatcher = new BuildWatcher(process);
    buildWatcher.start();
    int exitValue = process.waitFor();
    if (exitValue != 0) {
      fail("Unable to build artifacts");
    }
  }

  private static class BuildWatcher extends Thread {
    private final Process buildProcess;

    private BuildWatcher(Process buildProcess) {
      super("BuildWatcher");
      this.buildProcess = buildProcess;
    }

    @Override
    public void run() {
      try (BufferedReader buildOutput = new BufferedReader(
          new InputStreamReader(buildProcess.getInputStream(), Charset.defaultCharset()), 8192)) {
        for (String s = buildOutput.readLine(); s != null && !interrupted(); s =
            buildOutput.readLine()) {
          try {
            System.out.println(">>> " + s);
          } catch (Throwable ignored) {
          }
        }
      } catch (Throwable e) {
        System.err.print("ERROR: Could not read from stdout of " + buildProcess + ":");
        e.printStackTrace(System.err);
      }
    }
  }
}
