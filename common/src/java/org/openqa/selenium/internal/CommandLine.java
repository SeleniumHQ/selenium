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
  private volatile Thread drainerThread;
  private volatile int exitCode;
  private volatile boolean executed;
  private volatile Process proc;
  private volatile String allInput;
  private Map<String, String> env = new ConcurrentHashMap<String, String>();

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
      executed = true;
      createProcess();
      setupDrainer();
      waitFor();
  }

  public Process executeAsync() {
    createProcess();

    new Thread() {
      @Override
      public void run() {
        executed = true;
        setupDrainer();
        waitFor();
      }
    }.start();

    // FIXME: we're leaking the Process instance here
    // This hook should be removed altogether as it's just hiding bugs.
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

    return proc;
  }

  private void waitFor() {
    try {
      proc.waitFor();
      if(drainerThread != null) {
          drainerThread.join();
      }

      exitCode = proc.exitValue();
    } catch (InterruptedException e) {
      throw new WebDriverException(e);
    }
  }

  private void setupDrainer() {
    try {
      drainer = new StreamDrainer(proc);
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
