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

import static org.openqa.selenium.Platform.WINDOWS;

import com.google.common.collect.ImmutableList;

import org.openqa.selenium.Platform;

import java.io.File;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Logger;

public class WindowsUtils {

  private static Logger LOG = Logger.getLogger(WindowsUtils.class.getName());
  private static final boolean THIS_IS_WINDOWS = Platform.getCurrent().is(WINDOWS);
  private static String taskkill = null;
  private static Properties env = null;

  /**
   * Kill processes by name
   *
   * @param name name of the process to kill
   */
  public static void killByName(String name) {
    executeCommand(findTaskKill(), "/f", "/t", "/im", name);
  }

  /**
   * Kills the specified process ID
   *
   * @param processID PID to kill
   */
  public static void killPID(String processID) {
    executeCommand(findTaskKill(), "/f", "/t", "/pid", processID);
  }

  private static String executeCommand(String commandName, String... args) {
    CommandLine cmd = new CommandLine(commandName, args);
    cmd.execute();

    String output = cmd.getStdOut();
    if (cmd.getExitCode() == 0 || cmd.getExitCode() ==  128 || cmd.getExitCode() ==  255) {
      return output;
    }
    throw new RuntimeException("exec return code " + cmd.getExitCode() + ": " + output);
  }

  /**
   * Returns the current process environment variables
   *
   * @return the current process environment variables
   */
  public static synchronized Properties loadEnvironment() {
    if (env != null) {
      return env;
    }
    env = new Properties();
    for (Map.Entry<String, String> entry : System.getenv().entrySet()) {
      env.put(entry.getKey(), entry.getValue());
    }
    return env;
  }

  /**
   * Returns the path to the Windows Program Files. On non-English versions, this is not necessarily
   * "C:\Program Files".
   *
   * @return the path to the Windows Program Files
   */
  public static String getProgramFilesPath() {
    return getEnvVarPath("ProgramFiles", "C:\\Program Files").replace(" (x86)", "");
  }

  public static String getProgramFiles86Path() {
    return getEnvVarPath("ProgramFiles(x86)", "C:\\Program Files (x86)");
  }

  private static String getEnvVarPath(final String envVar, final String defaultValue) {
    String pf = getEnvVarIgnoreCase(envVar);
    if (pf != null) {
      File programFiles = new File(pf);
      if (programFiles.exists()) {
        return programFiles.getAbsolutePath();
      }
    }
    return new File(defaultValue).getAbsolutePath();
  }

  public static ImmutableList<String> getPathsInProgramFiles(final String childPath) {
    return new ImmutableList.Builder<String>()
        .add(getFullPath(WindowsUtils.getProgramFilesPath(), childPath))
        .add(getFullPath(WindowsUtils.getProgramFiles86Path(), childPath))
        .build();
  }

  private static String getFullPath(String parent, String child) {
    return new File(parent, child).getAbsolutePath();
  }

  public static String getEnvVarIgnoreCase(String var) {
    Properties p = loadEnvironment();
    for (String key : p.stringPropertyNames()) {
      if (key.equalsIgnoreCase(var)) {
        return env.getProperty(key);
      }
    }
    return null;
  }

  /**
   * Finds the system root directory, e.g. "c:\windows" or "c:\winnt"
   *
   * @return location of system root
   */
  public static File findSystemRoot() {
    Properties p = loadEnvironment();
    String systemRootPath = p.getProperty("SystemRoot");
    if (systemRootPath == null) {
      systemRootPath = p.getProperty("SYSTEMROOT");
    }
    if (systemRootPath == null) {
      systemRootPath = p.getProperty("systemroot");
    }
    if (systemRootPath == null) {
      throw new RuntimeException("SystemRoot apparently not set!");
    }
    File systemRoot = new File(systemRootPath);
    if (!systemRoot.exists()) {
      throw new RuntimeException("SystemRoot doesn't exist: " + systemRootPath);
    }
    return systemRoot;
  }

  /**
   * Finds taskkill.exe
   *
   * @return the exact path to taskkill.exe, or just the string "taskkill" if it couldn't be found
   *         (in which case you can pass that to exec to try to run it from the path)
   */
  public static String findTaskKill() {
    if (taskkill != null) {
      return taskkill;
    }
    File systemRoot = findSystemRoot();
    File taskkillExe = new File(systemRoot, "system32/taskkill.exe");
    if (taskkillExe.exists()) {
      taskkill = taskkillExe.getAbsolutePath();
      return taskkill;
    }
    LOG.warning("Couldn't find taskkill! Hope it's on the path...");
    taskkill = "taskkill";
    return taskkill;
  }

  /**
   * Returns true if the current OS is MS Windows; false otherwise
   *
   * @return true if the current OS is MS Windows; false otherwise
   */
  public static boolean thisIsWindows() {
    return THIS_IS_WINDOWS;
  }

}
