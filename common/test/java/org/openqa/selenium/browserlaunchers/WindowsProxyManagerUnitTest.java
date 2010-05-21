package org.openqa.selenium.browserlaunchers;

import junit.framework.TestCase;

import java.io.File;
import java.io.IOException;

import org.openqa.selenium.browserlaunchers.WindowsProxyManager;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.internal.TemporaryFilesystem;

public class WindowsProxyManagerUnitTest extends TestCase {
  
  public void testDeleteFlatDirContentsWithNoSuffix() throws IOException {
    File srcDir = makeSourceDirAndCookie("testcookie");
    WindowsProxyManager.deleteFlatDirContents(srcDir, null);
    assertTrue(srcDir.exists());
    File[] files = srcDir.listFiles();
    assertEquals(0, files.length);
    FileHandler.delete(srcDir);
    assertFalse(srcDir.exists());
  }
  
  public void testDeleteFlatDirContentsWithSuffix() throws IOException {
    File srcDir = makeSourceDirAndCookie("testcookie");
    WindowsProxyManager.deleteFlatDirContents(srcDir, "nomatch");
    assertTrue(srcDir.exists());
    File[] files = srcDir.listFiles();
    assertEquals(1, files.length);
    FileHandler.delete(srcDir);
    assertFalse(srcDir.exists());
  }
  
  public void testDeleteFlatDirContentsWithNoSuchDir() {
    File tempDir = new File(System.getProperty("java.io.tmpdir"));
    File srcDir = new File(tempDir, "rc-wpmt-src");
    assertFalse(srcDir.exists());
    WindowsProxyManager.deleteFlatDirContents(srcDir, null);
    assertFalse(srcDir.exists());
  }
  
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
    File destDir = TemporaryFilesystem.createTempDir("rc-wpmt-dest", "tmp");
    destDir.delete();
    assertFalse(destDir.exists());
    return destDir;
  }
}
