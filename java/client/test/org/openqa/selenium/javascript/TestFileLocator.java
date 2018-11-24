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

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import static java.lang.System.getProperty;

import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.build.InProject;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
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
    ImmutableSet<Path> excludedFiles = getExcludedFiles(directory);
    return findTestFiles(directory, excludedFiles);
  }

  private static List<Path> findTestFiles(Path directory, ImmutableSet<Path> excludedFiles)
    throws IOException {
    return Files.find(
      directory,
      Integer.MAX_VALUE,
      (path, basicFileAttributes) -> {
        String name = path.getFileName().toString();
        Path sibling = path.resolveSibling(name.replace(".js", ".html"));
        return name.endsWith("_test.html")
               || (name.endsWith("_test.js") && !Files.exists(sibling));
      })
      .filter(path -> !excludedFiles.contains(path))
      .collect(Collectors.toList());
  }

  private static Path getTestDirectory() {
    String testDirName = checkNotNull(getProperty(TEST_DIRECTORY_PROPERTY),
        "You must specify the test directory with the %s system property",
        TEST_DIRECTORY_PROPERTY);

    Path testDir = InProject.locate(testDirName);
    checkArgument(Files.exists(testDir), "Test directory does not exist: %s",
        testDirName);
    checkArgument(Files.isDirectory(testDir));

    return testDir;
  }

  private static ImmutableSet<Path> getExcludedFiles(final Path testDirectory) {
    String excludedFiles = getProperty(TEST_EXCLUDES_PROPERTY);
    if (excludedFiles == null) {
      return ImmutableSet.of();
    }

    Iterable<String> splitExcludes = Splitter.on(',').omitEmptyStrings().split(excludedFiles);

    return ImmutableSet.copyOf(
        StreamSupport.stream(splitExcludes.spliterator(), false)
            .map(testDirectory::resolve).collect(Collectors.toList()));
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
