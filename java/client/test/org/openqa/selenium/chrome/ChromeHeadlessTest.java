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

package org.openqa.selenium.chrome;

import static org.junit.Assert.assertTrue;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.environment.webserver.Page;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Random;

public class ChromeHeadlessTest extends JUnit4TestBase {

  private File forDownloading;
  private File downloaded;
  private File fileForDownloading;
  private TemporaryFilesystem tmpFs;

  @Before
  public void setUp() throws Exception {
    File baseForTest = new File(System.getProperty("java.io.tmpdir"), "tmpTest");
    baseForTest.mkdir();
    tmpFs = TemporaryFilesystem.getTmpFsBasedOn(baseForTest);

    forDownloading = tmpFs.createTempDir("forDownloading", "headless");
    downloaded = tmpFs.createTempDir("downloaded", "headless");

    fileForDownloading = new File(forDownloading, "fileForDownloading.txt");
    writeTestFile(fileForDownloading);
  }

  private void writeTestFile(File file) throws IOException {
    File parent = file.getParentFile();
    if (!parent.exists()) {
      assertTrue(parent.mkdirs());
    }
    byte[] byteArray = new byte[16];
    new Random().nextBytes(byteArray);
    try (OutputStream out = new FileOutputStream(file)) {
      out.write(byteArray);
    }
    file.deleteOnExit();
  }

  @After
  public void tearDown() throws Exception {
    tmpFs.deleteTemporaryFiles();
    if (driver != null) {
      driver.quit();
    }
  }

  @Test
  public void canStartChromeWithCustomOptions_Headless() {
    String downloadFilePathath = downloaded.getAbsolutePath();

    HashMap<String, Object> chromePrefs = new HashMap<String, Object>();
    chromePrefs.put("profile.default_content_settings.popups", 0);
    chromePrefs.put("download.default_directory", downloadFilePathath);
    ChromeOptions options = new ChromeOptions();
    HashMap<String, Object> chromeOptionsMap = new HashMap<String, Object>();
    options.setExperimentalOption("prefs", chromePrefs);
    options.addArguments("--test-type");
    options.addArguments("--disable-extensions"); //to disable browser extension popup
    options.addArguments("--headless");

    DesiredCapabilities cap = DesiredCapabilities.chrome();
    cap.setCapability(ChromeOptions.CAPABILITY, chromeOptionsMap);
    cap.setCapability(CapabilityType.ACCEPT_SSL_CERTS, true);
    cap.setCapability(ChromeOptions.CAPABILITY, options);
    ChromeDriver driver = new ChromeDriver(cap);

    driver.sendCommandForDownloadChromeHeadLess(downloadFilePathath);

    driver.get("https://chromedriver.storage.googleapis.com/index.html?path=2.34/");
    (new WebDriverWait(driver, 20))
        .until(ExpectedConditions
                   .presenceOfElementLocated(By.xpath("//a[text()='chromedriver_win32.zip']")))
        .click();

    try {
      Thread.sleep(20000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }

  private String createDownloadingPage() {
    String pathToDownloading = fileForDownloading.getAbsolutePath();
    return appServer.create(new Page()
                                .withTitle("Download")
                                .withBody("<a href=\"" + pathToDownloading + "\" "
                                          + "download=\"file to download\">Download</a>"));
  }

  @Test
  public void canDownloadInHeadlessMode() {
    String downloadFilePath = downloaded.getAbsolutePath();

    ChromeOptions options = new ChromeOptions();
    options.addArguments("--headless");

    DesiredCapabilities cap = DesiredCapabilities.chrome();
    cap.setCapability(ChromeOptions.CAPABILITY, options);
    ChromeDriver driver = new ChromeDriver(cap);
    driver.sendCommandForDownloadChromeHeadLess(downloadFilePath);

    driver.get(createDownloadingPage());

    driver.findElement(By.tagName("a")).click();

    try {
      Thread.sleep(2000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

    assertTrue("Downloaded file should be present",
               new File(downloadFilePath + "\\fileForDownloading.txt").exists());
  }

  @Test
  public void canDownloadInHeadlessModeCommand() {
    String downloadFilePath = downloaded.getAbsolutePath();

    ChromeOptions options = new ChromeOptions();
    options.setHeadless(true);

    ChromeDriver driver = new ChromeDriver(options);
    driver.sendCommandForDownloadChromeHeadLess(downloadFilePath);

    driver.get(createDownloadingPage());

    driver.findElement(By.tagName("a")).click();

    try {
      Thread.sleep(2000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

    assertTrue("Downloaded file should be present",
               new File(downloadFilePath + "\\fileForDownloading.txt").exists());
  }

  @Test
  public void canDownloadInHeadlessModeOption() {
    String downloadFilePath = downloaded.getAbsolutePath();

    ChromeOptions options = new ChromeOptions();
    options.setHeadless(true);
    options.setEnableDownloading(true, downloadFilePath);

    ChromeDriver driver = new ChromeDriver(options);

    driver.get(createDownloadingPage());

    driver.findElement(By.tagName("a")).click();

    try {
      Thread.sleep(2000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

    assertTrue("Downloaded file should be present",
               new File(downloadFilePath + "\\fileForDownloading.txt").exists());
  }


}
