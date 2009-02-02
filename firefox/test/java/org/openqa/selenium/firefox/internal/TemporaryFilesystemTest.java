package org.openqa.selenium.firefox.internal;

import junit.framework.TestCase;

import org.junit.Test;

import java.io.File;
import java.io.IOException;

public class TemporaryFilesystemTest extends TestCase {

  @Test
  public void testCanCreateTempFiles() {
    File tmp = TemporaryFilesystem.createTempDir("TemporaryFilesystem", "canCreate");
    try {
      assertTrue(tmp.exists());
    } catch (RuntimeException e) {
      tmp.delete();
      throw e;
    }
  }
  
  @Test
  public void testFilesystemCleanupDeletesDirs() {
    File tmp = TemporaryFilesystem.createTempDir("TemporaryFilesystem", "canDelete");
    assertTrue(tmp.exists());
    TemporaryFilesystem.deleteTemporaryFiles();
    assertFalse(tmp.exists());
  }
  
  @Test
  public void testFilesystemCleanupDeletesRecursive() throws IOException {
    File tmp = TemporaryFilesystem.createTempDir("TemporaryFilesystem", "canDeleteRecurisve");
    assertTrue(tmp.exists());

    File.createTempFile("cleanup", "file", tmp);
    File childDir = new File(tmp, "child");
    childDir.mkdir();
    File.createTempFile("cleanup", "childFile", childDir);
    
    TemporaryFilesystem.deleteTemporaryFiles();
    assertFalse(tmp.exists());
  }
  
  @Test
  public void testSpecificDeleteRequestHonored() {
    File first = TemporaryFilesystem.createTempDir("TemporaryFilesystem", "canDeleteRecurisve");
    File second = TemporaryFilesystem.createTempDir("TemporaryFilesystem", "canDeleteRecurisve");
    assertTrue(first.exists());
    assertTrue(second.exists());

    TemporaryFilesystem.deleteTempDir(first);
    
    assertFalse(first.exists());
    assertTrue(second.exists());
  }
  
  @Test
  public void testDoesNotDeleteArbitraryFiles() throws IOException {
    File tempFile = File.createTempFile("TemporaryFilesystem", "file");
    assertTrue(tempFile.exists());

    TemporaryFilesystem.deleteTempDir(tempFile);
    
    assertTrue(tempFile.exists());
  }
}
