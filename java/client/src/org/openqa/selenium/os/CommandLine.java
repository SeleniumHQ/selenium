/*
Copyright 2010 WebDriver committers
Copyright 2010 Software Freedom Conservancy

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

import static org.openqa.selenium.Platform.WINDOWS;

import com.google.common.annotations.VisibleForTesting;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;

import java.io.File;
import java.io.OutputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Map;

public class CommandLine {

  private static final Method JDK6_CAN_EXECUTE = findJdk6CanExecuteMethod();
  private OsProcess process;

  public CommandLine(String executable, String... args) {
    process = new UnixProcess(executable, args);
  }

  public CommandLine(String[] cmdarray) {
    String executable = cmdarray[0];
    int length = cmdarray.length - 1;
    String[] args = new String[length];
    System.arraycopy(cmdarray, 1, args, 0, length - 1);

    process = new UnixProcess(executable, args);
  }

  @VisibleForTesting
  Map<String, String> getEnvironment() {
    return process.getEnvironment();
  }

  /**
   * Adds the specified environment variables.
   *
   * @param environment the variables to add
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
   * @param name  the name of the environment variable
   * @param value the value of the environment variable
   * @throws IllegalArgumentException if the value given is null (unsupported)
   */
  public void setEnvironmentVariable(String name, String value) {
    process.setEnvironmentVariable(name, value);
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

  /**
   * Find the executable by scanning the file system and the PATH. In the case of Windows this
   * method allows common executable endings (".com", ".bat" and ".exe") to be omitted.
   *
   * @param named The name of the executable to find
   * @return The absolute path to the executable, or null if no match is made.
   */
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
    String[] endings = new String[]{""};
    if (Platform.getCurrent().is(WINDOWS)) {
      endings = new String[]{"", ".exe", ".com", ".bat"};
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

  public void executeAsync() {
    process.executeAsync();
  }

  public void execute() {
    executeAsync();
    waitFor();
  }

  public void waitFor() {
    try {
      process.waitFor();
    } catch (InterruptedException e) {
      throw new WebDriverException(e);
    }
  }

  public boolean isSuccessful() {
    return 0 == getExitCode();
  }

  public int getExitCode() {
    return process.getExitCode();
  }

  public String getStdOut() {
    return process.getStdOut();
  }

  /**
   * Destroy the current command.
   *
   * @return The exit code of the command.
   */
  public int destroy() {
    return process.destroy();
  }

  private static boolean canExecute(File file) {
    if (!file.exists() || file.isDirectory()) {
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
      return File.class.getMethod("canExecute");
    } catch (NoSuchMethodException e) {
      return null;
    }
  }

  public void setInput(String allInput) {
    process.setInput(allInput);
  }

  @Override
  public String toString() {
    return process.toString();
  }

  public void copyOutputTo(OutputStream out) {
    process.copyOutputTo(out);
  }
}
