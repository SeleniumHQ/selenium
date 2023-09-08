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

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;
import static org.openqa.selenium.Platform.MAC;
import static org.openqa.selenium.Platform.WINDOWS;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.manager.SeleniumManagerOutput.Result;
import org.openqa.selenium.os.CommandLine;

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
  private static final String EXE = ".exe";

  private static volatile SeleniumManager manager;

  private Path binary;

  /** Wrapper for the Selenium Manager binary. */
  private SeleniumManager() {
    Runtime.getRuntime()
        .addShutdownHook(
            new Thread(
                () -> {
                  if (binary != null && Files.exists(binary)) {
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
      CommandLine command =
          new CommandLine(binary.toAbsolutePath().toString(), arguments.toArray(new String[0]));
      command.executeAsync();
      command.waitFor();
      if (command.isRunning()) {
        LOG.warning("Selenium Manager did not exit");
      }
      code = command.getExitCode();
      output = command.getStdOut();
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
        String folder = "linux";
        String extension = "";
        if (current.is(WINDOWS)) {
          extension = EXE;
          folder = "windows";
        } else if (current.is(MAC)) {
          folder = "macos";
        }
        String binaryPath = String.format("%s/%s%s", folder, SELENIUM_MANAGER, extension);
        try (InputStream inputStream = this.getClass().getResourceAsStream(binaryPath)) {
          Path tmpPath = Files.createTempDirectory(SELENIUM_MANAGER + System.nanoTime());

          deleteOnExit(tmpPath);

          binary = tmpPath.resolve(SELENIUM_MANAGER + extension);
          Files.copy(inputStream, binary, REPLACE_EXISTING);
        }
        binary.toFile().setExecutable(true);
      } catch (Exception e) {
        throw new WebDriverException("Unable to obtain Selenium Manager Binary", e);
      }
    }
    LOG.fine(String.format("Selenium Manager binary found at: %s", binary));

    return binary;
  }

  private void deleteOnExit(Path tmpPath) {
    Runtime.getRuntime()
        .addShutdownHook(
            new Thread(
                () -> {
                  try {
                    Files.walkFileTree(
                        tmpPath,
                        new SimpleFileVisitor<Path>() {
                          @Override
                          public FileVisitResult postVisitDirectory(Path dir, IOException exc)
                              throws IOException {
                            Files.delete(dir);
                            return FileVisitResult.CONTINUE;
                          }

                          @Override
                          public FileVisitResult visitFile(Path file, BasicFileAttributes attrs)
                              throws IOException {
                            Files.delete(file);
                            return FileVisitResult.CONTINUE;
                          }
                        });
                  } catch (IOException e) {
                    // Do nothing. We're just tidying up.
                  }
                }));
  }

  /**
   * Returns the browser binary path when present in the vendor options
   *
   * @param options browser options used to start the session
   * @return the browser binary path when present, only Chrome/Firefox/Edge
   */
  private String getBrowserBinary(Capabilities options) {
    List<String> vendorOptionsCapabilities =
        Arrays.asList("moz:firefoxOptions", "goog:chromeOptions", "ms:edgeOptions");
    for (String vendorOptionsCapability : vendorOptionsCapabilities) {
      if (options.asMap().containsKey(vendorOptionsCapability)) {
        try {
          @SuppressWarnings("unchecked")
          Map<String, Object> vendorOptions =
              (Map<String, Object>) options.getCapability(vendorOptionsCapability);
          return (String) vendorOptions.get("binary");
        } catch (Exception e) {
          LOG.warning(
              String.format(
                  "Exception while retrieving the browser binary path. %s: %s",
                  options, e.getMessage()));
        }
      }
    }
    return null;
  }

  /**
   * Determines the location of the correct driver.
   *
   * @param options Browser Options instance.
   * @return the location of the driver.
   */
  public Result getDriverPath(Capabilities options, boolean offline) {
    Path binaryFile = getBinary();
    if (binaryFile == null) {
      return null;
    }

    List<String> arguments = new ArrayList<>();
    arguments.add("--browser");
    arguments.add(options.getBrowserName());
    arguments.add("--output");
    arguments.add("json");

    if (!options.getBrowserVersion().isEmpty()) {
      arguments.add("--browser-version");
      arguments.add(options.getBrowserVersion());
      // We know the browser binary path, we don't need the browserVersion.
      // Useful when "beta" is specified as browserVersion, but the browser driver cannot match it.
      if (options instanceof MutableCapabilities) {
        ((MutableCapabilities) options).setCapability("browserVersion", (String) null);
      }
    }

    String browserBinary = getBrowserBinary(options);
    if (browserBinary != null && !browserBinary.isEmpty()) {
      arguments.add("--browser-path");
      arguments.add(browserBinary);
    }

    if (getLogLevel().intValue() <= Level.FINE.intValue()) {
      arguments.add("--debug");
    }

    if (offline) {
      arguments.add("--offline");
    }

    Proxy proxy = Proxy.extractFrom(options);
    if (proxy != null) {
      if (proxy.getSslProxy() != null) {
        arguments.add("--proxy");
        arguments.add(proxy.getSslProxy());
      } else if (proxy.getHttpProxy() != null) {
        arguments.add("--proxy");
        arguments.add(proxy.getHttpProxy());
      }
    }

    Result result = runCommand(binaryFile, arguments);
    LOG.fine(
        String.format(
            "Using driver at location: %s, browser at location %s",
            result.getDriverPath(), result.getBrowserPath()));
    return result;
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
}
