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

import java.io.File;

import static org.openqa.selenium.Platform.MAC;
import static org.openqa.selenium.Platform.UNIX;
import static org.openqa.selenium.Platform.WINDOWS;

/**
 * Wrapper around our runtime environment requirements. Performs discovery of firefox instances.
 */
public class Executable {

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

    File systemBinary = locateFirefoxBinaryFromSystemProperty();
    if (systemBinary != null) {
      binary = systemBinary;
      return;
    }

    File platformBinary = locateFirefoxBinaryFromPlatform();
    if (platformBinary != null) {
      binary = platformBinary;
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
      ImmutableList.Builder<String> paths = new ImmutableList.Builder<>();
      paths.addAll(WindowsUtils.getPathsInProgramFiles("Mozilla Firefox\\firefox.exe"));
      paths.addAll(WindowsUtils.getPathsInProgramFiles("Firefox Developer Edition\\firefox.exe"));
      paths.addAll(WindowsUtils.getPathsInProgramFiles("Nightly\\firefox.exe"));
      binary = findExistingBinaries(paths.build()).stream().findFirst().orElse(null);

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

  private static ImmutableList<File> findExistingBinaries(final ImmutableList<String> paths) {
    ImmutableList.Builder<File> found = new ImmutableList.Builder<>();
    for (String path : paths) {
      File file = new File(path);
      if (file.exists()) {
        found.add(file);
      }
    }
    return found.build();
  }
}
