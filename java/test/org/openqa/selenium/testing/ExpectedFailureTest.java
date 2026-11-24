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

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.Platform.ANY;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

import org.junit.jupiter.api.Test;

class ExpectedFailureTest {

  @Test
  @ExpectedFailure(value = CHROME, platforms = ANY, reason = "browser match")
  void browserAliasMatches() {
    assertThat(annotateBrowserAlias()).isTrue();
  }

  @Test
  @ExpectedFailure(browsers = FIREFOX, platforms = ANY, reason = "browser match")
  void browsersFieldMatches() {
    assertThat(annotateBrowsersField()).isTrue();
  }

  @Test
  void versionRangesAreComparedNumerically() {
    assertThat(ExpectedFailureMatcher.compareVersions("149.1", "149.0")).isGreaterThan(0);
    assertThat(ExpectedFailureMatcher.compareVersions("148.12", "149.0")).isLessThan(0);
  }

  private boolean annotateBrowserAlias() {
    try {
      return ExpectedFailureMatcher.matches(
          getClass().getDeclaredMethod("browserAliasMatches").getAnnotation(ExpectedFailure.class),
          CHROME);
    } catch (NoSuchMethodException e) {
      throw new AssertionError(e);
    }
  }

  private boolean annotateBrowsersField() {
    try {
      return ExpectedFailureMatcher.matches(
          getClass().getDeclaredMethod("browsersFieldMatches").getAnnotation(ExpectedFailure.class),
          FIREFOX);
    } catch (NoSuchMethodException e) {
      throw new AssertionError(e);
    }
  }
}
