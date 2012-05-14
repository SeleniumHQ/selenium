/*
Copyright 2010 Selenium committers

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

import com.google.common.collect.ImmutableSet;

import java.io.File;
import java.io.FilenameFilter;

public class TestFilenameFilter implements FilenameFilter {

  private final ImmutableSet<File> excludedFiles;

  public TestFilenameFilter(ImmutableSet<File> excludedFiles) {
    this.excludedFiles = excludedFiles;
  }

  /** @inheritDoc */
  public boolean accept(File dir, String name) {
    File file = new File(dir, name);
    return !excludedFiles.contains(file) && name.endsWith("_test.html");
  }
}
