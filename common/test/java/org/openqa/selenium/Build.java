// Copyright 2010 Google Inc.  All Rights Reserved.

package org.openqa.selenium;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.openqa.selenium.internal.InProject;

import static org.junit.Assert.fail;
import static org.openqa.selenium.Platform.WINDOWS;

public class Build {
  private List<String> targets = new ArrayList<String>();

  public Build() {
    String command = Platform.getCurrent().is(WINDOWS) ? "go.bat" : "./go";
    targets.add(command);
  }

  public Build of(String... targets) {
    this.targets.addAll(Arrays.asList(targets));

    return this;
  }

  public void go() {
    System.out.println("Running " + targets);

    ProcessBuilder builder = new ProcessBuilder(targets);
    builder.directory(InProject.locate("Rakefile").getParentFile());
    try {
      executeBuild(builder);
    } catch (Exception e) {
      e.printStackTrace();
      fail("Cannot build");
    }
  }

  private void executeBuild(ProcessBuilder builder) throws Exception {
    Process process = builder.start();

    int exitValue = process.waitFor();
    if (exitValue != 0) {
      fail("Unable to build artifacts");
    }
  }
}
