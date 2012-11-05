/*
Copyright 2011 Software Freedom Conservancy.

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

package org.openqa.selenium.javascript;

import com.google.common.base.Function;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

import org.openqa.selenium.testing.InProject;

import java.io.File;
import java.io.FilenameFilter;
import java.util.List;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import static java.lang.System.getProperty;

/**
 * Builder for test suites that run JavaScript tests.
 */
class TestFileLocator {

  private static final String TEST_DIRECTORY_PROPERTY = "js.test.dir";
  private static final String TEST_EXCLUDES_PROPERTY = "js.test.excludes";

  public static List<File> findTestFiles() {
    File directory = getTestDirectory();
    FilenameFilter filter = new TestFilenameFilter(getExcludedFiles(directory));
    return findTestFiles(directory, filter);
  }
  
  private static List<File> findTestFiles(File directory, FilenameFilter filter) {
    List<File> files = Lists.newLinkedList();
    for (File file : directory.listFiles()) {
      if (file.isDirectory()) {
        files.addAll(findTestFiles(file, filter));
      } else if (filter.accept(file.getParentFile(), file.getName())) {
        files.add(file);
      }
    }
    return files;
  }

  private static File getTestDirectory() {
    String testDirName = checkNotNull(getProperty(TEST_DIRECTORY_PROPERTY),
        "You must specify the test directory with the %s system property",
        TEST_DIRECTORY_PROPERTY);

    File testDir = InProject.locate(testDirName);
    checkArgument(testDir.exists(), "Test directory does not exist: %s",
        testDirName);
    checkArgument(testDir.isDirectory());

    return testDir;
  }

  private static ImmutableSet<File> getExcludedFiles(final File testDirectory) {
    String excludedFiles = getProperty(TEST_EXCLUDES_PROPERTY);
    if (excludedFiles == null) {
      return ImmutableSet.of();
    }

    Iterable<String> splitExcludes =
        Splitter.on(',').omitEmptyStrings().split(excludedFiles);

    return ImmutableSet.copyOf(Iterables.transform(splitExcludes,
        new Function<String, File>() {
          public File apply(String input) {
            return new File(testDirectory, input);
          }
        }));
  }

  public static String getTestFilePath(File baseDir, File testFile) {
    return testFile.getAbsolutePath()
        .replace(baseDir.getAbsolutePath() + File.separator, "")
        .replace(File.separator, "/");
  }
}
