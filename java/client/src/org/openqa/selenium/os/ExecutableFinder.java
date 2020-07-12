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

import static java.util.Collections.emptyList;
import static java.util.Collections.singletonList;
import static org.openqa.selenium.Platform.WINDOWS;

import org.openqa.selenium.Platform;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class ExecutableFinder {
  private static final List<String> ENDINGS = Platform.getCurrent().is(WINDOWS) ?
      Arrays.asList("", ".cmd", ".exe", ".com", ".bat") : singletonList("");

  /**
   * Find the executable by scanning the file system and the PATH. In the case of Windows this
   * method allows common executable endings (".com", ".bat" and ".exe") to be omitted.
   *
   * @param named The name of the executable to find
   * @return The absolute path to the executable, or null if no match is made.
   */
  public String find(String named) {
    File file = new File(named);
    if (canExecute(file)) {
      return named;
    }

    if (Platform.getCurrent().is(Platform.WINDOWS)) {
      file = new File(named + ".exe");
      if (canExecute(file)) {
        return named + ".exe";
      }
    }

    List<String> pathSegments = new ArrayList<>(fromEnvironment());
    if (Platform.getCurrent().is(Platform.MAC)) {
      pathSegments.addAll(macSpecificPathSegments());
    }

    for (String pathSegment : pathSegments) {
      for (String ending : ENDINGS) {
        file = new File(pathSegment, named + ending);
        if (canExecute(file)) {
          return file.getAbsolutePath();
        }
      }
    }
    return null;
  }

  private List<String> fromEnvironment() {
    String pathName = "PATH";
    Map<String, String> env = System.getenv();
    if (!env.containsKey(pathName)) {
      for (String key : env.keySet()) {
        if (pathName.equalsIgnoreCase(key)) {
          pathName = key;
          break;
        }
      }
    }
    String path = env.get(pathName);
    return path != null ? Arrays.asList(path.split(File.pathSeparator)) : emptyList();
  }

  private List<String> macSpecificPathSegments() {
    File pathFile = new File("/etc/paths");
    if (pathFile.exists()) {
      try {
        return Files.readAllLines(pathFile.toPath());
      } catch (IOException e) {
        // Guess we won't include those, then
      }
    }
    return emptyList();
  }

  private static boolean canExecute(File file) {
    return file.exists() && !file.isDirectory() && file.canExecute();
  }
}
