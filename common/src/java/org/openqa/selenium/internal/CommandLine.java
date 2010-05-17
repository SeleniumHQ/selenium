/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

package org.openqa.selenium.internal;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import org.openqa.selenium.WebDriverException;

public class CommandLine {
  private final String[] commandAndArgs;
  private StreamDrainer drainer;
  private int exitCode;
  private boolean executed;

  public CommandLine(String executable, String... args) {
    commandAndArgs = new String[args.length + 1];
    commandAndArgs[0] = executable;
    int index = 1;
    for (String arg : args) {
      commandAndArgs[index++] = arg;
    }
  }

  public void execute() {
    try {
      executed = true;

      ProcessBuilder builder = new ProcessBuilder(commandAndArgs);
      builder.redirectErrorStream(true);
      Process proc = builder.start();

      drainer = new StreamDrainer(proc);
      Thread thread = new Thread(drainer, "Command line drainer: " + commandAndArgs[0]);
      thread.start();

      proc.waitFor();
      thread.join();

      exitCode = proc.exitValue();
    } catch (IOException e) {
      throw new WebDriverException(e);
    } catch (InterruptedException e) {
      throw new WebDriverException(e);
    }
  }

  public boolean isSuccessful() {
    return 0 == getExitCode();
  }

  public int getExitCode() {
    if (!executed) {
      throw new IllegalStateException(
          "Cannot get exit code before executing command line: " + commandAndArgs[0]);
    }
    return exitCode;
  }

  public String getStdOut() {
    if (!executed) {
      throw new IllegalStateException(
          "Cannot get output before executing command line: " + commandAndArgs[0]);
    }

    return drainer.getStdOut();
  }

  private static class StreamDrainer implements Runnable {
    private final Process toWatch;
    private ByteArrayOutputStream inputOut;

    public StreamDrainer(Process toWatch) {
      this.toWatch = toWatch;
    }

    public void run() {
      InputStream inputStream = new BufferedInputStream(toWatch.getInputStream());
      inputOut = new ByteArrayOutputStream();
      byte[] buffer = new byte[2048];

      try {
        int read;
        while ((read = inputStream.read(buffer)) > 0) {
          inputOut.write(buffer, 0, read);
          inputOut.flush();
        }
      } catch (IOException e) {
        throw new RuntimeException(e);
      } finally {
        try {
          inputOut.close();
        } catch (IOException e) {
          // Nothing sane to do
        }
      }
    }

    public String getStdOut() {
      return new String(inputOut.toByteArray());
    }
  }
}
