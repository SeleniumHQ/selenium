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

import static java.time.Duration.ofSeconds;
import static java.util.stream.Collectors.toList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.bidi.browser.DownloadBehavior.allowed;
import static org.openqa.selenium.bidi.browser.DownloadBehavior.denied;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.logging.Logger;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContext;
import org.openqa.selenium.bidi.browsingcontext.CreateContextParameters;
import org.openqa.selenium.bidi.browsingcontext.ReadinessState;
import org.openqa.selenium.bidi.module.Browser;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;

class BrowserCommandsTest extends JupiterTestBase {

  private static final Logger LOG = Logger.getLogger(BrowserCommandsTest.class.getName());
  private final Path tmpDir =
      TemporaryFilesystem.getDefaultTmpFS()
          .createTempDir("selenium-", "-BrowserCommandsTest")
          .toPath();
  private Browser browser;

  @BeforeEach
  final void setUp() {
    browser = new Browser(driver);
    LOG.info(() -> "Created temp dir: " + tmpDir.toAbsolutePath());
  }

  @AfterEach
  final void resetDownloadBehavior() {
    if (browser != null) {
      browser.setDownloadBehavior(new SetDownloadBehaviorParameters(null));
    }
  }

  @AfterEach
  final void deleteTempDir() {
    LOG.info(() -> "Deleting temp dir: " + tmpDir.toAbsolutePath());
    TemporaryFilesystem.getDefaultTmpFS().deleteTempDir(tmpDir.toFile());
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
    List<String> initialUserContexts = browser.getUserContexts();

    String userContext1 = browser.createUserContext();
    String userContext2 = browser.createUserContext();

    List<String> userContexts = browser.getUserContexts();
    assertThat(userContexts.size()).isEqualTo(initialUserContexts.size() + 2);

    browser.removeUserContext(userContext1);
    browser.removeUserContext(userContext2);
  }

  @Test
  @NeedsFreshDriver
  void canRemoveUserContext() {
    List<String> initialUserContexts = browser.getUserContexts();

    String userContext1 = browser.createUserContext();
    String userContext2 = browser.createUserContext();
    assertThat(browser.getUserContexts()).hasSize(initialUserContexts.size() + 2);

    browser.removeUserContext(userContext2);

    assertThat(browser.getUserContexts())
        .hasSize(initialUserContexts.size() + 1)
        .contains(userContext1)
        .doesNotContain(userContext2);

    browser.removeUserContext(userContext1);
    assertThat(browser.getUserContexts()).containsExactlyInAnyOrderElementsOf(initialUserContexts);
  }

  @Test
  @NeedsFreshDriver
  void canGetClientWindows() {
    List<ClientWindowInfo> clientWindows = browser.getClientWindows();
    assertThat(clientWindows).hasSizeGreaterThan(0);

    ClientWindowInfo windowInfo = clientWindows.get(0);
    assertThat(windowInfo.getClientWindow()).isNotNull();
    assertThat(windowInfo.getState()).isInstanceOf(ClientWindowState.class);
    assertThat(windowInfo.getWidth()).isGreaterThan(0);
    assertThat(windowInfo.getHeight()).isGreaterThan(0);
    assertThat(windowInfo.isActive()).isIn(true, false);
  }

  @Test
  @NeedsFreshDriver
  void canSetDownloadBehaviorAllowed() {
    browser.setDownloadBehavior(new SetDownloadBehaviorParameters(allowed(tmpDir)));

    BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
    String url = appServer.whereIs("downloads/download.html");
    context.navigate(url, ReadinessState.COMPLETE);

    driver.findElement(By.id("file-1")).click();

    assertFileIsDownloaded("file_1.*\\.txt");
  }

  @Test
  @NeedsFreshDriver
  void canSetDownloadBehaviorDenied() throws InterruptedException {
    browser.setDownloadBehavior(new SetDownloadBehaviorParameters(denied()));

    BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
    String url = appServer.whereIs("downloads/download.html");
    context.navigate(url, ReadinessState.COMPLETE);
    List<String> initialFiles = files(tmpDir);

    driver.findElement(By.id("file-1")).click();

    Thread.sleep(2000);

    assertThat(files(tmpDir))
        .as("No new files should be downloaded")
        .containsExactlyInAnyOrderElementsOf(initialFiles);
  }

  @Test
  @NeedsFreshDriver
  void canSetDownloadBehaviorWithUserContext() throws InterruptedException {
    String userContext = browser.createUserContext();

    try {
      BrowsingContext bc =
          new BrowsingContext(
              driver, new CreateContextParameters(WindowType.WINDOW).userContext(userContext));
      String contextId = bc.getId();

      try {
        driver.switchTo().window(contextId);

        browser.setDownloadBehavior(
            new SetDownloadBehaviorParameters(allowed(tmpDir)).userContexts(List.of(userContext)));

        String url = appServer.whereIs("downloads/download.html");
        bc.navigate(url, ReadinessState.COMPLETE);

        driver.findElement(By.id("file-1")).click();

        assertFileIsDownloaded("file_1.*\\.txt");

        List<String> initialFiles = files(tmpDir);
        assertThat(initialFiles).contains("file_1.txt");

        browser.setDownloadBehavior(
            new SetDownloadBehaviorParameters(denied()).userContexts(List.of(userContext)));

        driver.findElement(By.id("file-2")).click();
        Thread.sleep(2000);

        List<String> filesAfter = files(tmpDir);
        assertThat(filesAfter).containsExactlyInAnyOrderElementsOf(initialFiles);

      } finally {
        bc.close();
      }
    } finally {
      browser.removeUserContext(userContext);
    }
  }

  private void assertFileIsDownloaded(String filenameRegex) {
    FileIsFound fileIsFound = new FileIsFound(tmpDir, Pattern.compile(filenameRegex));
    new WebDriverWait(driver, ofSeconds(5)).withMessage(fileIsFound).until(fileIsFound);
  }

  private static final class FileIsFound implements Function<WebDriver, Boolean>, Supplier<String> {
    private final Path dir;
    private final Pattern expectedFileName;
    private List<String> foundFiles;

    private FileIsFound(Path dir, Pattern expectedFileName) {
      this.dir = dir;
      this.expectedFileName = expectedFileName;
    }

    @Override
    public Boolean apply(WebDriver driver) {
      foundFiles = files(dir);
      Optional<String> result =
          foundFiles.stream().filter(f -> expectedFileName.matcher(f).matches()).findAny();
      if (result.isPresent()) {
        LOG.info(
            () ->
                "Found file: "
                    + result.get()
                    + " in temp dir: "
                    + dir.toAbsolutePath()
                    + ". All found files: "
                    + foundFiles);
      } else {
        LOG.info(
            () ->
                "Not found file: "
                    + expectedFileName
                    + " in temp dir: "
                    + dir.toAbsolutePath()
                    + ". All found files: "
                    + foundFiles);
      }
      return result.isPresent();
    }

    @Override
    public String get() {
      return String.format(
          "Expected to find file \"%s\", but found %s files: %s",
          expectedFileName, foundFiles.size(), foundFiles);
    }
  }

  private static List<String> files(Path dir) {
    try (Stream<Path> files = Files.list(dir)) {
      return files.map(path -> path.getFileName().toString()).collect(toList());
    } catch (IOException e) {
      throw new UncheckedIOException("Failed to check files in " + dir, e);
    }
  }
}
