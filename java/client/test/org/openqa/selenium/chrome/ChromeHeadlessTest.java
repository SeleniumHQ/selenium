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
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
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
    driver.sendCommandForDownloadChromeHeadless(downloadFilePath);

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
    driver.sendCommandForDownloadChromeHeadless(downloadFilePath);

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
