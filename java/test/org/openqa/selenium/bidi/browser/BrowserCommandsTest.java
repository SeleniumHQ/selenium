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

package org.openqa.selenium.bidi.browser;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContext;
import org.openqa.selenium.bidi.browsingcontext.CreateContextParameters;
import org.openqa.selenium.bidi.browsingcontext.ReadinessState;
import org.openqa.selenium.bidi.module.Browser;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;

class BrowserCommandsTest extends JupiterTestBase {

  private Browser browser;

  @BeforeEach
  public void setUp() {
    browser = new Browser(driver);
  }

  @Test
  @NeedsFreshDriver
  void canCreateAUserContext() {
    String userContext = browser.createUserContext();

    assertThat(userContext).isNotNull();

    browser.removeUserContext(userContext);
  }

  @Test
  @NeedsFreshDriver
  void canGetUserContexts() {
    String userContext1 = browser.createUserContext();
    String userContext2 = browser.createUserContext();

    List<String> userContexts = browser.getUserContexts();
    assertThat(userContexts.size()).isGreaterThanOrEqualTo(2);

    browser.removeUserContext(userContext1);
    browser.removeUserContext(userContext2);
  }

  @Test
  @NeedsFreshDriver
  void canRemoveUserContext() {
    String userContext1 = browser.createUserContext();
    String userContext2 = browser.createUserContext();

    List<String> userContexts = browser.getUserContexts();
    assertThat(userContexts.size()).isGreaterThanOrEqualTo(2);

    browser.removeUserContext(userContext2);

    List<String> updatedUserContexts = browser.getUserContexts();
    assertThat(userContext1).isIn(updatedUserContexts);
    assertThat(userContext2).isNotIn(updatedUserContexts);

    browser.removeUserContext(userContext1);
  }

  @Test
  @NeedsFreshDriver
  void canGetClientWindows() {
    List<ClientWindowInfo> clientWindows = browser.getClientWindows();

    assertThat(clientWindows).isNotNull();
    assertThat(clientWindows.size()).isGreaterThan(0);

    ClientWindowInfo windowInfo = clientWindows.get(0);
    assertThat(windowInfo.getClientWindow()).isNotNull();
    assertThat(windowInfo.getState()).isInstanceOf(ClientWindowState.class);
    assertThat(windowInfo.getWidth()).isGreaterThan(0);
    assertThat(windowInfo.getHeight()).isGreaterThan(0);
    assertThat(windowInfo.isActive()).isIn(true, false);
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(FIREFOX)
  void canSetDownloadBehaviorAllowed() throws Exception {
    Path tmpDir = TemporaryFilesystem.getDefaultTmpFS().createTempDir("downloads", "test").toPath();

    try {
      browser.setDownloadBehavior(new SetDownloadBehaviorParameters(true, tmpDir));

      BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
      String url = appServer.whereIs("downloads/download.html");
      context.navigate(url, ReadinessState.COMPLETE);

      driver.findElement(By.id("file-1")).click();

      new WebDriverWait(driver, Duration.ofSeconds(5))
          .until(
              d -> {
                try {
                  return Files.list(tmpDir)
                      .anyMatch(path -> path.getFileName().toString().equals("file_1.txt"));
                } catch (Exception e) {
                  return false;
                }
              });

      List<String> fileNames =
          Files.list(tmpDir)
              .map(path -> path.getFileName().toString())
              .collect(Collectors.toList());
      assertThat(fileNames).contains("file_1.txt");
    } finally {
      browser.setDownloadBehavior(new SetDownloadBehaviorParameters(null, (Path) null));
      TemporaryFilesystem.getDefaultTmpFS().deleteTempDir(tmpDir.toFile());
    }
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(FIREFOX)
  void canSetDownloadBehaviorDenied() throws Exception {
    Path tmpDir = TemporaryFilesystem.getDefaultTmpFS().createTempDir("downloads", "test").toPath();

    try {
      browser.setDownloadBehavior(new SetDownloadBehaviorParameters(false, (Path) null));

      BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
      String url = appServer.whereIs("downloads/download.html");
      context.navigate(url, ReadinessState.COMPLETE);

      driver.findElement(By.id("file-1")).click();

      // Try to wait for file to be downloaded - should timeout
      try {
        new WebDriverWait(driver, Duration.ofSeconds(3), Duration.ofMillis(200))
            .until(
                d -> {
                  try {
                    return Files.list(tmpDir).findAny().isPresent();
                  } catch (Exception e) {
                    return false;
                  }
                });

        List<String> files =
            Files.list(tmpDir)
                .map(path -> path.getFileName().toString())
                .collect(Collectors.toList());
        throw new AssertionError("A file was downloaded unexpectedly: " + files);
      } catch (TimeoutException ignored) {
      }
    } finally {
      browser.setDownloadBehavior(new SetDownloadBehaviorParameters(null, (Path) null));
      TemporaryFilesystem.getDefaultTmpFS().deleteTempDir(tmpDir.toFile());
    }
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(FIREFOX)
  void canSetDownloadBehaviorWithUserContext() throws Exception {
    Path tmpDir = TemporaryFilesystem.getDefaultTmpFS().createTempDir("downloads", "test").toPath();
    String userContext = browser.createUserContext();

    try {
      BrowsingContext bc =
          new BrowsingContext(
              driver, new CreateContextParameters(WindowType.WINDOW).userContext(userContext));
      String contextId = bc.getId();

      try {
        driver.switchTo().window(contextId);

        browser.setDownloadBehavior(
            new SetDownloadBehaviorParameters(true, tmpDir).userContexts(List.of(userContext)));

        String url = appServer.whereIs("downloads/download.html");
        bc.navigate(url, ReadinessState.COMPLETE);

        driver.findElement(By.id("file-1")).click();

        new WebDriverWait(driver, Duration.ofSeconds(5))
            .until(
                d -> {
                  try {
                    return Files.list(tmpDir)
                        .anyMatch(path -> path.getFileName().toString().equals("file_1.txt"));
                  } catch (Exception e) {
                    return false;
                  }
                });

        List<String> files =
            Files.list(tmpDir)
                .map(path -> path.getFileName().toString())
                .collect(Collectors.toList());
        assertThat(files).contains("file_1.txt");

        int initialFileCount = files.size();

        browser.setDownloadBehavior(
            new SetDownloadBehaviorParameters(false, (Path) null)
                .userContexts(List.of(userContext)));

        driver.findElement(By.id("file-2")).click();

        try {
          new WebDriverWait(driver, Duration.ofSeconds(3), Duration.ofMillis(200))
              .until(
                  d -> {
                    try {
                      long fileCount = Files.list(tmpDir).count();
                      return fileCount > initialFileCount;
                    } catch (Exception e) {
                      return false;
                    }
                  });

          List<String> filesAfter =
              Files.list(tmpDir)
                  .map(path -> path.getFileName().toString())
                  .collect(Collectors.toList());
          throw new AssertionError("A file was downloaded unexpectedly: " + filesAfter);
        } catch (TimeoutException ignored) {
        }
      } finally {
        browser.setDownloadBehavior(
            new SetDownloadBehaviorParameters(null, (Path) null)
                .userContexts(List.of(userContext)));
        bc.close();
      }
    } finally {
      browser.removeUserContext(userContext);
      TemporaryFilesystem.getDefaultTmpFS().deleteTempDir(tmpDir.toFile());
    }
  }
}
