package org.openqa.selenium.server.browserlaunchers;

import junit.framework.TestCase;

import java.io.File;
import java.io.IOException;

public class WindowsProxyManagerTest extends TestCase {
  
  public void testHidePreexistingCookiesNoDestDir() throws IOException {
    File tempDir = new File(System.getProperty("java.io.tmpdir"));
    
    File srcDir = new File(tempDir, "rc-wpmt-src");
    srcDir.deleteOnExit();
    assertTrue(srcDir.mkdir());
    File cookieFile = File.createTempFile("testcookie", "tmp", srcDir);
    cookieFile.deleteOnExit();
    assertTrue(cookieFile.exists());
    String cookieFileName = cookieFile.getName();
    
    File destDir = new File(tempDir, "rc-wpmt-dest");
    destDir.deleteOnExit();
    assertFalse(destDir.exists());
    
    WindowsProxyManager.hidePreexistingCookies(srcDir, destDir);
    
    assertTrue(srcDir.exists());
    assertTrue(destDir.exists());
    File newCookieFile = new File(destDir, cookieFileName);
    newCookieFile.deleteOnExit();
    assertTrue(newCookieFile.exists());
    
    newCookieFile.delete();
    destDir.delete();
    srcDir.delete();
  }
  
  public void testHidePreexistingCookiesWithDestDir() throws IOException {
    File tempDir = new File(System.getProperty("java.io.tmpdir"));
    
    File srcDir = new File(tempDir, "rc-wpmt-src");
    srcDir.deleteOnExit();
    assertTrue(srcDir.mkdir());
    File cookieFile = File.createTempFile("testcookie", "tmp", srcDir);
    cookieFile.deleteOnExit();
    assertTrue(cookieFile.exists());
    String cookieFileName = cookieFile.getName();
    
    File destDir = new File(tempDir, "rc-wpmt-dest");
    destDir.deleteOnExit();
    assertTrue(destDir.mkdir());
    File lostCookieFile = File.createTempFile("lostcookie", "tmp", destDir);
    lostCookieFile.deleteOnExit();
    assertTrue(lostCookieFile.exists());
    
    WindowsProxyManager.hidePreexistingCookies(srcDir, destDir);
    
    assertTrue(srcDir.exists());
    assertTrue(destDir.exists());
    File newCookieFile = new File(destDir, cookieFileName);
    newCookieFile.deleteOnExit();
    assertTrue(newCookieFile.exists());
    assertFalse(lostCookieFile.exists());
    
    newCookieFile.delete();
    destDir.delete();
    srcDir.delete();
  }
  
  public void testRestorePreexistingCookies() throws IOException {
    File tempDir = new File(System.getProperty("java.io.tmpdir"));
    
    File hiddenDir = new File(tempDir, "rc-wpmt-hidden");
    hiddenDir.deleteOnExit();
    assertTrue(hiddenDir.mkdir());
    File cookieFile = File.createTempFile("hiddencookie", "tmp", hiddenDir);
    cookieFile.deleteOnExit();
    assertTrue(cookieFile.exists());
    String cookieFileName = cookieFile.getName();
    
    File cookieDir = new File(tempDir, "rc-wpmt-cookies");
    cookieDir.deleteOnExit();
    assertFalse(cookieDir.exists());
    
    WindowsProxyManager.restorePreexistingCookies(cookieDir, hiddenDir);
    
    assertFalse(hiddenDir.exists());
    assertTrue(cookieDir.exists());
    File newCookieFile = new File(cookieDir, cookieFileName);
    newCookieFile.deleteOnExit();
    assertTrue(newCookieFile.exists());
    
    newCookieFile.delete();
    cookieDir.delete();
  }
  
}
