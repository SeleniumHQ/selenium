package org.openqa.selenium.internal;

import junit.framework.TestCase;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class ZipTest extends TestCase {
  private File inputDir;
  private File outputDir;
  private Zip zip;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    inputDir = TemporaryFilesystem.createTempDir("input", "ziptest");
    outputDir = TemporaryFilesystem.createTempDir("output", "ziptest");

    zip = new Zip();
  }

  @Override
  protected void tearDown() throws Exception {
    TemporaryFilesystem.deleteTemporaryFiles();

    super.tearDown();
  }

  public void testShouldCreateAZipWithASingleEntry() throws IOException {
    touch(new File(inputDir, "example.txt"));

    File output = new File(outputDir, "my.zip");
    zip.zip(inputDir, output);

    assertTrue(output.exists());
    assertZipContains(output, "example.txt");
  }

  public void testShouldZipUpASingleSubDirectory() throws IOException {
    touch(new File(inputDir, "subdir/example.txt"));

    File output = new File(outputDir, "subdir.zip");
    zip.zip(inputDir, output);

    assertTrue(output.exists());
    assertZipContains(output, "subdir/example.txt");
  }

  public void testShouldZipMultipleDirectories() throws IOException {
    touch(new File(inputDir, "subdir/example.txt"));
    touch(new File(inputDir, "subdir2/fishy/food.txt"));

    File output = new File(outputDir, "subdir.zip");
    zip.zip(inputDir, output);

    assertTrue(output.exists());
    assertZipContains(output, "subdir/example.txt");
    assertZipContains(output, "subdir2/fishy/food.txt");
  }

  public void testCanUnzipASingleEntry() throws IOException {
    File source = FileHandler.locateInProject(
        "common/test/java/org/openqa/selenium/internal/single-file.zip");

    zip.unzip(source, outputDir);

    assertTrue(new File(outputDir, "example.txt").exists());
  }

  public void testCanUnzipAComplexZip() throws IOException {
    File source = FileHandler.locateInProject(
        "common/test/java/org/openqa/selenium/internal/subfolders.zip");

    zip.unzip(source, outputDir);

    assertTrue(new File(outputDir, "example.txt").exists());
    assertTrue(new File(outputDir, "subdir/foodyfun.txt").exists());
  }

  public void testWillNotOverwriteAnExistingZip() throws IOException {
    try {
      zip.zip(inputDir, outputDir);
      fail("Should have thrown an exception");
    } catch (IOException e) {
      assertTrue(e.getMessage(), e.getMessage().contains("already exists"));
    }
  }

  private void assertZipContains(File output, String s) throws IOException {
    FileInputStream fis = new FileInputStream(output);
    ZipInputStream zis = new ZipInputStream(fis);
    ZipEntry entry;
    while ((entry = zis.getNextEntry()) != null) {
      if (s.equals(entry.getName().replaceAll("\\\\", "/"))) {
        return;
      }
    }

    fail("File not in zip: " + s);
  }

  private void touch(File file) throws IOException {
    File parent = file.getParentFile();
    if (!parent.exists()) {
      assertTrue(parent.mkdirs());
    }
    FileOutputStream fos = new FileOutputStream(file);
    fos.write("".getBytes());
    Cleanly.close(fos);

    assertTrue(file.exists());
  }
}
