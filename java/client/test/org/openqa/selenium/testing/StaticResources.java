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

package org.openqa.selenium.testing;

import static org.openqa.selenium.build.DevMode.isInDevMode;

import org.openqa.selenium.build.BuckBuild;
import org.openqa.selenium.build.DevMode;
import org.openqa.selenium.build.InProject;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;

class StaticResources {

  static void ensureAvailable() {
    if (!DevMode.isInDevMode()) {
      return;
    }

    System.out.println("Copying resources");

    // W3C emulation
    copy(
        "//javascript/atoms/fragments:is-displayed",
        "org/openqa/selenium/remote/isDisplayed.js");
    copy(
        "//javascript/webdriver/atoms:get-attribute",
        "org/openqa/selenium/remote/getAttribute.js");

    // Firefox XPI
    copy(
        "//third_party/js/selenium:webdriver_prefs",
        "org/openqa/selenium/firefox/webdriver_prefs.json");
    copy(
        "//third_party/js/selenium:webdriver",
        "org/openqa/selenium/firefox/xpi/webdriver.xpi");
  }

  private static void copy(String buildTarget, String copyTo) {
    try {
      Path dest = InProject.locate("java/client/build/test").resolve(copyTo);

      if (Files.exists(dest)) {
        // Assume we're good.
        return;
      }

      Path source = new BuckBuild().of(buildTarget).go(isInDevMode());

      Files.createDirectories(dest.getParent());
      Files.copy(source, dest);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

}
