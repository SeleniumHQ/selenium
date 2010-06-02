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
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Map;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;

import static org.openqa.selenium.Platform.WINDOWS;

public class CommandLine {
  private static final Method JDK6_CAN_EXECUTE = findJdk6CanExecuteMethod();
  private final String[] commandAndArgs;
  private StreamDrainer drainer;
  private int exitCode;
  private boolean executed;
  private Process proc;

  public CommandLine(String executable, String... args) {
    commandAndArgs = new String[args.length + 1];
    commandAndArgs[0] = findExecutable(executable);
    int index = 1;
    for (String arg : args) {
      commandAndArgs[index++] = arg;
    }
  }

  public static String findExecutable(String named) {
    File file = new File(named);
    if (canExecute(file)) {
      return named;
    }

    Map<String, String> env = System.getenv();
    String pathName = "PATH";
    if (!env.containsKey("PATH")) {
      for (String key : env.keySet()) {
        if ("path".equalsIgnoreCase(key)) {
          pathName = key;
          break;
        }
      }
    }

    String path = env.get(pathName);
    String[] endings = new String[] {""};
    if (Platform.getCurrent().is(WINDOWS)) {
      endings = new String[] { "", ".exe", ".com", ".bat"};
    }

    for (String segment : path.split(File.pathSeparator)) {
      for (String ending : endings) {
        file = new File(segment, named + ending);
        if (canExecute(file)) {
          return file.getAbsolutePath();
        }
      }
    }

    return null;
  }

  public void execute() {
    try {
      executed = true;

      ProcessBuilder builder = new ProcessBuilder(commandAndArgs);
      builder.redirectErrorStream(true);
      proc = builder.start();

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

  public void executeAsync() {
    new Thread() {
      @Override
      public void run() {
        execute();
      }
    }.start();

    Runtime.getRuntime().addShutdownHook(new Thread() {
      @Override
      public void run() {
        if (proc != null) {
          try {
            proc.exitValue();
          } catch (IllegalThreadStateException e) {
            proc.destroy();
          }
        }
      }
    });
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

  public void destroy() {
    if (!executed) {
      throw new IllegalStateException("Cannot quit a process that's not running: " + commandAndArgs[0]);
    }

    proc.destroy();
  }

  private static boolean canExecute(File file) {
    if (JDK6_CAN_EXECUTE != null) {
      try {
        return (Boolean) JDK6_CAN_EXECUTE.invoke(file);
      } catch (IllegalAccessException e) {
        // Do nothing
      } catch (InvocationTargetException e) {
        // Still do nothing
      }
    }
    return true;
  }

  private static Method findJdk6CanExecuteMethod() {
    try {
      return File.class.getMethod("setWritable", Boolean.class);
    } catch (NoSuchMethodException e) {
      return null;
    }
  }


  private static class StreamDrainer implements Runnable {
    private final Process toWatch;
    private ByteArrayOutputStream inputOut;

    StreamDrainer(Process toWatch) {
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
