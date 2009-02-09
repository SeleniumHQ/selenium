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
import org.openqa.selenium.firefox.internal.Executable;
import org.openqa.selenium.firefox.internal.Streams;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FirefoxBinary {
    private final StringBuffer stdOutBuffer = new StringBuffer();
    private final Map<String, String> extraEnv = new HashMap<String, String>();
    private final Executable executable;
    private Process process;

    public FirefoxBinary() {
        this(null);
    }

    public FirefoxBinary(File pathToFirefoxBinary) {
      executable = new Executable(pathToFirefoxBinary);
    }

    public void startProfile(FirefoxProfile profile, String... commandLineFlags) throws IOException {
        setEnvironmentProperty("XRE_PROFILE_PATH", profile.getProfileDir().getAbsolutePath());
        setEnvironmentProperty("MOZ_NO_REMOTE", "1");

        List<String> commands = new ArrayList<String>();
        commands.add(executable.getPath());
        commands.add("--verbose");
        commands.addAll(Arrays.asList(commandLineFlags));
        ProcessBuilder builder = new ProcessBuilder(commands);
        builder.redirectErrorStream();
        builder.environment().putAll(extraEnv);
        executable.setLibraryPath(builder, extraEnv);
        process = builder.start();
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
        process = builder.start();
    }

    /**
     * Waits for the process to execute, returning the command output taken from the profile's execution.
     * 
     * @throws InterruptedException if we are interrupted while waiting for the process to launch
     * @throws IOException if there is a problem with reading the input stream of the launching process
     */
    public void waitFor() throws InterruptedException, IOException {
      process.waitFor();
  
      // The Mac version (and perhaps others) spawns a new process when the profile needs fixing up
      // This child process shares the same stdout, stdin and stderr as the parent one. By reading
      // the line of input until EOF is reached, we know that we're good and that the child subprocess
      // has also quit.
      BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
      try {
        String line;
        while((line = reader.readLine()) != null) {
          stdOutBuffer.append(line).append("\n");
          sleep(100);
        }
      } finally {
         // Don't close the stream.
      }        
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
      
      stdOutBuffer.append(new String(Streams.drainStream(process.getInputStream())));
      return stdOutBuffer.toString();
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
  
  @Override
  public String toString() {
    return "FirefoxBinary(" + executable.getPath() + ")";
  }
}
