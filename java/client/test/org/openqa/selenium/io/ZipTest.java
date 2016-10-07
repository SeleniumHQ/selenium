// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


package org.openqa.selenium.io;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.testing.InProject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@RunWith(JUnit4.class)
public class ZipTest {
  private File inputDir;
  private File outputDir;
  private Zip zip;
  private TemporaryFilesystem tmpFs;

  @Before
  public void setUp() throws Exception {
    File baseForTest = new File(System.getProperty("java.io.tmpdir"), "tmpTest");
    baseForTest.mkdir();
    tmpFs = TemporaryFilesystem.getTmpFsBasedOn(baseForTest);

    inputDir = tmpFs.createTempDir("input", "ziptest");
    outputDir = tmpFs.createTempDir("output", "ziptest");

    zip = new Zip();
  }

  @After
  public void tearDown() throws Exception {
    tmpFs.deleteTemporaryFiles();
  }

  @Test
  public void testShouldCreateAZipWithASingleEntry() throws IOException {
    touch(new File(inputDir, "example.txt"));

    File output = new File(outputDir, "my.zip");
    zip.zip(inputDir, output);

    assertTrue(output.exists());
    assertZipContains(output, "example.txt");
  }

  @Test
  public void testShouldZipUpASingleSubDirectory() throws IOException {
    touch(new File(inputDir, "subdir/example.txt"));

    File output = new File(outputDir, "subdir.zip");
    zip.zip(inputDir, output);

    assertTrue(output.exists());
    assertZipContains(output, "subdir/example.txt");
  }

  @Test
  public void testShouldZipMultipleDirectories() throws IOException {
    touch(new File(inputDir, "subdir/example.txt"));
    touch(new File(inputDir, "subdir2/fishy/food.txt"));

    File output = new File(outputDir, "subdir.zip");
    zip.zip(inputDir, output);

    assertTrue(output.exists());
    assertZipContains(output, "subdir/example.txt");
    assertZipContains(output, "subdir2/fishy/food.txt");
  }

  @Test
  public void testCanUnzipASingleEntry() throws IOException {
    Path source = InProject.locate(
        "java/client/test/org/openqa/selenium/internal/single-file.zip");

    zip.unzip(source.toFile(), outputDir);

    assertTrue(new File(outputDir, "example.txt").exists());
  }

  @Test
  public void testCanUnzipAComplexZip() throws IOException {
    Path source = InProject.locate(
        "java/client/test/org/openqa/selenium/internal/subfolders.zip");

    zip.unzip(source.toFile(), outputDir);

    assertTrue(new File(outputDir, "example.txt").exists());
    assertTrue(new File(outputDir, "subdir/foodyfun.txt").exists());
  }

  @Test
  public void testWillNotOverwriteAnExistingZip() {
    try {
      zip.zip(inputDir, outputDir);
      fail("Should have thrown an exception");
    } catch (IOException e) {
      assertTrue(e.getMessage(), e.getMessage().contains("already exists"));
    }
  }

  @Test
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

  @Test
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
    try {
      ZipEntry entry;
      while ((entry = zis.getNextEntry()) != null) {
        if (s.equals(entry.getName().replaceAll("\\\\", "/"))) {
          return;
        }
      }
    } finally {
      zis.close();
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
    fos.close();

    assertTrue(file.exists());
  }
}
