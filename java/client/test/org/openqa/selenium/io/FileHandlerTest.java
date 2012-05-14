/*
Copyright 2007-2009 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.io;

import org.junit.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.Writer;
import java.util.Random;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class FileHandlerTest {

  @Test
  public void testUnzip() throws IOException {
    File testZip = writeTestZip(File.createTempFile("testUnzip", "zip"), 25);
    File out = FileHandler.unzip(new FileInputStream(testZip));
    assertEquals(25, out.list().length);
  }

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

  @Test
  public void testFileCopyCanFilterBySuffix() throws IOException {
    File source = TemporaryFilesystem.getDefaultTmpFS().createTempDir("filehandler", "source");
    File textFile = File.createTempFile("example", ".txt", source);
    File xmlFile = File.createTempFile("example", ".xml", source);
    File dest = TemporaryFilesystem.getDefaultTmpFS().createTempDir("filehandler", "dest");

    FileHandler.copy(source, dest, ".txt");

    assertTrue(new File(dest, textFile.getName()).exists());
    assertFalse(new File(dest, xmlFile.getName()).exists());
  }

  @Test
  public void testCanReadFileAsString() throws IOException {
    String expected = "I like cheese. And peas";

    File file = File.createTempFile("read-file", "test");
    Writer writer = new FileWriter(file);
    writer.write(expected);
    writer.close();

    String seen = FileHandler.readAsString(file);
    assertEquals(expected, seen);
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

  private ZipOutputStream writeTestZipEntry(ZipOutputStream out) throws IOException {
    File testFile = writeTestFile(File.createTempFile("testZip", "file"));
    ZipEntry entry = new ZipEntry(testFile.getName());
    out.putNextEntry(entry);
    FileInputStream in = new FileInputStream(testFile);
    byte[] buffer = new byte[16384];
    while (in.read(buffer, 0, 16384) != -1) {
      out.write(buffer);
    }
    out.flush();
    return out;
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
