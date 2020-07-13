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

package org.openqa.selenium.firefox;

import static java.util.Arrays.stream;
import static java.util.stream.Collectors.toList;
import static org.openqa.selenium.Platform.MAC;
import static org.openqa.selenium.Platform.UNIX;
import static org.openqa.selenium.Platform.WINDOWS;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.os.ExecutableFinder;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class FirefoxBinary {

  /**
   * Enumerates Firefox channels, according to https://wiki.mozilla.org/RapidRelease
   */
  public enum Channel {
    ESR("esr"),
    RELEASE("release"),
    BETA("beta"),
    AURORA("aurora"),
    NIGHTLY("nightly");

    private String name;

    Channel(String name) {
      this.name = name;
    }

    public String toString() {
      return name;
    }

    /**
     * Gets a channel with the name matching the parameter.
     *
     * @param name the channel name
     * @return the Channel enum value matching the parameter
     */
    public static Channel fromString(String name) {
      final String lcName = name.toLowerCase();
      return stream(Channel.values())
          .filter(ch -> ch.name.equals(lcName))
          .findFirst().orElseThrow(() -> new WebDriverException("Unrecognized channel: " + name));
    }
  }

  private final List<String> extraOptions = new ArrayList<>();
  private final Executable executable;

  public FirefoxBinary() {
    Executable systemBinary = locateFirefoxBinaryFromSystemProperty();
    if (systemBinary != null) {
      executable = systemBinary;
      return;
    }

    Executable platformBinary = locateFirefoxBinariesFromPlatform().findFirst().orElse(null);
    if (platformBinary != null) {
      executable = platformBinary;
      return;
    }

    throw new WebDriverException("Cannot find firefox binary in PATH. " +
                                 "Make sure firefox is installed. OS appears to be: " + Platform.getCurrent());
  }

  public FirefoxBinary(Channel channel) {
    Executable systemBinary = locateFirefoxBinaryFromSystemProperty();
    if (systemBinary != null) {
      if (systemBinary.getChannel() == channel) {
        executable = systemBinary;
        return;
      } else {
        throw new WebDriverException(
          "Firefox executable specified by system property " + FirefoxDriver.SystemProperty.BROWSER_BINARY +
          " does not belong to channel '" + channel + "', it appears to be '" + systemBinary.getChannel() + "'");
      }
    }

    executable = locateFirefoxBinariesFromPlatform()
        .filter(e -> e.getChannel() == channel)
        .findFirst().orElseThrow(() -> new WebDriverException(
            String.format("Cannot find firefox binary for channel '%s' in PATH", channel)));
  }

  public FirefoxBinary(File pathToFirefoxBinary) {
    executable = new Executable(pathToFirefoxBinary);
  }

  public void addCommandLineOptions(String... options) {
    Collections.addAll(extraOptions, options);
  }

  void amendOptions(FirefoxOptions options) {
    options.addArguments(extraOptions);
  }

  public File getFile() {
    return executable.getFile();
  }

  public String getPath() {
    return executable.getPath();
  }

  public List<String> getExtraOptions() {
    return extraOptions;
  }

  @Override
  public String toString() {
    return "FirefoxBinary(" + executable.getPath() + ")";
  }

  public String toJson() {
    return executable.getPath();
  }

  /**
   * Locates the firefox binary from a system property. Will throw an exception if the binary cannot
   * be found.
   */
   static Executable locateFirefoxBinaryFromSystemProperty() {
    String binaryName = System.getProperty(FirefoxDriver.SystemProperty.BROWSER_BINARY);
    if (binaryName == null)
      return null;

    File binary = new File(binaryName);
    if (binary.exists() && !binary.isDirectory())
      return new Executable(binary);

    Platform current = Platform.getCurrent();
    if (current.is(WINDOWS)) {
      if (!binaryName.endsWith(".exe")) {
        binaryName += ".exe";
      }

    } else if (current.is(MAC)) {
      if (!binaryName.endsWith(".app")) {
        binaryName += ".app";
      }
      binaryName += "/Contents/MacOS/firefox-bin";
    }

    binary = new File(binaryName);
    if (binary.exists())
      return new Executable(binary);

    throw new WebDriverException(
      String.format("'%s' property set, but unable to locate the requested binary: %s",
                    FirefoxDriver.SystemProperty.BROWSER_BINARY, binaryName));
  }

  /**
   * Locates the firefox binary by platform.
   */
  private static Stream<Executable> locateFirefoxBinariesFromPlatform() {
    List<Executable> executables = new ArrayList<>();

    Platform current = Platform.getCurrent();
    if (current.is(WINDOWS)) {
      executables.addAll(Stream.of("Mozilla Firefox\\firefox.exe",
                                   "Firefox Developer Edition\\firefox.exe",
                                   "Nightly\\firefox.exe")
          .map(FirefoxBinary::getPathsInProgramFiles)
          .flatMap(List::stream)
          .map(File::new).filter(File::exists)
          .map(Executable::new).collect(toList()));

    } else if (current.is(MAC)) {
      // system
      File binary = new File("/Applications/Firefox.app/Contents/MacOS/firefox-bin");
      if (binary.exists()) {
        executables.add(new Executable(binary));
      }

      // user home
      binary = new File(System.getProperty("user.home") + binary.getAbsolutePath());
      if (binary.exists()) {
        executables.add(new Executable(binary));
      }

    } else if (current.is(UNIX)) {
      String systemFirefoxBin = new ExecutableFinder().find("firefox-bin");
      if (systemFirefoxBin != null) {
        executables.add(new Executable(new File(systemFirefoxBin)));
      }
    }

    String systemFirefox = new ExecutableFinder().find("firefox");
    if (systemFirefox != null) {
      Path firefoxPath = new File(systemFirefox).toPath();
      if (Files.isSymbolicLink(firefoxPath)) {
        try {
          Path realPath = firefoxPath.toRealPath();
          File attempt1 = realPath.getParent().resolve("firefox").toFile();
          if (attempt1.exists()) {
            executables.add(new Executable(attempt1));
          } else {
            File attempt2 = realPath.getParent().resolve("firefox-bin").toFile();
            if (attempt2.exists()) {
              executables.add(new Executable(attempt2));
            }
          }
        } catch (IOException e) {
          // ignore this path
        }

      } else {
        executables.add(new Executable(new File(systemFirefox)));
      }
    }

    return executables.stream();
  }

  private static List<String> getPathsInProgramFiles(final String childPath) {
    return Stream.of(getProgramFilesPath(), getProgramFiles86Path())
        .map(parent -> new File(parent, childPath).getAbsolutePath())
        .collect(Collectors.toList());
  }

  /**
   * Returns the path to the Windows Program Files. On non-English versions, this is not necessarily
   * "C:\Program Files".
   *
   * @return the path to the Windows Program Files
   */
  private static String getProgramFilesPath() {
    return getEnvVarPath("ProgramFiles", "C:\\Program Files").replace(" (x86)", "");
  }

  private static String getProgramFiles86Path() {
    return getEnvVarPath("ProgramFiles(x86)", "C:\\Program Files (x86)");
  }

  private static String getEnvVarPath(final String envVar, final String defaultValue) {
    return getEnvVarIgnoreCase(envVar)
        .map(File::new).filter(File::exists).map(File::getAbsolutePath)
        .orElseGet(() -> new File(defaultValue).getAbsolutePath());
  }

  private static Optional<String> getEnvVarIgnoreCase(String var) {
    return System.getenv().entrySet().stream()
        .filter(e -> e.getKey().equalsIgnoreCase(var))
        .findFirst().map(Map.Entry::getValue);
  }
}
