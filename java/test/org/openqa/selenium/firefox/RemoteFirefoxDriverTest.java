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

package org.openqa.selenium.firefox;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import java.io.File;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;

class RemoteFirefoxDriverTest extends JupiterTestBase {

  @Test
  @NoDriverAfterTest
  public void shouldAllowRemoteWebDriverBuilderToUseHasExtensions() {
    Path extension = InProject.locate("common/extensions/webextensions-selenium-example.xpi");
    String id = ((HasExtensions) driver).installExtension(extension);
    assertThat(id).isEqualTo("webextensions-selenium-example-v3@example.com");

    assertThatCode(() -> ((HasExtensions) driver).uninstallExtension(id))
        .doesNotThrowAnyException();
  }

  @Test
  void shouldTakeFullPageScreenshot() {
    File tempFile = ((HasFullPageScreenshot) driver).getFullPageScreenshotAs(OutputType.FILE);
    assertThat(tempFile).exists().isNotEmpty();
  }
}
