package org.openqa.selenium.server.browserlaunchers;

import junit.framework.TestCase;

import java.io.File;
import java.io.IOException;

public class LauncherUtilsTest extends TestCase {
  
  private static String COOKIE_SUFFIX = "txt";
  
  public void testCopyDirectoryWithNonMatchingSuffix() throws IOException {
    File srcDir = makeSourceDirAndCookie();
    File destDir = getNonexistentDestDir();
    LauncherUtils.copyDirectory(srcDir, COOKIE_SUFFIX + "foo", destDir);
    assertTrue(destDir.exists());
    assertEquals(0, destDir.listFiles().length);
    copyDirectoryCleanUp(srcDir, destDir);
  }
  
  public void testCopyDirectoryWithMatchingSuffix() throws IOException {
    File srcDir = makeSourceDirAndCookie();
    File destDir = getNonexistentDestDir();
    LauncherUtils.copyDirectory(srcDir, COOKIE_SUFFIX, destDir);
    assertTrue(destDir.exists());
    assertEquals(1, destDir.listFiles().length);
    copyDirectoryCleanUp(srcDir, destDir);
  }
  
  private File makeSourceDirAndCookie() throws IOException {
    File tempDir = new File(System.getProperty("java.io.tmpdir"));
    File srcDir = new File(tempDir, "rc-lut-src");
    srcDir.deleteOnExit();
    assertTrue(srcDir.mkdir());
    File cookieFile = File.createTempFile("testcookie", COOKIE_SUFFIX, srcDir);
    cookieFile.deleteOnExit();
    assertTrue(cookieFile.exists());
    return srcDir;
  }
  
  private File getNonexistentDestDir() {
    File tempDir = new File(System.getProperty("java.io.tmpdir"));
    File destDir = new File(tempDir, "rc-lut-dest");
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
