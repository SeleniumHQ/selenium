package org.openqa.selenium.io;

import junit.framework.TestCase;

import org.junit.Test;
import org.openqa.selenium.WebDriverException;

import java.io.File;
import java.io.IOException;

public class TemporaryFilesystemTest extends TestCase {
  private TemporaryFilesystem tmpFs;

  @Override
  protected void setUp() throws Exception {
    super.setUp();
    
    File baseForTest = new File(System.getProperty("java.io.tmpdir"),  "tmpTest");
    baseForTest.mkdir();

    tmpFs = TemporaryFilesystem.getTmpFsBasedOn(baseForTest.getAbsolutePath());
  }

  @Test
  public void testCanCreateTempFiles() {
    File tmp = tmpFs.createTempDir("TemporaryFilesystem", "canCreate");
    try {
      assertTrue(tmp.exists());
    } catch (WebDriverException e) {
      tmp.delete();
      throw e;
    }
  }

  @Test
  public void testFilesystemCleanupDeletesDirs() {
    if (!tmpFs.shouldReap()) {
      System.out.println("Reaping of files disabled - " +
                         "ignoring testFilesystemCleanupDeletesDirs");
      return;
    }
    File tmp = tmpFs.createTempDir("TemporaryFilesystem", "fcdd");
    assertTrue(tmp.exists());

    tmpFs.deleteTemporaryFiles();
    assertFalse(tmp.exists());
  }

  @Test
  public void testFilesystemCleanupDeletesRecursive() throws IOException {
    if (!tmpFs.shouldReap()) {
      System.out.println("Reaping of files disabled - " +
                         "ignoring testFilesystemCleanupDeletesRecursive");
      return;
    }
    File tmp = tmpFs.createTempDir("TemporaryFilesystem", "fcdr");
    createDummyFilesystemContent(tmp);

    tmpFs.deleteTemporaryFiles();
    assertFalse(tmp.exists());
  }

  @Test
  public void testSpecificDeleteRequestHonored() throws IOException {
    if (!tmpFs.shouldReap()) {
      System.out.println("Reaping of files disabled - " +
                         "ignoring testSpecificDeleteRequestHonored");
      return;
    }
    File tmp = tmpFs.createTempDir("TemporaryFilesystem", "sdrh");
    createDummyFilesystemContent(tmp);

    tmpFs.deleteTempDir(tmp);

    assertFalse(tmp.exists());
  }

  @Test
  public void testDoesNotDeleteArbitraryFiles() throws IOException {
    File tempFile = File.createTempFile("TemporaryFilesystem", "dndaf");
    assertTrue(tempFile.exists());
    try {
      tmpFs.deleteTempDir(tempFile);
      assertTrue(tempFile.exists());
    } finally {
      tempFile.delete();
    }
  }

  @Test
  public void testShouldReapDefaultsTrue() {
    if (!tmpFs.shouldReap()) {
      System.out.println("Reaping of files disabled - " +
                         "ignoring testShouldReapDefaultsTrue");
      return;
    }
    
    assertTrue(tmpFs.shouldReap());
  }

  @Test
  public void testShouldBeAbleToModifyDefaultInstance() throws IOException {
    // Create a temp file *outside* of the directory owned by the current
    // TemporaryFilesystem instance.
    File otherTempDir = File.createTempFile("TemporaryFilesystem", "NewDir");
    otherTempDir.delete();
    String otherTempDirPath = otherTempDir.getAbsolutePath();

    if (! otherTempDir.mkdirs()) {
      throw new RuntimeException("Error creating other temporary directory: " +
          otherTempDirPath);
    }

    TemporaryFilesystem.setTemporaryDirectory(otherTempDir);

    // Now create a file in the default instance, which should point to the temporary
    // directory just specified.
    File createdDir = TemporaryFilesystem.getDefaultTmpFS().createTempDir("xzy", "zzyip");
    boolean isInOtherDir = createdDir.getAbsolutePath().startsWith(otherTempDirPath);

    // Cleanup - rid of the temporary directory and the directory containing it.
    TemporaryFilesystem.getDefaultTmpFS().deleteTemporaryFiles();
    otherTempDir.delete();

    // Reset to the default dir
    TemporaryFilesystem.setTemporaryDirectory(new File(System.getProperty("java.io.tmpdir")));

    assertTrue("Directory should have been created in the provided temp dir.", isInOtherDir);
  }

  private void createDummyFilesystemContent(File dir) throws IOException {
    assertTrue(dir.isDirectory());
    File.createTempFile("cleanup", "file", dir);
    File childDir = new File(dir, "child");
    childDir.mkdir();
    File.createTempFile("cleanup", "childFile", childDir);
  }
}
