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
import static java.util.concurrent.TimeUnit.SECONDS;
import static java.util.stream.Collectors.toList;
import static org.openqa.selenium.Platform.MAC;
import static org.openqa.selenium.Platform.UNIX;
import static org.openqa.selenium.Platform.WINDOWS;
import static org.openqa.selenium.os.WindowsUtils.getPathsInProgramFiles;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.internal.Executable;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.os.ExecutableFinder;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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

  private static final String NO_FOCUS_LIBRARY_NAME = "x_ignore_nofocus.so";
  private static final String PATH_PREFIX = "/" +
      FirefoxBinary.class.getPackage().getName().replace(".", "/") + "/";

  private final Map<String, String> extraEnv = Maps.newHashMap();
  private final List<String> extraOptions = Lists.newArrayList();
  private final Executable executable;
  private CommandLine process;
  private OutputStream stream;
  private long timeout = SECONDS.toMillis(45);

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

  public void setEnvironmentProperty(String propertyName, String value) {
    if (propertyName == null || value == null) {
      throw new WebDriverException(
          String.format("You must set both the property name and value: %s, %s", propertyName,
              value));
    }
    extraEnv.put(propertyName, value);
  }

  public void addCommandLineOptions(String... options) {
    extraOptions.addAll(Lists.newArrayList(options));
  }

  void amendOptions(FirefoxOptions options) {
    options.addArguments(extraOptions);
  }

  protected boolean isOnLinux() {
    return Platform.getCurrent().is(Platform.LINUX);
  }

  public void startProfile(FirefoxProfile profile, File profileDir, String... commandLineFlags)
      throws IOException {
    String profileAbsPath = profileDir.getAbsolutePath();
    setEnvironmentProperty("XRE_PROFILE_PATH", profileAbsPath);
    setEnvironmentProperty("MOZ_NO_REMOTE", "1");
    setEnvironmentProperty("MOZ_CRASHREPORTER_DISABLE", "1"); // Disable Breakpad
    setEnvironmentProperty("NO_EM_RESTART", "1"); // Prevent the binary from detaching from the
                                                  // console
    if (isOnLinux() && profile.shouldLoadNoFocusLib()) {
      modifyLinkLibraryPath(profileDir);
    }

    List<String> cmdArray = Lists.newArrayList();
    cmdArray.addAll(extraOptions);
    cmdArray.addAll(Lists.newArrayList(commandLineFlags));
    CommandLine command = new CommandLine(getPath(), Iterables.toArray(cmdArray, String.class));
    command.setEnvironmentVariables(getExtraEnv());
    command.updateDynamicLibraryPath(getExtraEnv().get(CommandLine.getLibraryPathPropertyName()));
    // On Snow Leopard, beware of problems the sqlite library
    if (! (Platform.getCurrent().is(Platform.MAC) && Platform.getCurrent().getMinorVersion() > 5)) {
      String firefoxLibraryPath = System.getProperty(
        FirefoxDriver.SystemProperty.BROWSER_LIBRARY_PATH,
        getFile().getAbsoluteFile().getParentFile().getAbsolutePath());
      command.updateDynamicLibraryPath(firefoxLibraryPath);
    }

    if (stream == null) {
      stream = getDefaultOutputStream();
    }
    command.copyOutputTo(stream);

    startFirefoxProcess(command);
  }

  protected void startFirefoxProcess(CommandLine command) throws IOException {
    process = command;
    command.executeAsync();
  }

  protected File getFile() {
    return executable.getFile();
  }

  protected String getPath() {
    return executable.getPath();
  }

  public Map<String, String> getExtraEnv() {
    return Collections.unmodifiableMap(extraEnv);
  }

  protected void modifyLinkLibraryPath(File profileDir) {
    // Extract x_ignore_nofocus.so from x86, amd64 directories inside
    // the jar into a real place in the filesystem and change LD_LIBRARY_PATH
    // to reflect that.

    String existingLdLibPath = System.getenv("LD_LIBRARY_PATH");
    // The returned new ld lib path is terminated with ':'
    String newLdLibPath =
        extractAndCheck(profileDir, NO_FOCUS_LIBRARY_NAME, PATH_PREFIX + "x86", PATH_PREFIX +
            "amd64");
    if (existingLdLibPath != null && !existingLdLibPath.equals("")) {
      newLdLibPath += existingLdLibPath;
    }

    setEnvironmentProperty("LD_LIBRARY_PATH", newLdLibPath);
    // Set LD_PRELOAD to x_ignore_nofocus.so - this will be taken automagically
    // from the LD_LIBRARY_PATH
    setEnvironmentProperty("LD_PRELOAD", NO_FOCUS_LIBRARY_NAME);
  }

  protected String extractAndCheck(File profileDir, String noFocusSoName,
      String jarPath32Bit, String jarPath64Bit) {

    // 1. Extract x86/x_ignore_nofocus.so to profile.getLibsDir32bit
    // 2. Extract amd64/x_ignore_nofocus.so to profile.getLibsDir64bit
    // 3. Create a new LD_LIB_PATH string to contain:
    // profile.getLibsDir32bit + ":" + profile.getLibsDir64bit

    Set<String> pathsSet = new HashSet<>();
    pathsSet.add(jarPath32Bit);
    pathsSet.add(jarPath64Bit);

    StringBuilder builtPath = new StringBuilder();

    for (String path : pathsSet) {
      try {

        FileHandler.copyResource(profileDir, getClass(), path + File.separator + noFocusSoName);

      } catch (IOException e) {
        if (Boolean.getBoolean("webdriver.development")) {
          System.err.println(
              "Exception unpacking required library, but in development mode. Continuing");
        } else {
          throw new WebDriverException(e);
        }
      } // End catch.

      String outSoPath = profileDir.getAbsolutePath() + File.separator + path;

      File file = new File(outSoPath, noFocusSoName);
      if (!file.exists()) {
        throw new WebDriverException("Could not locate " + path + ": "
            + "native events will not work.");
      }

      builtPath.append(outSoPath).append(":");
    }

    return builtPath.toString();
  }

  /**
   * Waits for the process to execute, returning the command output taken from the profile's
   * execution.
   *
   * @throws InterruptedException if we are interrupted while waiting for the process to launch
   * @throws IOException if there is a problem with reading the input stream of the launching
   *         process
   */
  public void waitFor() throws InterruptedException, IOException {
    process.waitFor();
  }

  /**
   * Waits for the process to execute, returning the command output taken from the profile's
   * execution.
   *
   * @param timeout the maximum time to wait in milliseconds
   * @throws InterruptedException if we are interrupted while waiting for the process to launch
   * @throws IOException if there is a problem with reading the input stream of the launching
   *         process
   */

  public void waitFor(long timeout) throws InterruptedException, IOException {
	  process.waitFor(timeout);
  }

  /**
   * Gets all console output of the binary. Output retrieval is non-destructive and non-blocking.
   *
   * @return the console output of the executed binary.
   * @throws IOException IO exception reading from the output stream of the firefox process
   */
  public String getConsoleOutput() throws IOException {
    if (process == null) {
      return null;
    }
    return process.getStdOut();
  }

  public long getTimeout() {
    return timeout;
  }

  public void setTimeout(long timeout) {
    this.timeout = timeout;
  }

  @Override
  public String toString() {
    return "FirefoxBinary(" + executable.getPath() + ")";
  }

  public void setOutputWatcher(OutputStream stream) {
    this.stream = stream;
  }

  public void quit() {
    if (process != null) {
      process.destroy();
    }
  }

  private OutputStream getDefaultOutputStream() throws FileNotFoundException {
    String firefoxLogFile = System.getProperty(FirefoxDriver.SystemProperty.BROWSER_LOGFILE);
    if (firefoxLogFile != null) {
      if ("/dev/stdout".equals(firefoxLogFile)) {
        return System.out;
      }
      return new FileOutputStream(firefoxLogFile);
    }
    return null;
  }

  /**
   * Locates the firefox binary from a system property. Will throw an exception if the binary cannot
   * be found.
   */
  private static Executable locateFirefoxBinaryFromSystemProperty() {
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
    ImmutableList.Builder<Executable> executables = new ImmutableList.Builder<>();

    Platform current = Platform.getCurrent();
    if (current.is(WINDOWS)) {
      executables.addAll(Stream.of(getPathsInProgramFiles("Mozilla Firefox\\firefox.exe"),
                                   getPathsInProgramFiles("Firefox Developer Edition\\firefox.exe"),
                                   getPathsInProgramFiles("Nightly\\firefox.exe"))
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

    return executables.build().stream();
  }

}
