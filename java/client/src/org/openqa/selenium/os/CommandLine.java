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

package org.openqa.selenium.os;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;

import static org.openqa.selenium.Platform.WINDOWS;

public class CommandLine {
  private static final Method JDK6_CAN_EXECUTE = findJdk6CanExecuteMethod();
  private final String[] commandAndArgs;
  private volatile StreamDrainer drainer;
  private volatile OutputStream drainTo;
  private volatile Thread drainerThread;
  private volatile int exitCode;
  private volatile boolean executed;
  private volatile Process proc;
  private volatile String allInput;
  private Map<String, String> env = new ConcurrentHashMap<String, String>();
  private Thread cleanup;

  public CommandLine(String executable, String... args) {
    commandAndArgs = new String[args.length + 1];
    commandAndArgs[0] = findExecutable(executable);
    int index = 1;
    for (String arg : args) {
      commandAndArgs[index++] = arg;
    }
  }

  public CommandLine(String[] cmdarray) {
    this.commandAndArgs = cmdarray;
  }

  Map<String, String> getEnvironment() {
    return new HashMap<String, String>(env);
  }

  /**
   * Adds the specified environment variables.
   * @param environment the variables to add
   *
   * @throws IllegalArgumentException if any value given is null (unsupported)
   */
  public void setEnvironmentVariables(Map<String, String> environment) {
    for (Map.Entry<String, String> entry : environment.entrySet()) {
      setEnvironmentVariable(entry.getKey(), entry.getValue());
    }
  }

  /**
   * Adds the specified environment variable.
   *
   * @param name the name of the environment variable
   * @param value  the value of the environment variable
   * @throws IllegalArgumentException if the value given is null (unsupported)
   */
  public void setEnvironmentVariable(String name, String value) {
    if (name == null) {
      throw new IllegalArgumentException("Cannot have a null environment variable name!");
    }
    if (value == null) {
      throw new IllegalArgumentException("Cannot have a null value for environment variable " + name);
    }
    env.put(name, value);
  }

  public void setDynamicLibraryPath(String newLibraryPath) {
    // because on Windows, it is null according to SingleBrowserLocator.computeLibraryPath()
    if (newLibraryPath != null) {
      setEnvironmentVariable(getLibraryPathPropertyName(), newLibraryPath);
    }
  }

  /**
   * @return The platform specific env property name which contains the library path.
   */
  public static String getLibraryPathPropertyName() {
    switch (Platform.getCurrent()) {
      case MAC:
          return "DYLD_LIBRARY_PATH";

      case WINDOWS:
      case VISTA:
      case XP:
          return "PATH";

      default:
          return "LD_LIBRARY_PATH";
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
      createProcess();
      setupDrainer();
      waitFor();
  }

  public Process executeAsync() {
    createProcess();

    new Thread() {
      @Override
      public void run() {
        setupDrainer();
        waitFor();
      }
    }.start();

    cleanup = new Thread() {
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
    };
    Runtime.getRuntime().addShutdownHook(cleanup);

    return proc;
  }

  private void waitFor() {
    try {
      proc.waitFor();
      if(drainerThread != null) {
          drainerThread.join();
      }

      exitCode = proc.exitValue();
      postRunCleanup();
    } catch (InterruptedException e) {
      throw new WebDriverException(e);
    }
  }

  private void setupDrainer() {
    try {
      drainer = new StreamDrainer(proc, drainTo);
      drainerThread = new Thread(drainer, "Command line drainer: " + commandAndArgs[0]);
      drainerThread.start();

      if (allInput != null) {
        byte[] bytes = allInput.getBytes();
        proc.getOutputStream().write(bytes);
        proc.getOutputStream().close();
      }
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  private void createProcess() {
    try {
      ProcessBuilder builder = new ProcessBuilder(commandAndArgs);
      builder.redirectErrorStream(true);
      builder.environment().putAll(env);

      proc = builder.start();
      executed = true;
    } catch (IOException e) {
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

  public void destroy() {
    if (!executed) {
      throw new IllegalStateException("Cannot quit a process that's not running: " + commandAndArgs[0]);
    }

    proc.destroy();
    postRunCleanup();
  }

  private void postRunCleanup() {
    proc = null;
    if (cleanup != null) {
      try {
        Runtime.getRuntime().removeShutdownHook(cleanup);
      } catch (IllegalStateException e) {
        // VM is shutting down
      }
      cleanup = null;
    }
  }

  private static boolean canExecute(File file) {
    if (file.isDirectory()) {
      return false;
    }

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

  public void setInput(String allInput) {
    this.allInput = allInput;
  }

  public String toString() {
    StringBuilder buf = new StringBuilder();
    for (String s : commandAndArgs) {
      buf.append(s).append(' ');
    }
    return buf.toString();
  }

  public void copyOutputTo(OutputStream out) {
    drainTo = out;
  }

  private static class StreamDrainer implements Runnable {
    private final Process toWatch;
    private final ByteArrayOutputStream inputOut;
    private final OutputStream drainTo;

    StreamDrainer(Process toWatch, OutputStream drainTo) {
      this.toWatch = toWatch;
      this.drainTo = drainTo;
      this.inputOut = new ByteArrayOutputStream();
    }

    public void run() {
      InputStream inputStream = new BufferedInputStream(toWatch.getInputStream());
      byte[] buffer = new byte[2048];

      try {
        int read;
        while ((read = inputStream.read(buffer)) > 0) {
          inputOut.write(buffer, 0, read);
          inputOut.flush();

          if (drainTo != null) {
            drainTo.write(buffer, 0, read);
            drainTo.flush();
          }
        }
      } catch (IOException e) {
        // it's possible that the stream has been closed. That's okay.
        // Swallow the exception
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
