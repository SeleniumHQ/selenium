
package org.openqa.selenium;

import com.google.common.collect.Lists;

import static org.openqa.selenium.Platform.WINDOWS;

import static org.junit.Assert.fail;
import static org.openqa.selenium.testing.DevMode.isInDevMode;

import org.openqa.selenium.testing.InProject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;

public class Build {
  private static Logger log = Logger.getLogger(Build.class.getName());
  
  private List<String> targets = Lists.newArrayList();

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
    private final Process buildProcess;

    private BuildWatcher(Process buildProcess) {
      super("BuildWatcher");
      this.buildProcess = buildProcess;
    }

    @Override
    public void run() {
      BufferedReader buildOutput = null;
      try {
        buildOutput =
            new BufferedReader(new InputStreamReader(buildProcess.getInputStream()), 8192);
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
      } finally {
        if (buildOutput != null) {
          try {
            buildOutput.close();
          } catch (Throwable ignored) {
          }
        }
      }
    }
  }
}
