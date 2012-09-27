/*
Copyright 2007-2009 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.firefox;

import static java.util.concurrent.TimeUnit.SECONDS;

import com.google.common.collect.Maps;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.internal.Executable;
import org.openqa.selenium.firefox.internal.Streams;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.os.CommandLine;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class FirefoxBinary {
  private static final String NO_FOCUS_LIBRARY_NAME = "x_ignore_nofocus.so";
  private static final String IME_IBUS_HANDLER_LIBRARY_NAME = "libibushandler.so";
  private static final String PATH_PREFIX = "/" +
      FirefoxBinary.class.getPackage().getName().replace(".", "/") + "/";

  private final Map<String, String> extraEnv = Maps.newHashMap();
  private final Executable executable;
  private CommandLine process;
  private OutputStream stream;
  private long timeout = SECONDS.toMillis(45);

  public FirefoxBinary() {
    this(null);
  }

  public FirefoxBinary(File pathToFirefoxBinary) {
    executable = new Executable(pathToFirefoxBinary);
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

    if (isOnLinux()
        && (profile.areNativeEventsEnabled() || profile.shouldLoadNoFocusLib())) {
      modifyLinkLibraryPath(profileDir);
    }

    CommandLine command = new CommandLine(
        getExecutable().getPath(), commandLineFlags);
    command.setEnvironmentVariables(getExtraEnv());
    executable.setLibraryPath(command, getExtraEnv());

    if (stream == null) {
      stream = getExecutable().getDefaultOutputStream();
    }
    command.copyOutputTo(stream);

    startFirefoxProcess(command);
  }

  protected void startFirefoxProcess(CommandLine command) throws IOException {
    process = command;
    command.executeAsync();
  }

  protected Executable getExecutable() {
    return executable;
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
    newLdLibPath +=
        extractAndCheck(profileDir, IME_IBUS_HANDLER_LIBRARY_NAME, PATH_PREFIX + "x86",
            PATH_PREFIX + "amd64");
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

    Set<String> pathsSet = new HashSet<String>();
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

  public void setEnvironmentProperty(String propertyName, String value) {
    if (propertyName == null || value == null) {
      throw new WebDriverException(
          String.format("You must set both the property name and value: %s, %s", propertyName,
              value));
    }
    extraEnv.put(propertyName, value);
  }

  public void createProfile(String profileName) throws IOException {
    CommandLine command = new CommandLine(
        executable.getPath(), "--verbose", "-CreateProfile", profileName);
    command.setEnvironmentVariable("MOZ_NO_REMOTE", "1");

    if (stream == null) {
      stream = executable.getDefaultOutputStream();
    }
    command.copyOutputTo(stream);

    command.execute();
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
   * Gets all console output of the binary. Output retrieval is non-destructive and non-blocking.
   * 
   * @return the console output of the executed binary.
   * @throws IOException
   */
  public String getConsoleOutput() throws IOException {
    if (process == null) {
      return null;
    }

    return Streams.drainStream(stream);
  }

  private void sleep(long timeInMillis) {
    try {
      Thread.sleep(timeInMillis);
    } catch (InterruptedException e) {
      throw new WebDriverException(e);
    }
  }

  public void clean(FirefoxProfile profile, File profileDir) throws IOException {
    startProfile(profile, profileDir, "-silent");
    try {
      waitFor();
    } catch (InterruptedException e) {
      throw new WebDriverException(e);
    }
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
}
