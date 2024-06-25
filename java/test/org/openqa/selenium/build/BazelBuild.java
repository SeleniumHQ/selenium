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

import static org.openqa.selenium.build.DevMode.isInDevMode;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.logging.Logger;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.os.ExternalProcess;

public class BazelBuild {
  private static final Logger LOG = Logger.getLogger(BazelBuild.class.getName());

  public static File findBinRoot(File dir) {
    if ("bin".equals(dir.getName())) {
      return dir;
    } else {
      return findBinRoot(dir.getParentFile());
    }
  }

  public void build(String target) {
    if (!isInDevMode()) {
      // we should only need to do this when we're in dev mode
      // when running in a test suite, our dependencies should already
      // be listed.
      LOG.info("Not in dev mode. Ignoring attempt to build: " + target);
      return;
    }

    Path projectRoot = InProject.findProjectRoot();

    if (!Files.exists(projectRoot.resolve("Rakefile"))) {
      // we're not in dev mode
      return;
    }

    if (target == null || target.isEmpty()) {
      throw new IllegalStateException("No targets specified");
    }
    LOG.info("\nBuilding " + target + " ...");

    ExternalProcess process =
        ExternalProcess.builder()
            .command("bazel", "build", target)
            .directory(projectRoot.toAbsolutePath().toString())
            .copyOutputTo(System.err)
            .start();

    try {
      if (process.waitFor(Duration.ofHours(1))) {
        if (process.exitValue() != 0)
          throw new WebDriverException("Build failed! " + target + "\n" + process.getOutput());
      } else {
        throw new WebDriverException("Build timed out! " + target + "\n" + process.getOutput());
      }
    } catch (InterruptedException ex) {
      process.shutdown();
      throw new WebDriverException("Build interrupted! " + target + "\n" + process.getOutput());
    }
  }
}
