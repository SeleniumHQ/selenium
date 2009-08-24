package org.openqa.selenium.internal;

import junit.framework.TestCase;

import org.junit.Test;
import org.openqa.selenium.Ignore;
import org.openqa.selenium.WebDriverException;

import java.io.File;
import java.io.IOException;

import static org.openqa.selenium.Ignore.Driver.CHROME;

public class TemporaryFilesystemTest extends TestCase {

  @Test
  public void testCanCreateTempFiles() {
    File tmp = TemporaryFilesystem.createTempDir("TemporaryFilesystem", "canCreate");
    try {
      assertTrue(tmp.exists());
    } catch (WebDriverException e) {
      tmp.delete();
      throw e;
    }
  }

  @Test
  @Ignore(CHROME)
  //TODO(danielwh): Find out why these just don't run in Firefox.
  //Maybe add a new @Ignore(UsesTemporaryFiles)
  public void testFilesystemCleanupDeletesDirs() {
    File tmp = TemporaryFilesystem.createTempDir("TemporaryFilesystem", "fcdd");
    assertTrue(tmp.exists());

    TemporaryFilesystem.deleteTemporaryFiles();
    assertFalse(tmp.exists());
  }

  @Test
  @Ignore(CHROME)
  public void testFilesystemCleanupDeletesRecursive() throws IOException {
    File tmp = TemporaryFilesystem.createTempDir("TemporaryFilesystem", "fcdr");
    createDummyFilesystemContent(tmp);

    TemporaryFilesystem.deleteTemporaryFiles();
    assertFalse(tmp.exists());
  }

  @Test
  @Ignore(CHROME)
  public void testSpecificDeleteRequestHonored() throws IOException {
    File tmp = TemporaryFilesystem.createTempDir("TemporaryFilesystem", "sdrh");
    createDummyFilesystemContent(tmp);

    TemporaryFilesystem.deleteTempDir(tmp);

    assertFalse(tmp.exists());
  }

  @Test
  public void testDoesNotDeleteArbitraryFiles() throws IOException {
    File tempFile = File.createTempFile("TemporaryFilesystem", "dndaf");
    assertTrue(tempFile.exists());
    try {
      TemporaryFilesystem.deleteTempDir(tempFile);
      assertTrue(tempFile.exists());
    } finally {
      tempFile.delete();
    }
  }

  @Test
  @Ignore(CHROME)
  public void testShouldReapDefaultsTrue() {
    assertTrue(TemporaryFilesystem.shouldReap());
  }

  private void createDummyFilesystemContent(File dir) throws IOException {
    assertTrue(dir.isDirectory());
    File.createTempFile("cleanup", "file", dir);
    File childDir = new File(dir, "child");
    childDir.mkdir();
    File.createTempFile("cleanup", "childFile", childDir);
  }
}
