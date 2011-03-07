/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.openqa.selenium.Platform;
import org.openqa.selenium.os.ProcessUtils;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.internal.Executable;
import org.openqa.selenium.firefox.internal.Streams;
import org.openqa.selenium.io.FileHandler;

import static java.util.concurrent.TimeUnit.SECONDS;

public class FirefoxBinary {
  private static final String NO_FOCUS_LIBRARY_NAME = "x_ignore_nofocus.so";
  private static final String IME_IBUS_HANDLER_LIBRARY_NAME = "libibushandler.so";

  private final Map<String, String> extraEnv = new HashMap<String, String>();
  private final Executable executable;
  private Process process;
  private long timeout = SECONDS.toMillis(45);
  private OutputStream stream;
  private Thread outputWatcher;

  public FirefoxBinary() {
    this(null);
  }

  public FirefoxBinary(File pathToFirefoxBinary) {
    executable = new Executable(pathToFirefoxBinary);
  }

  protected boolean isOnLinux() {
    return Platform.getCurrent().is(Platform.LINUX);
  }

  public void startProfile(FirefoxProfile profile, File profileDir, String... commandLineFlags) throws IOException {
    String profileAbsPath = profileDir.getAbsolutePath();
    setEnvironmentProperty("XRE_PROFILE_PATH", profileAbsPath);
    setEnvironmentProperty("MOZ_NO_REMOTE", "1");
    setEnvironmentProperty("MOZ_CRASHREPORTER_DISABLE", "1"); // Disable Breakpad
    setEnvironmentProperty("NO_EM_RESTART", "1"); // Prevent the binary from detaching from the console

    if (isOnLinux()
        && (profile.enableNativeEvents() || profile.alwaysLoadNoFocusLib())) {
      modifyLinkLibraryPath(profileDir);
    }

    List<String> commands = new ArrayList<String>();
    commands.add(getExecutable().getPath());
    commands.addAll(Arrays.asList(commandLineFlags));
    ProcessBuilder builder = new ProcessBuilder(commands);
    builder.redirectErrorStream(true);
    builder.environment().putAll(getExtraEnv());
    getExecutable().setLibraryPath(builder, getExtraEnv());

    if (stream == null) {
      stream = getExecutable().getDefaultOutputStream();
    }

    startFirefoxProcess(builder);

    copeWithTheStrangenessOfTheMac(builder);

    startOutputWatcher();
  }

  protected void startFirefoxProcess(ProcessBuilder builder) throws IOException {
    process = builder.start();
  }

  protected void startOutputWatcher() {
    outputWatcher = new Thread(new OutputWatcher(process, stream), "Firefox output watcher");
    outputWatcher.start();
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
    String newLdLibPath = extractAndCheck(profileDir, NO_FOCUS_LIBRARY_NAME, "x86", "amd64");
    newLdLibPath += extractAndCheck(profileDir, IME_IBUS_HANDLER_LIBRARY_NAME, "x86", "amd64");
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
    //   profile.getLibsDir32bit + ":" + profile.getLibsDir64bit

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

  protected void copeWithTheStrangenessOfTheMac(ProcessBuilder builder) throws IOException {
    if (Platform.getCurrent().is(Platform.MAC)) {
      // On the Mac, this process sometimes dies. Check for this, put in a decent sleep
      // and then attempt to restart it. If this doesn't work, then give up

      // TODO(simon): Why is this happening? Firefox 2 never seemed to suffer this
      try {
        sleep(300);
        if (process.exitValue() == 0) {
          return;
        }

        // Looks like it's gone wrong.
        // TODO(simon): This is utterly bogus. We should do something far smarter
        sleep(10000);

        startFirefoxProcess(builder);
      } catch (IllegalThreadStateException e) {
        // Excellent, we've not creashed.
      }

      // Ensure we're okay
      try {
        sleep(300);

        process.exitValue();
        if (process.exitValue() == 0) {
          return;
        }

        StringBuilder message = new StringBuilder("Unable to start firefox cleanly.\n");
        message.append(getConsoleOutput()).append("\n");
        message.append("Exit value: ").append(process.exitValue()).append("\n");
        message.append("Ran from: ").append(builder.command()).append("\n");
        throw new WebDriverException(message.toString());
      } catch (IllegalThreadStateException e) {
        // Woot!
      }
    }
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
    ProcessBuilder builder =
        new ProcessBuilder(executable.getPath(), "--verbose", "-CreateProfile", profileName)
            .redirectErrorStream(true);
    builder.environment().put("MOZ_NO_REMOTE", "1");
    if (stream == null) {
      stream = executable.getDefaultOutputStream();
    }

    startFirefoxProcess(builder);

    outputWatcher = new Thread(new OutputWatcher(process, stream));
    outputWatcher.start();
  }

  /**
   * Waits for the process to execute, returning the command output taken from the profile's execution.
   *
   * @throws InterruptedException if we are interrupted while waiting for the process to launch
   * @throws IOException          if there is a problem with reading the input stream of the launching process
   */
  public void waitFor() throws InterruptedException, IOException {
    process.waitFor();
  }

  /**
   * Gets all console output of the binary.
   * Output retrieval is non-destructive and non-blocking.
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

    if (Platform.getCurrent().is(Platform.WINDOWS)) {
      while (profile.isRunning(profileDir)) {
        sleep(500);
      }

      do {
        sleep(500);
      } while (profile.isRunning(profileDir));
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
    ProcessUtils.killProcess(process);
  }

  private static class OutputWatcher implements Runnable {
    private final Process process;
    private OutputStream stream;
    private final int BUFSIZE = 4096;

    public OutputWatcher(Process process, OutputStream stream) {
      this.process = process;
      this.stream = stream;
    }

    public void run() {
      InputStream stdoutOfWatchedProcess = null;
      try {
        stdoutOfWatchedProcess = process.getInputStream();
        byte[] buffer = new byte[BUFSIZE];
        int n;
        do {
          int avail = Math.min(BUFSIZE, stdoutOfWatchedProcess.available());
          avail = Math.max(avail, 1); // Always ask for at least one byte
          n = stdoutOfWatchedProcess.read(buffer, 0, avail);
          if (n > 0 && stream != null) {
            try {
              stream.write(buffer, 0, n);
            } catch (IOException e) {
              System.err.print("ERROR: Could not write to " + stream + ": ");
              e.printStackTrace(System.err);
              // We must continue to read from stdoutOfWatchedProcess
              // (otherwise the process might block), therefore we can
              // not break out of the loop here, instead we set stream
              // to null, so that no further write attempts are made ...
              stream = null;
            }
          }
        } while (n != -1);
      } catch (IOException e) {
        if ("Stream closed".equals(e.getMessage())) {
          // We can and should ignore this IOException, see http://code.google.com/p/selenium/issues/detail?id=1159
        } else {
          System.err.print("ERROR: Could not read from stdout of " + process + ": ");
          e.printStackTrace(System.err);
        }
      } finally {
        if (stdoutOfWatchedProcess != null) {
          try {
            stdoutOfWatchedProcess.close();
          } catch (IOException ignored) {}
        }
      }
    }
  }
}
