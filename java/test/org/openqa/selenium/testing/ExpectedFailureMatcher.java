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

import java.lang.reflect.AnnotatedElement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.platform.commons.util.AnnotationUtils;
import org.openqa.selenium.Platform;
import org.openqa.selenium.testing.drivers.Browser;

final class ExpectedFailureMatcher {
  private ExpectedFailureMatcher() {}

  static boolean matches(ExtensionContext context) {
    List<ExpectedFailure> annotations = new ArrayList<>();

    context.getTestClass().ifPresent(testClass ->
        annotations.addAll(AnnotationUtils.findRepeatableAnnotations(testClass, ExpectedFailure.class)));

    context.getElement().ifPresent(element ->
        annotations.addAll(AnnotationUtils.findRepeatableAnnotations(element, ExpectedFailure.class)));

    Browser currentBrowser = Browser.detect();
    if (currentBrowser == null) {
      return false;
    }

    return annotations.stream().anyMatch(failure -> matches(failure, currentBrowser));
  }

  static boolean matches(ExpectedFailure failure, Browser currentBrowser) {
    Browser[] browsers =
        failure.browsers().length == 0 ? failure.value() : failure.browsers();
    if (!currentBrowser.matches(browsers)) {
      return false;
    }

    Platform currentPlatform = Platform.getCurrent();
    boolean platformMatches =
        Arrays.stream(failure.platforms())
            .anyMatch(platform -> platform == Platform.ANY || currentPlatform.is(platform));
    if (!platformMatches) {
      return false;
    }

    String currentVersion = System.getProperty("selenium.browser.version", "").trim();
    if (!failure.minVersion().isEmpty() || !failure.maxVersion().isEmpty()) {
      if (currentVersion.isEmpty()) {
        return false;
      }
      if (!failure.minVersion().isEmpty()
          && compareVersions(currentVersion, failure.minVersion()) < 0) {
        return false;
      }
      if (!failure.maxVersion().isEmpty()
          && compareVersions(currentVersion, failure.maxVersion()) > 0) {
        return false;
      }
    }

    return true;
  }

  static int compareVersions(String left, String right) {
    String[] leftParts = left.split("[.-]");
    String[] rightParts = right.split("[.-]");
    int length = Math.max(leftParts.length, rightParts.length);

    for (int i = 0; i < length; i++) {
      int leftPart = i < leftParts.length ? parseNumeric(leftParts[i]) : 0;
      int rightPart = i < rightParts.length ? parseNumeric(rightParts[i]) : 0;
      int result = Integer.compare(leftPart, rightPart);
      if (result != 0) {
        return result;
      }
    }
    return 0;
  }

  private static int parseNumeric(String value) {
    try {
      return Integer.parseInt(value);
    } catch (NumberFormatException e) {
      return 0;
    }
  }
}
