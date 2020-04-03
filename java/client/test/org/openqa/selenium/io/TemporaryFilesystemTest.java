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

import org.junit.Assume;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriverException;

import java.io.File;
import java.io.IOException;

public class TemporaryFilesystemTest {
  private TemporaryFilesystem tmpFs;

  @Before
  public void setUp() {
    File baseForTest = new File(System.getProperty("java.io.tmpdir"), "tmpTest");
    baseForTest.mkdir();

    tmpFs = TemporaryFilesystem.getTmpFsBasedOn(baseForTest);
  }

  @Test
  public void testCanCreateTempFiles() {
    File tmp = tmpFs.createTempDir("TemporaryFilesystem", "canCreate");
    try {
      assertThat(tmp).exists();
    } catch (WebDriverException e) {
      tmp.delete();
      throw e;
    }
  }

  @Test
  public void testFilesystemCleanupDeletesDirs() {
    Assume.assumeTrue("Reaping of files disabled", tmpFs.shouldReap());

    File tmp = tmpFs.createTempDir("TemporaryFilesystem", "fcdd");
    assertThat(tmp).exists();

    tmpFs.deleteTemporaryFiles();
    assertThat(tmp).doesNotExist();
  }

  @Test
  public void testFilesystemCleanupDeletesRecursive() throws IOException {
    Assume.assumeTrue("Reaping of files disabled", tmpFs.shouldReap());

    File tmp = tmpFs.createTempDir("TemporaryFilesystem", "fcdr");
    createDummyFilesystemContent(tmp);

    tmpFs.deleteTemporaryFiles();
    assertThat(tmp).doesNotExist();
  }

  @Test
  public void testSpecificDeleteRequestHonored() throws IOException {
    Assume.assumeTrue("Reaping of files disabled", tmpFs.shouldReap());

    File tmp = tmpFs.createTempDir("TemporaryFilesystem", "sdrh");
    createDummyFilesystemContent(tmp);

    tmpFs.deleteTempDir(tmp);

    assertThat(tmp).doesNotExist();
  }

  @Test
  public void testDoesNotDeleteArbitraryFiles() throws IOException {
    File tempFile = File.createTempFile("TemporaryFilesystem", "dndaf");
    assertThat(tempFile).exists();
    try {
      tmpFs.deleteTempDir(tempFile);
      assertThat(tempFile).exists();
    } finally {
      tempFile.delete();
    }
  }

  @Test
  public void testShouldDeleteTempDir() {
    final File tempDir = tmpFs.createTempDir("foo", "bar");
    assertThat(tempDir).exists();
    tmpFs.deleteTemporaryFiles();
    tmpFs.deleteBaseDir();
    assertThat(tempDir).doesNotExist();
  }

  @Test
  public void testShouldBeAbleToModifyDefaultInstance() throws IOException {
    // Create a temp file *outside* of the directory owned by the current
    // TemporaryFilesystem instance.
    File otherTempDir = File.createTempFile("TemporaryFilesystem", "NewDir");
    otherTempDir.delete();
    String otherTempDirPath = otherTempDir.getAbsolutePath();

    if (!otherTempDir.mkdirs()) {
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

    assertThat(isInOtherDir).isTrue();
  }

  private void createDummyFilesystemContent(File dir) throws IOException {
    assertThat(dir.isDirectory()).isTrue();
    File.createTempFile("cleanup", "file", dir);
    File childDir = new File(dir, "child");
    childDir.mkdir();
    File.createTempFile("cleanup", "childFile", childDir);
  }
}
