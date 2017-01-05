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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Random;

@RunWith(JUnit4.class)
public class FileHandlerTest {

  @Test
  public void testFileCopy() throws IOException {
    File newFile = File.createTempFile("testFileCopy", "dst");
    File tmpFile = writeTestFile(File.createTempFile("FileUtilTest", "src"));
    assertTrue(newFile.length() == 0);
    assertTrue(tmpFile.length() > 0);

    try {
      // Copy it.
      FileHandler.copy(tmpFile, newFile);

      assertEquals(tmpFile.length(), newFile.length());
    } finally {
      tmpFile.delete();
      newFile.delete();
    }
  }

  private File writeTestFile(File file) throws IOException {
    byte[] byteArray = new byte[16384];
    new Random().nextBytes(byteArray);
    OutputStream out = new FileOutputStream(file);
    out.write(byteArray);
    out.close();
    file.deleteOnExit();
    return file;
  }
}
