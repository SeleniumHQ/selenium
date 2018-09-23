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

@Deprecated
public class WindowsUtils {

  private static final boolean THIS_IS_WINDOWS = Platform.getCurrent().is(WINDOWS);
  private static Properties env = null;

  /**
   * Returns the current process environment variables
   *
   * @return the current process environment variables
   */
  @Deprecated
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
  @Deprecated
  public static String getProgramFilesPath() {
    return getEnvVarPath("ProgramFiles", "C:\\Program Files").replace(" (x86)", "");
  }

  @Deprecated
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

  @Deprecated
  public static ImmutableList<String> getPathsInProgramFiles(final String childPath) {
    return new ImmutableList.Builder<String>()
        .add(getFullPath(WindowsUtils.getProgramFilesPath(), childPath))
        .add(getFullPath(WindowsUtils.getProgramFiles86Path(), childPath))
        .build();
  }

  private static String getFullPath(String parent, String child) {
    return new File(parent, child).getAbsolutePath();
  }

  @Deprecated
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
   * Returns true if the current OS is MS Windows; false otherwise
   *
   * @return true if the current OS is MS Windows; false otherwise
   * @deprecated Use <code>Platform.getCurrent().is(WINDOWS)</code> instead
   */
  @Deprecated
  public static boolean thisIsWindows() {
    return THIS_IS_WINDOWS;
  }

}
