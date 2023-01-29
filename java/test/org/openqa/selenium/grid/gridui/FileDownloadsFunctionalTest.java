package org.openqa.selenium.grid.gridui;

import static org.assertj.core.api.Assertions.assertThat;

import com.google.common.collect.ImmutableMap;
import java.io.File;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.drivers.Browser;

class FileDownloadsFunctionalTest extends AbstractGridTest {

  private static final File tmpDir = new File(System.getProperty("java.io.tmpdir"));
  private Server<?> server;

  @BeforeEach
  public void setup() {
    ImmutableMap<String, Object> nodeData = ImmutableMap.of(
      "base-dir-downloads",tmpDir.getAbsolutePath(), "enable-manage-downloads", true);
    server = createStandalone(nodeData);
  }

  @Test
  void shouldDownloadFunctionalTestForEdge() throws InterruptedException {
    runFileDownloadTestOn(Browser.EDGE);
  }

  @Test
  void shouldDownloadFunctionalTestForChrome() throws InterruptedException {
    runFileDownloadTestOn(Browser.CHROME);
  }

  @Test
  void shouldDownloadFunctionalTestForFirefox() throws InterruptedException {
    runFileDownloadTestOn(Browser.FIREFOX);
  }

  private static final String FILENAME = "selenium-generated-tests-1.0.1.jar";

  private void runFileDownloadTestOn(Browser browser) throws InterruptedException {
    Capabilities options = browser.getCapabilities()
      .merge(new ImmutableCapabilities("se:enableDownloads", true));
    if (browser == Browser.CHROME) {
      options = appendPrefs(options, ImmutableMap.of("safebrowsing.enabled", true));
    }
    RemoteWebDriver driver = new RemoteWebDriver(server.getUrl(), options);
    try {
      driver.get(
        "https://repo1.maven.org/maven2/org/seleniumhq/selenium/tests/selenium-generated-tests/1.0.1/");
      TimeUnit.SECONDS.sleep(2);
      WebElement btnDownload = driver.findElement(By.xpath(".//a[text()='" + FILENAME + "']"));
      btnDownload.click();
      TimeUnit.SECONDS.sleep(5);
    } finally {
      File baseDir = new File(tmpDir.getAbsolutePath() + "/.cache/selenium/downloads/");
      File[] subDirs = Optional.ofNullable(baseDir.listFiles(File::isDirectory)).orElse(new File[0]);
      assertThat(subDirs)
        .withFailMessage("We should have had at-least 1 downloads folder")
        .isNotEmpty();
      File subDir = subDirs[0];
      File[] files = Optional.ofNullable(subDir.listFiles()).orElse(new File[0]);
      try {
        assertThat(files).isNotEmpty();
        assertThat(files[0].getName()).isEqualTo(FILENAME);
      } finally {
        driver.quit();
      }
    }
  }

  @SuppressWarnings("unchecked")
  private Capabilities appendPrefs(Capabilities original, Map<String, Serializable> map) {
    Capabilities caps = ImmutableCapabilities.copyOf(original);
    Map<String, Object> currentOptions = (Map<String, Object>) Optional.ofNullable(
        caps.getCapability("goog:chromeOptions"))
      .orElse(new HashMap<>());
    Map<String, Object> changed = new HashMap<>(currentOptions);

    ((Map<String, Serializable>)changed.computeIfAbsent("prefs",k -> new HashMap<>())).putAll(map);
    return caps;
  }

}
