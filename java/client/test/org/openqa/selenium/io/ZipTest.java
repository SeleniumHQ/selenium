package org.openqa.selenium.io;

import com.google.common.io.Closeables;

import org.openqa.selenium.internal.InProject;

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
  private TemporaryFilesystem tmpFs;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    File baseForTest = new File(System.getProperty("java.io.tmpdir"), "tmpTest");
    baseForTest.mkdir();
    tmpFs = TemporaryFilesystem.getTmpFsBasedOn(baseForTest);

    inputDir = tmpFs.createTempDir("input", "ziptest");
    outputDir = tmpFs.createTempDir("output", "ziptest");

    zip = new Zip();
  }

  @Override
  protected void tearDown() throws Exception {
    tmpFs.deleteTemporaryFiles();

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
    File source = InProject.locate(
        "java/client/test/org/openqa/selenium/internal/single-file.zip");

    zip.unzip(source, outputDir);

    assertTrue(new File(outputDir, "example.txt").exists());
  }

  public void testCanUnzipAComplexZip() throws IOException {
    File source = InProject.locate(
        "java/client/test/org/openqa/selenium/internal/subfolders.zip");

    zip.unzip(source, outputDir);

    assertTrue(new File(outputDir, "example.txt").exists());
    assertTrue(new File(outputDir, "subdir/foodyfun.txt").exists());
  }

  public void testWillNotOverwriteAnExistingZip() {
    try {
      zip.zip(inputDir, outputDir);
      fail("Should have thrown an exception");
    } catch (IOException e) {
      assertTrue(e.getMessage(), e.getMessage().contains("already exists"));
    }
  }

  public void testCanZipASingleFile() throws IOException {
    File input = new File(inputDir, "foo.txt");
    File unwanted = new File(inputDir, "nay.txt");
    touch(input);
    touch(unwanted);

    String zipped = zip.zipFile(inputDir, input);

    zip.unzip(zipped, outputDir);
    File unzipped = new File(outputDir, "foo.txt");
    File notThere = new File(outputDir, "nay.txt");

    assertTrue(unzipped.exists());
    assertFalse(notThere.exists());
  }

  public void testZippingASingleFileWillThrowIfInputIsNotAFile() throws IOException {
    try {
      zip.zipFile(inputDir.getParentFile(), inputDir);
      fail("Should have failed");
    } catch (IllegalArgumentException ignored) {
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
    Closeables.closeQuietly(fos);

    assertTrue(file.exists());
  }
}
