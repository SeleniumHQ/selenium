// Copyright 2010 Google Inc.  All Rights Reserved.

package org.openqa.selenium;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.openqa.selenium.internal.InProject;

import static org.junit.Assert.fail;
import static org.openqa.selenium.Platform.WINDOWS;

public class Build {
  private List<String> targets = new ArrayList<String>();

  public Build of(String... targets) {
    this.targets.addAll(Arrays.asList(targets));
    return this;
  }

  public void go() {
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
    List<String> command = new ArrayList<String>();
    command.add(Platform.getCurrent().is(WINDOWS) ? "go.bat" : "./go");
    command.addAll(targets);
    ProcessBuilder builder = new ProcessBuilder(command);
    builder.directory(InProject.locate("Rakefile").getParentFile());
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
    private Process buildProcess;

    private BuildWatcher(Process buildProcess) {
      super("BuildWatcher");
      this.buildProcess = buildProcess;
    }

    public void run() {
      BufferedReader buildOutput = null;
      try {
        buildOutput = new BufferedReader(new InputStreamReader(buildProcess.getInputStream()), 8192);
        for (String s = buildOutput.readLine(); s != null && !interrupted(); s = buildOutput.readLine()) {
          try {
            System.out.println(">>> " + s);
          } catch (Throwable ignored) {}
        }
      } catch (Throwable e) {
        System.err.print("ERROR: Could not read from stdout of " + buildProcess + ":");
        e.printStackTrace(System.err);
      } finally {
        if (buildOutput != null) {
          try {
            buildOutput.close();
          } catch (Throwable ignored) {}
        }
      }
    }
  }
}
