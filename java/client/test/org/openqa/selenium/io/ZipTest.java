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

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Random;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class ZipTest {
  private File inputDir;
  private File outputDir;
  private TemporaryFilesystem tmpFs;

  @Before
  public void setUp() {
    File baseForTest = new File(System.getProperty("java.io.tmpdir"), "tmpTest");
    baseForTest.mkdir();
    tmpFs = TemporaryFilesystem.getTmpFsBasedOn(baseForTest);

    inputDir = tmpFs.createTempDir("input", "ziptest");
    outputDir = tmpFs.createTempDir("output", "ziptest");
  }

  @After
  public void tearDown() {
    tmpFs.deleteTemporaryFiles();
  }

  @Test
  public void testCanZipASingleFile() throws IOException {
    File input = new File(inputDir, "foo.txt");
    File unwanted = new File(inputDir, "nay.txt");
    writeTestFile(input);
    writeTestFile(unwanted);

    String zipped = Zip.zip(input);

    Zip.unzip(zipped, outputDir);
    File unzipped = new File(outputDir, "foo.txt");
    File notThere = new File(outputDir, "nay.txt");

    assertThat(unzipped).exists();
    assertThat(notThere).doesNotExist();
  }

  @Test
  public void testCanZipADirectory() throws IOException {
    File input1 = new File(inputDir, "foo.txt");
    File input2 = new File(inputDir, "bar/bar.txt");
    writeTestFile(input1);
    writeTestFile(input2);

    String zipped = Zip.zip(inputDir);

    Zip.unzip(zipped, outputDir);
    File unzipped1 = new File(outputDir, "foo.txt");
    File unzipped2 = new File(outputDir, "bar/bar.txt");

    assertThat(unzipped1).exists();
    assertThat(unzipped2).exists();
  }

  @Test
  public void testCanUnzip() throws IOException {
    File testZip = File.createTempFile("testUnzip", "zip");
    writeTestZip(testZip, 25);
    File out = Zip.unzipToTempDir(new FileInputStream(testZip), "unzip", "stream");
    assertThat(out.list()).hasSize(25);
  }

  private File writeTestZip(File file, int files) throws IOException {
    ZipOutputStream out = new ZipOutputStream(new FileOutputStream(file));
    for (int i = 0; i < files; i++) {
      writeTestZipEntry(out);
    }
    out.close();
    file.deleteOnExit();
    return file;
  }

  private void writeTestZipEntry(ZipOutputStream out) throws IOException {
    File testFile = File.createTempFile("testZip", "file");
    writeTestFile(testFile);
    ZipEntry entry = new ZipEntry(testFile.getName());
    out.putNextEntry(entry);
    try (FileInputStream in = new FileInputStream(testFile)) {
      byte[] buffer = new byte[16384];
      while (in.read(buffer, 0, 16384) != -1) {
        out.write(buffer);
      }
    }
    out.flush();
  }

  private void writeTestFile(File file) throws IOException {
    File parent = file.getParentFile();
    if (!parent.exists()) {
      assertThat(parent.mkdirs()).isTrue();
    }
    byte[] byteArray = new byte[16384];
    new Random().nextBytes(byteArray);
    try (OutputStream out = new FileOutputStream(file)) {
      out.write(byteArray);
    }
    file.deleteOnExit();
  }
}
