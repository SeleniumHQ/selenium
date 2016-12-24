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

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

@RunWith(JUnit4.class)
public class ZipTest {
  private File inputDir;
  private File outputDir;
  private TemporaryFilesystem tmpFs;

  @Before
  public void setUp() throws Exception {
    File baseForTest = new File(System.getProperty("java.io.tmpdir"), "tmpTest");
    baseForTest.mkdir();
    tmpFs = TemporaryFilesystem.getTmpFsBasedOn(baseForTest);

    inputDir = tmpFs.createTempDir("input", "ziptest");
    outputDir = tmpFs.createTempDir("output", "ziptest");
  }

  @After
  public void tearDown() throws Exception {
    tmpFs.deleteTemporaryFiles();
  }

  @Test
  public void testCanZipASingleFile() throws IOException {
    File input = new File(inputDir, "foo.txt");
    File unwanted = new File(inputDir, "nay.txt");
    touch(input);
    touch(unwanted);

    String zipped = Zip.zip(input);

    Zip.unzip(zipped, outputDir);
    File unzipped = new File(outputDir, "foo.txt");
    File notThere = new File(outputDir, "nay.txt");

    assertTrue(unzipped.exists());
    assertFalse(notThere.exists());
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
