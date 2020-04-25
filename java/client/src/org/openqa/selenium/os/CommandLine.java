// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.os;


import static org.openqa.selenium.Platform.MAC;
import static org.openqa.selenium.Platform.WINDOWS;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;

import java.io.File;
import java.io.OutputStream;
import java.util.Map;

public class CommandLine {

  private final OsProcess process;

  public CommandLine(String executable, String... args) {
    process = new OsProcess(executable, args);
  }

  /**
   * @deprecated Use {@link #CommandLine(String, String...)}
   */
  @Deprecated
  public CommandLine(String[] cmdarray) {
    String executable = cmdarray[0];
    int length = cmdarray.length - 1;
    String[] args = new String[length];
    System.arraycopy(cmdarray, 1, args, 0, length);

    process = new OsProcess(executable, args);
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

  public void updateDynamicLibraryPath(String extraPath) {
    if (extraPath != null) {
      String existing = System.getenv(getLibraryPathPropertyName());
      String ldPath = existing != null ? existing + File.pathSeparator + extraPath : extraPath;
      setEnvironmentVariable(getLibraryPathPropertyName(), ldPath);
    }
  }

  /**
   * @return The platform specific env property name which contains the library path.
   */
  public static String getLibraryPathPropertyName() {
    Platform current = Platform.getCurrent();

    if (current.is(WINDOWS)) {
      return "PATH";

    } else if (current.is(MAC)) {
      return "DYLD_LIBRARY_PATH";

    } else {
      return "LD_LIBRARY_PATH";
    }
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
      Thread.currentThread().interrupt();
      throw new WebDriverException(e);
    }
  }

  public void waitFor(long timeout) {
    try {
      process.waitFor(timeout);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
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

  /**
   * Check whether the current command is still executing.
   *
   * @return true if the current command is still executing, false otherwise
   */
  public boolean isRunning() {
    return process.isRunning();
  }

  public void setInput(String allInput) {
    process.setInput(allInput);
  }

  public void setWorkingDirectory(String workingDirectory) {
    process.setWorkingDirectory(new File(workingDirectory));
  }

  @Override
  public String toString() {
    return process.toString();
  }

  public void copyOutputTo(OutputStream out) {
    process.copyOutputTo(out);
  }

  public void checkForError() {
    process.checkForError();
  }
}
