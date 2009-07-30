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

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.firefox.internal.Executable;
import org.openqa.selenium.firefox.internal.Streams;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import static java.util.concurrent.TimeUnit.SECONDS;

public class FirefoxBinary {
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

    private boolean isOnLinux() {
      return (System.getProperty("os.name").toLowerCase().indexOf("linux") > -1);
    }
    
    public void startProfile(FirefoxProfile profile, String... commandLineFlags) throws IOException {
        String profileAbsPath = profile.getProfileDir().getAbsolutePath();
        setEnvironmentProperty("XRE_PROFILE_PATH", profileAbsPath);
        setEnvironmentProperty("MOZ_NO_REMOTE", "1");
        
        if (isOnLinux()) {
          String preloadLib = extractAndCheck(
              profile, "x86/x_ignore_nofocus.so", "amd64/x_ignore_nofocus64.so");
          setEnvironmentProperty("LD_PRELOAD", preloadLib);
        }

        List<String> commands = new ArrayList<String>();
        commands.add(executable.getPath());
        commands.add("--verbose");
        commands.addAll(Arrays.asList(commandLineFlags));
        ProcessBuilder builder = new ProcessBuilder(commands);
        builder.redirectErrorStream(true);
        builder.environment().putAll(extraEnv);
        executable.setLibraryPath(builder, extraEnv);

        if (stream == null) {
          stream = executable.getDefaultOutputStream();
        }

        process = builder.start();

        copeWithTheStrangenessOfTheMac(builder);

        outputWatcher = new Thread(new OutputWatcher(process, stream), "Firefox output watcher");
        outputWatcher.start();
    }

  private String extractAndCheck(FirefoxProfile profile, String... paths) {
    StringBuilder builtPath = new StringBuilder();

    for (String path : paths) {
      try {
        FileHandler.copyResource(profile.getProfileDir(), getClass(), path);

        File file = new File(profile.getProfileDir(), path);
        if (!file.exists()) {
          throw new WebDriverException("Could not locate " + path + ": "
                                       + "native events will not work.");
        }

        builtPath.append(path).append(":");
      } catch (IOException e) {
        if (Boolean.getBoolean("webdriver.development")) {
          System.err.println(
              "Exception unpacking required library, but in development mode. Continuing");
//
//          // TODO(eranm): A crude hack to get some tests running. Do it
//          // in a more portable way.
//          String cwd = System.getProperty("user.dir");
//          builtPath.append(cwd).append("/build");
        } else {
          throw new WebDriverException(e);
        }
      }
    }

    return builtPath.toString();
  }

  private void copeWithTheStrangenessOfTheMac(ProcessBuilder builder) throws IOException {
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

        process = builder.start();
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
        if (propertyName == null || value == null)
            throw new WebDriverException(
                    String.format("You must set both the property name and value: %s, %s", propertyName, value));
        extraEnv.put(propertyName, value);
    }

    public void createProfile(String profileName) throws IOException {
        ProcessBuilder builder = new ProcessBuilder(executable.getPath(), "--verbose", "-CreateProfile", profileName)
            .redirectErrorStream(true);
        builder.environment().put("MOZ_NO_REMOTE", "1");
       if (stream == null) {
          stream = executable.getDefaultOutputStream();
        }

        process = builder.start();

        outputWatcher = new Thread(new OutputWatcher(process, stream));
        outputWatcher.start();
    }

    /**
     * Waits for the process to execute, returning the command output taken from the profile's execution.
     * 
     * @throws InterruptedException if we are interrupted while waiting for the process to launch
     * @throws IOException if there is a problem with reading the input stream of the launching process
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

  public void clean(FirefoxProfile profile) throws IOException {
    startProfile(profile, "-silent");
    try {
      waitFor();
    } catch (InterruptedException e) {
      throw new WebDriverException(e);
    }

    if (Platform.getCurrent().is(Platform.WINDOWS)) {
      while (profile.isRunning()) {
        sleep(500);
      }

      do {
        sleep(500);
      } while (profile.isRunning());
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

  private static class OutputWatcher implements Runnable {
    private Process process;
    private OutputStream stream;

    public OutputWatcher(Process process, OutputStream stream) {
      this.process = process;
      this.stream = stream;
    }

    public void run() {
      int in = 0;
      while (in != -1) {
        try {
          in = process.getInputStream().read();
          stream.write(in);
        } catch (IOException e) {
          System.err.println(e);
        }
      }
    }
  }
}
