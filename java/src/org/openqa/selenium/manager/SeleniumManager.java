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

import com.google.common.io.CharStreams;

import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.json.Json;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;
import static org.openqa.selenium.Platform.MAC;
import static org.openqa.selenium.Platform.WINDOWS;

/**
 * This implementation is still in beta, and may change.
 * <p>
 * The Selenium-Manager binaries are distributed in a JAR file (org.openqa.selenium:selenium-manager) for
 * the Java binding language. Since these binaries are compressed within these JAR, we need to serialize
 * the proper binary for the current platform (Windows, macOS, or Linux) as an executable file. To
 * implement this we use a singleton pattern, since this way, we have a single instance in the JVM, and we
 * reuse the resulting binary for all the calls to the Selenium Manager singleton during all the Java
 * process lifetime, deleting the binary (stored as a local temporal file) on runtime shutdown.
 */
@Beta
public class SeleniumManager {

    private static final Logger LOG = Logger.getLogger(SeleniumManager.class.getName());

    private static final String SELENIUM_MANAGER = "selenium-manager";
    private static final String EXE = ".exe";
    private static final String WARN = "WARN";
    private static final String DEBUG = "DEBUG";

    private static SeleniumManager manager;

    private File binary;

    /**
     * Wrapper for the Selenium Manager binary.
     */
    private SeleniumManager() {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            if (binary != null && binary.exists()) {
                try {
                    Files.delete(binary.toPath());
                } catch (IOException e) {
                    LOG.warning(String.format("%s deleting temporal file: %s",
                            e.getClass().getSimpleName(), e.getMessage()));
                }
            }
        }));
    }

    public static SeleniumManager getInstance() {
        if (manager == null) {
            manager = new SeleniumManager();
        }
        return manager;
    }

    /**
     * Executes a process with the given arguments.
     *
     * @param command the file and arguments to execute.
     * @return the standard output of the execution.
     */
    private static String runCommand(String... command) {
        LOG.fine(String.format("Executing Process: %s", Arrays.toString(command)));
        String output = "";
        int code = 0;
        try {
            Process process = new ProcessBuilder(command)
                    .redirectErrorStream(true).start();
            process.waitFor();
            code = process.exitValue();
            output = CharStreams.toString(new InputStreamReader(
              process.getInputStream(), StandardCharsets.UTF_8));
        } catch (InterruptedException e) {
            LOG.warning(String.format("Interrupted exception running command %s: %s",
                                      Arrays.toString(command), e.getMessage()));
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            LOG.warning(String.format("%s running command %s: %s",
                                      e.getClass().getSimpleName(), Arrays.toString(command),
                                      e.getMessage()));
        }
        SeleniumManagerJsonOutput jsonOutput = new Json()
          .toType(output, SeleniumManagerJsonOutput.class);
        if (code > 0) {
            throw new WebDriverException(
              "Unsuccessful command executed: " + Arrays.toString(command) +
              "\n" + jsonOutput.result.message);
        }
        jsonOutput.logs.forEach(logged -> {
            if(logged.level.equalsIgnoreCase(WARN)) {
              LOG.warning(logged.message);
            }
            if(logged.level.equalsIgnoreCase(DEBUG)) {
              LOG.fine(logged.message);
            }
          });
        return jsonOutput.result.message;
    }

    /**
     * Determines the correct Selenium Manager binary to use.
     *
     * @return the path to the Selenium Manager binary.
     */
    private synchronized File getBinary() {
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
              File tmpFolder = tmpPath.toFile();
              tmpFolder.deleteOnExit();
              binary = new File(tmpFolder, SELENIUM_MANAGER + extension);
              Files.copy(inputStream, binary.toPath(), REPLACE_EXISTING);
            }
            binary.setExecutable(true);
          } catch (Exception e) {
            throw new WebDriverException("Unable to obtain Selenium Manager", e);
          }
        }
        return binary;
    }

    /**
     * Returns the browser binary path when present in the vendor options
     *
     * @param options browser options used to start the session
     * @return the browser binary path when present, only Chrome/Firefox/Edge
     */
    private String getBrowserBinary(Capabilities options) {
        List<String> vendorOptionsCapabilities = Arrays.asList("moz:firefoxOptions", "goog:chromeOptions", "ms:edgeOptions");
        for (String vendorOptionsCapability : vendorOptionsCapabilities) {
            if (options.asMap().containsKey(vendorOptionsCapability)) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> vendorOptions = (Map<String, Object>) options.getCapability(vendorOptionsCapability);
                    return (String) vendorOptions.get("binary");
                } catch (Exception e) {
                    LOG.warning(String.format("Exception while retrieving the browser binary path. %s: %s",
                                              options, e.getMessage()));
                }
            }
        }
        return null;
    }

    /**
     * Determines the location of the correct driver.
     * @param options Browser Options instance.
     * @return the location of the driver.
     */
    public String getDriverPath(Capabilities options) {
      LOG.info("Applicable driver not found; attempting to install with Selenium Manager (Beta)");
      File binaryFile = getBinary();
      if (binaryFile == null) {
        return null;
      }
      List<String> commandList = new ArrayList<>();
      commandList.add(binaryFile.getAbsolutePath());
      commandList.add("--browser");
      commandList.add(options.getBrowserName());
      commandList.add("--output");
      commandList.add("json");

      if (!options.getBrowserVersion().isEmpty()) {
        commandList.add("--browser-version");
        commandList.add(options.getBrowserVersion());
      }

      String browserBinary = getBrowserBinary(options);
      if (browserBinary != null && !browserBinary.isEmpty()) {
        commandList.add("--browser-path");
        commandList.add(browserBinary);
      }

      if (getLogLevel().intValue() <= Level.FINE.intValue()) {
        commandList.add("--debug");
      }

      String path = runCommand(commandList.toArray(new String[0]));
      LOG.fine(String.format("Using driver at location: %s", path));
      return path;
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
