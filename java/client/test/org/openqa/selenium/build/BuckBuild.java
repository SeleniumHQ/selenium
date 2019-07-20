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

import static com.google.common.base.StandardSystemProperty.LINE_SEPARATOR;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.Platform.WINDOWS;

import com.google.common.base.Preconditions;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableList;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.os.CommandLine;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.logging.Logger;

public class BuckBuild {
  private static Logger log = Logger.getLogger(BuckBuild.class.getName());

  private String target;

  public BuckBuild of(String target) {
    this.target = target;
    return this;
  }

  public Path go(boolean inDevMode) {
    Path projectRoot = InProject.locate("Rakefile").getParent();

    if (!inDevMode) {
      // we should only need to do this when we're in dev mode
      // when running in a test suite, our dependencies should already
      // be listed.
      log.info("Not in dev mode. Ignoring attempt to build: " + target);
      return findOutput(projectRoot);
    }

    if (target == null || "".equals(target)) {
      throw new IllegalStateException("No targets specified");
    }
    System.out.println("\nBuilding " + target + " ...");

    ImmutableList.Builder<String> builder = ImmutableList.builder();
    findBuck(projectRoot, builder);
    builder.add("build", "--config", "color.ui=never", target);

    ImmutableList<String> command = builder.build();
    CommandLine commandLine = new CommandLine(command.toArray(new String[0]));
    commandLine.setWorkingDirectory(projectRoot.toAbsolutePath().toString());
    commandLine.copyOutputTo(System.err);
    commandLine.execute();

    if (!commandLine.isSuccessful()) {
      throw new WebDriverException("Build failed! " + target + "\n" + commandLine.getStdOut());
    }

    return findOutput(projectRoot);
  }

  private Path findOutput(Path projectRoot) {
    ImmutableList.Builder<String> builder = ImmutableList.builder();
    findBuck(projectRoot, builder);
    builder.add("targets", "--show-full-output", "--config", "color.ui=never", target);

    ImmutableList<String> command = builder.build();
    CommandLine commandLine = new CommandLine(command.toArray(new String[0]));
    commandLine.setWorkingDirectory(projectRoot.toAbsolutePath().toString());
    commandLine.copyOutputTo(System.err);
    commandLine.execute();

    if (!commandLine.isSuccessful()) {
      throw new WebDriverException("Unable to find output! " + target);
    }

    String stdOut = commandLine.getStdOut();
    String[] allLines = stdOut.split(LINE_SEPARATOR.value());
    String lastLine = null;
    for (String line : allLines) {
      if (line.startsWith(target)) {
        lastLine = line;
        break;
      }
    }
    Preconditions.checkNotNull(lastLine, "Value read: %s", stdOut);

    List<String> outputs = Splitter.on(' ').limit(2).splitToList(lastLine);
    if (outputs.size() != 2) {
      throw new WebDriverException(
        String.format("Unable to find output! %s, %s", target, lastLine));
    }

    Path output = projectRoot.resolve(outputs.get(1));

    if (!Files.exists(output)) {
      throw new WebDriverException(
        String.format("Found output, but it does not exist: %s, %s", target, output));
    }

    return output;
  }

  private void findBuck(Path projectRoot, ImmutableList.Builder<String> builder) {
    Path buckw = projectRoot.resolve(Platform.getCurrent().is(WINDOWS) ? "buckw.bat" : "buckw");

    assertTrue("Unable to find buckw: " + buckw, Files.exists(buckw));

    builder.add(buckw.toAbsolutePath().toString());
  }
}
