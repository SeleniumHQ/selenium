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

package org.openqa.selenium.javascript;

import static java.lang.System.getProperty;
import static java.util.Collections.emptySet;

import com.google.common.base.Splitter;

import org.openqa.selenium.build.InProject;
import org.openqa.selenium.internal.Require;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;


/**
 * Builder for test suites that run JavaScript tests.
 */
class TestFileLocator {

  private static final String TEST_DIRECTORY_PROPERTY = "js.test.dir";
  private static final String TEST_EXCLUDES_PROPERTY = "js.test.excludes";

  public static List<Path> findTestFiles() throws IOException {
    Path directory = getTestDirectory();
    Set<Path> excludedFiles = getExcludedFiles(directory);
    return findTestFiles(directory, excludedFiles);
  }

  private static List<Path> findTestFiles(Path directory, Set<Path> excludedFiles)
    throws IOException {
    return Files.find(
      directory,
      Integer.MAX_VALUE,
      (path, basicFileAttributes) -> {
        String name = path.getFileName().toString();
        return name.endsWith("_test.html");
        // TODO: revive support for _test.js files.
//        Path sibling = path.resolveSibling(name.replace(".js", ".html"));
//        return name.endsWith("_test.html")
//               || (name.endsWith("_test.js") && !Files.exists(sibling));
      })
      .filter(path -> !excludedFiles.contains(path))
      .collect(Collectors.toList());
  }

  private static Path getTestDirectory() {
    String testDirName = Require.state("Test directory", getProperty(TEST_DIRECTORY_PROPERTY)).nonNull(
                                 "You must specify the test directory with the %s system property",
                                 TEST_DIRECTORY_PROPERTY);
    
    Path runfiles = InProject.findRunfilesRoot();
    Path testDir;
    if (runfiles != null) {
      // Running with bazel.
      testDir = runfiles.resolve("selenium").resolve(testDirName);
    } else {
      // Legacy.
      testDir = InProject.locate(testDirName);
    }

    Require.state("Test directory", testDir.toFile()).isDirectory();

    return testDir;
  }

  private static Set<Path> getExcludedFiles(final Path testDirectory) {
    String excludedFiles = getProperty(TEST_EXCLUDES_PROPERTY);
    if (excludedFiles == null) {
      return emptySet();
    }

    Iterable<String> splitExcludes = Splitter.on(',').omitEmptyStrings().split(excludedFiles);

    return StreamSupport.stream(splitExcludes.spliterator(), false)
        .map(testDirectory::resolve).collect(Collectors.toSet());
  }

  public static String getTestFilePath(Path baseDir, Path testFile) {
    String path = testFile.toAbsolutePath().toString()
        .replace(baseDir.toAbsolutePath().toString() + File.separator, "")
        .replace(File.separator, "/");
    if (path.endsWith(".js")) {
      path = "common/generated/" + path;
    }
    return path;
  }
}
