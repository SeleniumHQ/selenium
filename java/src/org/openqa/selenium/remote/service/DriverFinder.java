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

package org.openqa.selenium.remote.service;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.os.ExecutableFinder;

import java.io.File;
public abstract class DriverFinder {

  /**
   *
   * @param exeName Name of the executable file to look for in PATH
   * @param exeProperty Name of a system property that specifies the path to the executable file
   * @param exeDocs The link to the driver documentation page
   * @param exeDownload The link to the driver download page
   *
   * @return The driver executable as a {@link File} object
   * @throws IllegalStateException If the executable not found or cannot be executed
   */
  protected static File findExecutable(String exeName, String exeProperty, String exeDocs, String exeDownload) {
    String exePath = getFromSystem(exeProperty, exeName);
    return validatePath(exePath, exeProperty, exeDocs, exeDownload);
  }

  protected static File findExecutable(String exeName, String exeProperty, String exeDocs, String exeDownload, Capabilities options) {
    String exePath = getFromSystem(exeProperty, exeName);
    if (exePath == null) {
      try {
        exePath = SeleniumManager.getInstance().getDriverPath(options);
      } catch (Exception e) {
        // Log errors but do not propagate to user
      }
    }
    return validatePath(exePath, exeProperty, exeDocs, exeDownload);
  }

  private static String getFromSystem(String property, String name) {
    String exePath = System.getProperty(property);

    if(exePath == null) {
      exePath = new ExecutableFinder().find(name);
    }

    return exePath;
  }

  private static File validatePath(String path, String exeProperty, String exeDocs, String exeDownload) {
    String validPath = Require.state("The path to the driver executable", path).nonNull(
      "The path to the driver executable must be set by the %s system property;"
        + " for more information, see %s. "
        + "The latest version can be downloaded from %s",
      exeProperty, exeDocs, exeDownload);

    File exe = new File(validPath);
    checkExecutable(exe);
    return exe;
  }

  public static void checkExecutable(File exe) {
    Require.state("The driver executable", exe).isFile();
    Require.stateCondition(exe.canExecute(), "It must be an executable file: %s", exe);
  }
}
