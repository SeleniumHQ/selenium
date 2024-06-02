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
package org.openqa.selenium.manager;

import static org.openqa.selenium.Platform.LINUX;
import static org.openqa.selenium.Platform.MAC;
import static org.openqa.selenium.Platform.UNIX;
import static org.openqa.selenium.Platform.WINDOWS;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.Beta;
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.manager.SeleniumManagerOutput.Result;
import org.openqa.selenium.os.ExternalProcess;

/**
 * This implementation is still in beta, and may change.
 *
 * <p>The Selenium-Manager binaries are distributed in a JAR file
 * (org.openqa.selenium:selenium-manager) for the Java binding language. Since these binaries are
 * compressed within these JAR, we need to serialize the proper binary for the current platform
 * (Windows, macOS, or Linux) as an executable file. To implement this we use a singleton pattern,
 * since this way, we have a single instance in the JVM, and we reuse the resulting binary for all
 * the calls to the Selenium Manager singleton during all the Java process lifetime, deleting the
 * binary (stored as a local temporal file) on runtime shutdown.
 */
@Beta
public class SeleniumManager {

  private static final Logger LOG = Logger.getLogger(SeleniumManager.class.getName());

  private static final String SELENIUM_MANAGER = "selenium-manager";
  private static final String DEFAULT_CACHE_PATH = "~/.cache/selenium";
  private static final String BINARY_PATH_FORMAT = "/manager/%s/%s";
  private static final String HOME = "~";
  private static final String CACHE_PATH_ENV = "SE_CACHE_PATH";
  private static final String BETA_PREFIX = "0.";
  private static final String EXE = ".exe";
  private static final String SE_ENV_PREFIX = "SE_";

  private static volatile SeleniumManager manager;
  private final String managerPath = System.getenv("SE_MANAGER_PATH");
  private Path binary = managerPath == null ? null : Paths.get(managerPath);
  private final String seleniumManagerVersion;
  private boolean binaryInTemporalFolder = false;

  /** Wrapper for the Selenium Manager binary. */
  private SeleniumManager() {
    BuildInfo info = new BuildInfo();
    String releaseLabel = info.getReleaseLabel();
    int lastDot = releaseLabel.lastIndexOf(".");
    seleniumManagerVersion = BETA_PREFIX + releaseLabel.substring(0, lastDot);
    if (managerPath == null) {
      Runtime.getRuntime()
          .addShutdownHook(
              new Thread(
                  () -> {
                    if (binaryInTemporalFolder && binary != null && Files.exists(binary)) {
                      try {
                        Files.delete(binary);
                      } catch (IOException e) {
                        LOG.warning(
                            String.format(
                                "%s deleting temporal file: %s",
                                e.getClass().getSimpleName(), e.getMessage()));
                      }
                    }
                  }));
    } else {
      LOG.fine(String.format("Selenium Manager set by env 'SE_MANAGER_PATH': %s", managerPath));
    }
  }

  public static SeleniumManager getInstance() {
    if (manager == null) {
      synchronized (SeleniumManager.class) {
        if (manager == null) {
          manager = new SeleniumManager();
        }
      }
    }
    return manager;
  }

  /**
   * Executes a process with the given arguments.
   *
   * @param arguments the file and arguments to execute.
   * @return the standard output of the execution.
   */
  private static Result runCommand(Path binary, List<String> arguments) {
    LOG.fine(String.format("Executing Process: %s", arguments));

    String output;
    int code;
    try {
      ExternalProcess.Builder processBuilder = ExternalProcess.builder();

      Properties properties = System.getProperties();
      for (String name : properties.stringPropertyNames()) {
        if (name.startsWith(SE_ENV_PREFIX)) {
          // read property with 'default' value due to concurrency
          String value = properties.getProperty(name, "");
          if (!value.isEmpty()) {
            processBuilder.environment(name, value);
          }
        }
      }
      ExternalProcess process =
          processBuilder.command(binary.toAbsolutePath().toString(), arguments).start();

      if (!process.waitFor(Duration.ofHours(1))) {
        LOG.warning("Selenium Manager did not exit, shutting it down");
        process.shutdown();
      }
      code = process.exitValue();
      output = process.getOutput(StandardCharsets.UTF_8);
    } catch (Exception e) {
      throw new WebDriverException("Failed to run command: " + arguments, e);
    }
    SeleniumManagerOutput jsonOutput = null;
    JsonException failedToParse = null;
    String dump = output;
    if (!output.isEmpty()) {
      try {
        jsonOutput = new Json().toType(output, SeleniumManagerOutput.class);
        jsonOutput
            .getLogs()
            .forEach(
                logged -> {
                  Level currentLevel =
                      logged.getLevel() == Level.INFO ? Level.FINE : logged.getLevel();
                  LOG.log(currentLevel, logged.getMessage());
                });
        dump = jsonOutput.getResult().getMessage();
      } catch (JsonException e) {
        failedToParse = e;
      }
    }
    if (code != 0) {
      throw new WebDriverException(
          "Command failed with code: " + code + ", executed: " + arguments + "\n" + dump,
          failedToParse);
    } else if (failedToParse != null || jsonOutput == null) {
      throw new WebDriverException(
          "Failed to parse json output, executed: " + arguments + "\n" + dump, failedToParse);
    }
    return jsonOutput.getResult();
  }

  /**
   * Determines the correct Selenium Manager binary to use.
   *
   * @return the path to the Selenium Manager binary.
   */
  private synchronized Path getBinary() {
    if (binary == null) {
      try {
        Platform current = Platform.getCurrent();
        String folder = "";
        String extension = "";
        if (current.is(WINDOWS)) {
          extension = EXE;
          folder = "windows";
        } else if (current.is(MAC)) {
          folder = "macos";
        } else if (current.is(LINUX)) {
          folder = "linux";
        } else if (current.is(UNIX)) {
          LOG.warning(
              String.format(
                  "Selenium Manager binary may not be compatible with %s; verify settings",
                  current));
          folder = "linux";
        } else {
          throw new WebDriverException("Unsupported platform: " + current);
        }

        binary = getBinaryInCache(SELENIUM_MANAGER + extension);
        if (!binary.toFile().exists()) {
          String binaryPathInJar = String.format("%s/%s%s", folder, SELENIUM_MANAGER, extension);
          try (InputStream inputStream = this.getClass().getResourceAsStream(binaryPathInJar)) {
            binary.getParent().toFile().mkdirs();
            Files.copy(inputStream, binary);
          }
        }
      } catch (Exception e) {
        throw new WebDriverException("Unable to obtain Selenium Manager Binary", e);
      }
    } else if (!Files.exists(binary)) {
      throw new WebDriverException(
          String.format("Unable to obtain Selenium Manager Binary at: %s", binary));
    }
    binary.toFile().setExecutable(true);

    LOG.fine(String.format("Selenium Manager binary found at: %s", binary));
    return binary;
  }

  /**
   * Executes Selenium Manager to get the locations of the requested assets
   *
   * @param arguments List of command line arguments to send to Selenium Manager binary
   * @return the locations of the assets from Selenium Manager execution
   */
  public Result getBinaryPaths(List<String> arguments) {
    List<String> args = new ArrayList<>(arguments.size() + 5);
    args.addAll(arguments);
    args.add("--language-binding");
    args.add("java");
    args.add("--output");
    args.add("json");

    if (getLogLevel().intValue() <= Level.FINE.intValue()) {
      args.add("--debug");
    }

    return runCommand(getBinary(), args);
  }

  private Level getLogLevel() {
    Level level = LOG.getLevel();
    if (level == null && LOG.getParent() != null) {
      level = LOG.getParent().getLevel();
    }
    if (level == null) {
      return Level.INFO;
    }
    return level;
  }

  private Path getBinaryInCache(String binaryName) throws IOException {

    // Look for cache path as system property or env
    String cachePath = System.getProperty(CACHE_PATH_ENV, "");
    if (cachePath.isEmpty()) cachePath = System.getenv(CACHE_PATH_ENV);
    if (cachePath == null) cachePath = DEFAULT_CACHE_PATH;

    cachePath = cachePath.replace(HOME, System.getProperty("user.home"));

    // If cache path is not writable, SM will be extracted to a temporal folder
    Path cacheParent = Paths.get(cachePath);
    if (!Files.isWritable(cacheParent)) {
      cacheParent = Files.createTempDirectory(SELENIUM_MANAGER);
      binaryInTemporalFolder = true;
    }

    return Paths.get(
        cacheParent.toString(),
        String.format(BINARY_PATH_FORMAT, seleniumManagerVersion, binaryName));
  }
}
