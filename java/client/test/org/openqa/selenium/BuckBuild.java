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

package org.openqa.selenium;

import static com.google.common.base.StandardSystemProperty.LINE_SEPARATOR;
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;
import static org.openqa.selenium.Platform.WINDOWS;
import static org.openqa.selenium.testing.DevMode.isInDevMode;

import com.google.common.base.Preconditions;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableList;
import com.google.common.hash.HashCode;
import com.google.common.hash.Hashing;

import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.testing.InProject;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
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

  public Path go() throws IOException {
    Path projectRoot = InProject.locate("Rakefile").getParent();

    if (!isInDevMode()) {
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
    CommandLine commandLine = new CommandLine(command.toArray(new String[command.size()]));
    commandLine.copyOutputTo(System.err);
    commandLine.execute();

    if (!commandLine.isSuccessful()) {
      throw new WebDriverException("Build failed! " + target);
    }

    return findOutput(projectRoot);
  }

  private Path findOutput(Path projectRoot) throws IOException {
    ImmutableList.Builder<String> builder = ImmutableList.builder();
    findBuck(projectRoot, builder);
    builder.add("targets", "--show-full-output", "--config", "color.ui=never", target);

    ImmutableList<String> command = builder.build();
    CommandLine commandLine = new CommandLine(command.toArray(new String[command.size()]));
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

  private void findBuck(Path projectRoot, ImmutableList.Builder<String> builder) throws IOException {
    Path noBuckCheck = projectRoot.resolve(".nobuckcheck");

    // If there's a .nobuckcheck in the root of the file, and we can execute "buck", then assume
    // that the developer knows what they're doing. Ha! Ahaha! Ahahahaha!
    if (Files.exists(noBuckCheck)) {
      String buckCommand = CommandLine.find("buck");
      if (buckCommand != null) {
        builder.add(buckCommand);
        return;
      }
    }

    downloadBuckPexIfNecessary(builder);
  }

  private void downloadBuckPexIfNecessary(ImmutableList.Builder<String> builder)
    throws IOException {
    Path projectRoot = InProject.locate("Rakefile").getParent();
    String buckVersion = new String(Files.readAllBytes(projectRoot.resolve(".buckversion"))).trim();

    Path pex = projectRoot.resolve("buck-out/crazy-fun/" + buckVersion + "/buck.pex");

    String expectedHash = new String(Files.readAllBytes(projectRoot.resolve(".buckhash"))).trim();
    HashCode md5 = Files.exists(pex) ?
                   Hashing.md5().hashBytes(Files.readAllBytes(pex)) :
                   HashCode.fromString("aa");  // So we have a non-null value

    if (!Files.exists(pex) || !expectedHash.equals(md5.toString())) {
      log.warning("Downloading PEX");

      if (!Files.exists(pex.getParent())) {
        Files.createDirectories(pex.getParent());
      }

      URL url = new URL(String.format(
          "https://github.com/SeleniumHQ/buck/releases/download/buck-release-%s/buck.pex",
          buckVersion));
      HttpURLConnection connection = (HttpURLConnection) url.openConnection();
      connection.setInstanceFollowRedirects(true);
      Files.copy(connection.getInputStream(), pex, REPLACE_EXISTING);
      // Do our best to make this executable
      pex.toFile().setExecutable(true);
    }

    md5 = Hashing.md5().hashBytes(Files.readAllBytes(pex));
    if (!expectedHash.equals(md5.toString())) {
      throw new WebDriverException("Unable to confirm that download is valid");
    }

    if (Platform.getCurrent().is(WINDOWS)) {
      String python = CommandLine.find("python2");
      if (python == null) {
        python = CommandLine.find("python");
      }
      Preconditions.checkNotNull(python, "Unable to find python executable");
      builder.add(python);
    }

    builder.add(pex.toAbsolutePath().toString());
  }

  public static void main(String[] args) throws IOException {
    new BuckBuild().of("se3-server").go();
  }
}
