package org.openqa.selenium.server.browserlaunchers;

import junit.framework.TestCase;

import java.io.File;
import java.io.IOException;

public class LauncherUtilsTest extends TestCase {
  
  private static String COOKIE_PREFIX = "testcookie";
  
  public void testCopyDirectoryWithNonMatchingPrefix() throws IOException {
    File srcDir = makeSourceDirAndCookie();
    File destDir = getNonexistentDestDir();
    LauncherUtils.copyDirectory(srcDir, COOKIE_PREFIX + "foo", destDir);
    assertTrue(destDir.exists());
    assertEquals(0, destDir.listFiles().length);
    copyDirectoryCleanUp(srcDir, destDir);
  }
  
  public void testCopyDirecotryWithMatchingPrefix() throws IOException {
    File srcDir = makeSourceDirAndCookie();
    File destDir = getNonexistentDestDir();
    LauncherUtils.copyDirectory(srcDir, COOKIE_PREFIX, destDir);
    assertTrue(destDir.exists());
    assertEquals(1, destDir.listFiles().length);
    copyDirectoryCleanUp(srcDir, destDir);
  }
  
  private File makeSourceDirAndCookie() throws IOException {
    File tempDir = new File(System.getProperty("java.io.tmpdir"));
    File srcDir = new File(tempDir, "rc-wpmt-src");
    srcDir.deleteOnExit();
    assertTrue(srcDir.mkdir());
    File cookieFile = File.createTempFile(COOKIE_PREFIX, "tmp", srcDir);
    cookieFile.deleteOnExit();
    assertTrue(cookieFile.exists());
    return srcDir;
  }
  
  private File getNonexistentDestDir() {
    File tempDir = new File(System.getProperty("java.io.tmpdir"));
    File destDir = new File(tempDir, "rc-wpmt-dest");
    destDir.deleteOnExit();
    assertFalse(destDir.exists());
    return destDir;
  }
  
  public void copyDirectoryCleanUp(File srcDir, File destDir) {
    LauncherUtils.deleteTryTryAgain(srcDir, 1);
    LauncherUtils.deleteTryTryAgain(destDir, 1);
    assertFalse(srcDir.exists());
    assertFalse(destDir.exists());
  }
  
}
