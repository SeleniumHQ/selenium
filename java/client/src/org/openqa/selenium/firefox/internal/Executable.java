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


package org.openqa.selenium.firefox.internal;

import com.google.common.collect.ImmutableList;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.os.WindowsUtils;
import org.openqa.selenium.io.CircularOutputStream;

import java.io.File;
import java.io.OutputStream;
import java.util.Map;

import static org.openqa.selenium.Platform.MAC;
import static org.openqa.selenium.Platform.UNIX;
import static org.openqa.selenium.Platform.WINDOWS;

/**
 * Wrapper around our runtime environment requirements. Performs discovery of firefox instances.
 *
 * <p>
 * NOTE: System and platform binaries will only be discovered at class initialization.
 */
public class Executable {
  private static final File SYSTEM_BINARY = locateFirefoxBinaryFromSystemProperty();
  private static final File PLATFORM_BINARY = locateFirefoxBinaryFromPlatform();

  private final File binary;

  public Executable(File userSpecifiedBinaryPath) {
    if (userSpecifiedBinaryPath != null) {

      // It should exist and be a file.
      if (userSpecifiedBinaryPath.exists() && userSpecifiedBinaryPath.isFile()) {
        binary = userSpecifiedBinaryPath;
        return;
      }

      throw new WebDriverException(
          "Specified firefox binary location does not exist or is not a real file: " +
              userSpecifiedBinaryPath);
    }

    if (SYSTEM_BINARY != null && SYSTEM_BINARY.exists()) {
      binary = SYSTEM_BINARY;
      return;
    }

    if (PLATFORM_BINARY != null && PLATFORM_BINARY.exists()) {
      binary = PLATFORM_BINARY;
      return;
    }

    throw new WebDriverException("Cannot find firefox binary in PATH. " +
        "Make sure firefox is installed. OS appears to be: " + Platform.getCurrent());
  }

  public File getFile() {
    return binary;
  }

  public String getPath() {
    return binary.getAbsolutePath();
  }

  public void setLibraryPath(CommandLine command, final Map<String, String> extraEnv) {
    final String propertyName = CommandLine.getLibraryPathPropertyName();
    StringBuilder libraryPath = new StringBuilder();

    // If we have an env var set for the path, use it.
    String env = getEnvVar(propertyName, null);
    if (env != null) {
      libraryPath.append(env).append(File.pathSeparator);
    }

    // Check our extra env vars for the same var, and use it too.
    env = extraEnv.get(propertyName);
    if (env != null) {
      libraryPath.append(env).append(File.pathSeparator);
    }

    // Last, add the contents of the specified system property, defaulting to the binary's path.

    // On Snow Leopard, beware of problems the sqlite library
    String firefoxLibraryPath = System.getProperty(FirefoxDriver.SystemProperty.BROWSER_LIBRARY_PATH,
        binary.getAbsoluteFile().getParentFile().getAbsolutePath());
    if (Platform.getCurrent().is(Platform.MAC) && Platform.getCurrent().getMinorVersion() > 5) {
      libraryPath.append(libraryPath).append(File.pathSeparator);
    } else {
      libraryPath.append(firefoxLibraryPath).append(File.pathSeparator).append(libraryPath);
    }

    // Add the library path to the builder.
    command.setEnvironmentVariable(propertyName, libraryPath.toString());
  }

  /**
   * Locates the firefox binary from a system property. Will throw an exception if the binary cannot
   * be found.
   */
  private static File locateFirefoxBinaryFromSystemProperty() {
    String binaryName = System.getProperty(FirefoxDriver.SystemProperty.BROWSER_BINARY);
    if (binaryName == null)
      return null;

    File binary = new File(binaryName);
    if (binary.exists() && !binary.isDirectory())
      return binary;

    Platform current = Platform.getCurrent();
    if (current.is(WINDOWS)) {
      if (!binaryName.endsWith(".exe"))
        binaryName += ".exe";

    } else if (current.is(MAC)) {
      if (!binaryName.endsWith(".app"))
        binaryName += ".app";
      binaryName += "/Contents/MacOS/firefox-bin";
    }

    binary = new File(binaryName);
    if (binary.exists())
      return binary;

    throw new WebDriverException(
        String.format("'%s' property set, but unable to locate the requested binary: %s",
                      FirefoxDriver.SystemProperty.BROWSER_BINARY, binaryName));
  }

  /**
   * Locates the firefox binary by platform.
   */
  private static File locateFirefoxBinaryFromPlatform() {
    File binary = null;

    Platform current = Platform.getCurrent();
    if (current.is(WINDOWS)) {
      binary =
          findExistingBinary(WindowsUtils.getPathsInProgramFiles("Mozilla Firefox\\firefox.exe"));

    } else if (current.is(MAC)) {
      binary = new File("/Applications/Firefox.app/Contents/MacOS/firefox-bin");
      // fall back to homebrew install location if default is not found
      if (!binary.exists()) {
        binary = new File(System.getProperty("user.home") + binary.getAbsolutePath());
      }
    }

    if (binary != null && binary.exists()) {
      return binary;
    }

    if (current.is(UNIX)) {
      String systemFirefox = CommandLine.find("firefox-bin");
      if (systemFirefox != null) {
        return new File(systemFirefox);
      }
    }

    String systemFirefox = CommandLine.find("firefox");
    if (systemFirefox != null) {
      return new File(systemFirefox);
    }

    return null;
  }

  private static File findExistingBinary(final ImmutableList<String> paths) {
    for (String path : paths) {
      File file = new File(path);
      if (file.exists()) {
        return file;
      }
    }
    return null;
  }

  /**
   * Retrieve an env var; if no var is set, returns the default
   *
   * @param name the name of the variable
   * @param defaultValue the default value of the variable
   * @return the env var
   */
  private static String getEnvVar(String name, String defaultValue) {
    final String value = System.getenv(name);
    if (value != null) {
      return value;
    }
    return defaultValue;
  }

  public OutputStream getDefaultOutputStream() {
    String firefoxLogFile = System.getProperty(FirefoxDriver.SystemProperty.BROWSER_LOGFILE);
    if ("/dev/stdout".equals(firefoxLogFile)) {
      return System.out;
    }
    File logFile = firefoxLogFile == null ? null : new File(firefoxLogFile);
    return new CircularOutputStream(logFile);
  }
}
