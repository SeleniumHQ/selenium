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

package org.openqa.selenium.build;

import static org.openqa.selenium.Platform.WINDOWS;

import java.io.FileNotFoundException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.stream.Stream;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;

public class InProject {
  /**
   * Locates a file in the current project
   *
   * @param paths path to file to locate from root of project
   * @return file being sought, if it exists
   * @throws org.openqa.selenium.WebDriverException wrapped FileNotFoundException if file could not
   *     be found
   */
  public static Path locate(String... paths) {
    return Stream.of(paths)
        .map(Paths::get)
        .filter(Files::exists)
        .findFirst()
        .map(Path::toAbsolutePath)
        .orElseGet(
            () -> {
              Path root = findProjectRoot();
              return Stream.of(paths)
                  .map(
                      path -> {
                        Path needle = root.resolve(path);
                        return Files.exists(needle) ? needle : null;
                      })
                  .filter(Objects::nonNull)
                  .findFirst()
                  .orElseThrow(
                      () ->
                          new WebDriverException(
                              new FileNotFoundException(
                                  String.format(
                                      "Could not find any of %s in the project",
                                      String.join(",", paths)))));
            });
  }

  public static Path findProjectRoot() {
    Path dir;
    if (!Platform.getCurrent().is(WINDOWS)) {
      dir = findRunfilesRoot();
      if (dir != null) {
        return dir.resolve("selenium").normalize();
      }
    }

    dir = Paths.get(".").toAbsolutePath();
    Path pwd = dir;
    while (dir != null && !dir.equals(dir.getParent())) {
      Path versionFile = dir.resolve("java/version.bzl");
      if (Files.exists(versionFile)) {
        break;
      }
      dir = dir.getParent();
    }

    if (dir == null) {
      throw new IllegalStateException(
          String.format("Unable to find root of project in %s when looking", pwd));
    }

    return dir.normalize();
  }

  public static Path findRunfilesRoot() {
    String srcdir = System.getenv("TEST_SRCDIR");
    if (srcdir == null || srcdir.isEmpty()) {
      return null;
    }
    Path dir = Paths.get(srcdir).toAbsolutePath().normalize();
    if (Files.exists(dir) && Files.isDirectory(dir)) {
      return dir;
    }
    return null;
  }
}
