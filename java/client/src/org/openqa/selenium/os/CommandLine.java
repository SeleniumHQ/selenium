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

import org.apache.commons.exec.DefaultExecuteResultHandler;
import org.apache.commons.exec.DefaultExecutor;
import org.apache.commons.exec.Executor;
import org.apache.commons.exec.ProcessDestroyer;
import org.apache.commons.exec.PumpStreamHandler;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static org.openqa.selenium.Platform.WINDOWS;

import com.google.common.collect.Maps;

public class CommandLine {
  private static final Method JDK6_CAN_EXECUTE = findJdk6CanExecuteMethod();
  private final ByteArrayOutputStream inputOut = new ByteArrayOutputStream();
  private volatile String allInput;
  private Map<String, String> env = new ConcurrentHashMap<String, String>();
  private final DefaultExecuteResultHandler handler = new DefaultExecuteResultHandler();
  private final Executor executor = new DefaultExecutor();
  private final org.apache.commons.exec.CommandLine cl;

  private volatile OutputStream drainTo;
  private final Snitch snitch = new Snitch();

  public CommandLine(String executable, String... args) {
    cl = new org.apache.commons.exec.CommandLine(findExecutable(executable));
    cl.addArguments( args);
  }

  public CommandLine(String[] cmdarray) {
    String executable = findExecutable(cmdarray[0]);
    cl = new org.apache.commons.exec.CommandLine(executable);
    for (int i = 1; i < cmdarray.length; i++) {
      cl.addArgument(cmdarray[i]);
    }
  }

  Map<String, String> getEnvironment() {
    return new HashMap<String, String>(env);
  }

  /**
   * Adds the specified environment variables.
   * 
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
   * @param value the value of the environment variable
   * @throws IllegalArgumentException if the value given is null (unsupported)
   */
  public void setEnvironmentVariable(String name, String value) {
    if (name == null) {
      throw new IllegalArgumentException("Cannot have a null environment variable name!");
    }
    if (value == null) {
      throw new IllegalArgumentException("Cannot have a null value for environment variable " +
          name);
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
    String[] endings = new String[] {""};
    if (Platform.getCurrent().is(WINDOWS)) {
      endings = new String[] {"", ".exe", ".com", ".bat"};
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
      final OutputStream outputStream = getOutputStream();
      executor.setStreamHandler( new PumpStreamHandler(outputStream, outputStream, getInputStream()));
      executor.execute( cl, getMergedEnv(), handler);
      handler.waitFor();
    } catch (IOException e) {
      throw new WebDriverException(e);
    } catch (InterruptedException e) {
      throw new WebDriverException(e);
    }
  }

  private OutputStream getOutputStream() {
    return drainTo == null ? inputOut : new MultioutputStream(inputOut, drainTo);
  }

  private Map<String, String> getMergedEnv() {
    HashMap<String, String> newEnv = Maps.newHashMap(System.getenv());
    newEnv.putAll(env);
    return newEnv;
  }


  public void executeAsync() {
    try {
      final OutputStream outputStream = getOutputStream();
      executor.setStreamHandler(new PumpStreamHandler(
          outputStream, outputStream, getInputStream()));
      // Commons-exec /really/ does not want to tell us about the Process ;)
      executor.setProcessDestroyer(snitch);
      executor.execute(cl, getMergedEnv(), handler);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  private ByteArrayInputStream getInputStream() {
    return allInput != null ? new ByteArrayInputStream(allInput.getBytes()) : null;
  }

  public void waitFor() {
    try {
      handler.waitFor();
      postRunCleanup();
    } catch (InterruptedException e) {
      throw new WebDriverException(e);
    }
  }

  public boolean isSuccessful() {
    return 0 == getExitCode();
  }

  public int getExitCode() {
    if (!handler.hasResult()) {
      throw new IllegalStateException(
          "Cannot get exit code before executing command line: " + cl);
    }
    return handler.getExitValue();
  }

  public String getStdOut() {
    if (!handler.hasResult()) {
      throw new IllegalStateException(
          "Cannot get output before executing command line: " + cl);
    }
    return new String(inputOut.toByteArray());
  }

 /**
  * Destroy the current command.
  * @return The exit code of the command.
  */
  public int destroy() {
    ProcessUtils.killProcess(snitch.getProcess());

    postRunCleanup();
    return getExitCode();
  }

  private void postRunCleanup() {
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
    this.allInput = allInput;
  }

  @Override
  public String toString() {
    return executor.toString();
  }

  public void copyOutputTo(OutputStream out) {
    drainTo = out;
  }

  // Because commons-exec is secretive about process.
  class Snitch implements ProcessDestroyer {
    private volatile Process process;

    public boolean add(Process process) {
      if (this.process != null) {
        throw new IllegalStateException("Unexpected re-use of snitch");
      }
      this.process = process;
      return true;
    }

    public boolean remove(Process process) {
      this.process = null;
      return true;
    }

    public int size() {
      return this.process == null ? 0 : 1;
    }

    public Process getProcess() {
      return process;
    }
  }


  class MultioutputStream extends OutputStream {

    private final OutputStream mandatory;
    private final OutputStream optional;

    MultioutputStream(OutputStream mandatory, OutputStream optional) {
      this.mandatory = mandatory;
      this.optional = optional;
    }

    @Override
    public void write(int b) throws IOException {
      mandatory.write(b);
      if (optional != null) {
        optional.write(b);
      }
    }

    @Override
    public void flush() throws IOException {
      mandatory.flush();
      if (optional != null) {
        optional.flush();
      }
    }

    @Override
    public void close() throws IOException {
      mandatory.close();
      if (optional != null) {
        optional.close();
      }
    }
  }
}
