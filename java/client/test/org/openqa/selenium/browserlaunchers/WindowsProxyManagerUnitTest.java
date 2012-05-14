/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.browserlaunchers;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.io.TemporaryFilesystem;

import java.io.File;
import java.io.IOException;

public class WindowsProxyManagerUnitTest {

  @Test
  public void testDeleteFlatDirContentsWithNoSuffix() throws IOException {
    File srcDir = makeSourceDirAndCookie("testcookie");
    WindowsProxyManager.deleteFlatDirContents(srcDir, null);
    assertTrue(srcDir.exists());
    File[] files = srcDir.listFiles();
    assertEquals(0, files.length);
    FileHandler.delete(srcDir);
    assertFalse(srcDir.exists());
  }

  @Test
  public void testDeleteFlatDirContentsWithSuffix() throws IOException {
    File srcDir = makeSourceDirAndCookie("testcookie");
    WindowsProxyManager.deleteFlatDirContents(srcDir, "nomatch");
    assertTrue(srcDir.exists());
    File[] files = srcDir.listFiles();
    assertEquals(1, files.length);
    FileHandler.delete(srcDir);
    assertFalse(srcDir.exists());
  }

  @Test
  public void testDeleteFlatDirContentsWithNoSuchDir() {
    File tempDir = new File(System.getProperty("java.io.tmpdir"));
    File srcDir = new File(tempDir, "rc-wpmt-src");
    assertFalse(srcDir.exists());
    WindowsProxyManager.deleteFlatDirContents(srcDir, null);
    assertFalse(srcDir.exists());
  }

  @Test
  public void testHidePreexistingCookiesNoDestDirNoSuffix() throws IOException {
    File srcDir = makeSourceDirAndCookie("testcookie");
    File destDir = getNonexistentDir();
    WindowsProxyManager.hideCookies(srcDir, null, destDir);
    assertTrue(srcDir.exists());
    assertTrue(destDir.exists());
    assertEquals(1, destDir.listFiles().length);
    assertEquals(0, srcDir.listFiles().length);
    FileHandler.delete(srcDir);
    assertFalse(srcDir.exists());
    FileHandler.delete(destDir);
    assertFalse(destDir.exists());
  }

  @Test
  public void testHidePreexistingCookiesWithDestDirNoSuffix() throws IOException {
    File srcDir = makeSourceDirAndCookie("testcookie");
    File destDir = getNonexistentDir();

    assertTrue(destDir.mkdirs());
    File lostCookieFile = File.createTempFile("lostcookie",
        WindowsProxyManager.COOKIE_SUFFIX, destDir);
    lostCookieFile.deleteOnExit();
    assertTrue(lostCookieFile.exists());

    WindowsProxyManager.hideCookies(srcDir, null, destDir);

    assertTrue(srcDir.exists());
    assertTrue(destDir.exists());
    assertEquals(1, destDir.listFiles().length);
    assertEquals(0, srcDir.listFiles().length);

    FileHandler.delete(srcDir);
    assertFalse(srcDir.exists());
    FileHandler.delete(destDir);
    assertFalse(destDir.exists());
  }

  @Test
  public void testRestorePreexistingCookiesNoSuffix() throws IOException {
    File hiddenDir = makeSourceDirAndCookie("hiddencookie");
    File cookieDir = getNonexistentDir();

    WindowsProxyManager.restoreCookies(cookieDir, null, hiddenDir);

    assertFalse(hiddenDir.exists());
    assertTrue(cookieDir.exists());
    assertEquals(1, cookieDir.listFiles().length);

    FileHandler.delete(cookieDir);
    assertFalse(cookieDir.exists());
    FileHandler.delete(hiddenDir);
    assertFalse(hiddenDir.exists());
  }

  @Test
  public void testHidePreexistingCookiesNoDestDirWithSuffix() throws IOException {
    File srcDir = makeSourceDirAndCookie("testcookie");
    File destDir = getNonexistentDir();

    WindowsProxyManager.hideCookies(srcDir,
        WindowsProxyManager.COOKIE_SUFFIX, destDir);

    assertTrue(srcDir.exists());
    assertTrue(destDir.exists());
    assertEquals(1, destDir.listFiles().length);

    FileHandler.delete(srcDir);
    assertFalse(srcDir.exists());
    FileHandler.delete(destDir);
    assertFalse(destDir.exists());
  }

  private File makeSourceDirAndCookie(String cookiePrefix) throws IOException {
    File tempDir = new File(System.getProperty("java.io.tmpdir"));
    File srcDir = new File(tempDir, "rc-wpmt-src");
    srcDir.deleteOnExit();
    srcDir.mkdir();
    assertTrue(srcDir.exists());
    File cookieFile = File.createTempFile(cookiePrefix,
        WindowsProxyManager.COOKIE_SUFFIX, srcDir);
    cookieFile.deleteOnExit();
    assertTrue(cookieFile.exists());
    return srcDir;
  }

  private File getNonexistentDir() {
    File destDir = TemporaryFilesystem.getDefaultTmpFS().createTempDir("rc-wpmt-dest", "tmp");
    destDir.delete();
    assertFalse(destDir.exists());
    return destDir;
  }
}
