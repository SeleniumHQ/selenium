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

import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Base64;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

public class Zip {
  private static final int BUF_SIZE = 16384; // "big"

  public static String zip(File input) throws IOException {
    try (ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
      try (ZipOutputStream zos = new ZipOutputStream(bos)) {
        if (input.isDirectory()) {
          addToZip(input.getAbsolutePath(), zos, input);
        } else {
          addToZip(input.getParentFile().getAbsolutePath(), zos, input);
        }
      }
      return Base64.getEncoder().encodeToString(bos.toByteArray());
    }
  }

  private static void addToZip(String basePath, ZipOutputStream zos, File toAdd)
      throws IOException {
    if (toAdd.isDirectory()) {
      File[] files = toAdd.listFiles();
      if (files != null) {
        for (File file : files) {
          addToZip(basePath, zos, file);
        }
      }
    } else {
      try (FileInputStream fis = new FileInputStream(toAdd)) {
        String name = toAdd.getAbsolutePath().substring(basePath.length() + 1);

        ZipEntry entry = new ZipEntry(name.replace('\\', '/'));
        zos.putNextEntry(entry);

        int len;
        byte[] buffer = new byte[4096];
        while ((len = fis.read(buffer)) != -1) {
          zos.write(buffer, 0, len);
        }

        zos.closeEntry();
      }
    }
  }

  public static File unzipToTempDir(String source, String prefix, String suffix)
      throws IOException {
    File output = TemporaryFilesystem.getDefaultTmpFS().createTempDir(prefix, suffix);
    Zip.unzip(source, output);
    return output;
  }

  public static void unzip(String source, File outputDir) throws IOException {
    byte[] bytes = Base64.getMimeDecoder().decode(source);

    try (ByteArrayInputStream bis = new ByteArrayInputStream(bytes)) {
      unzip(bis, outputDir);
    }
  }

  public static File unzipToTempDir(InputStream source, String prefix, String suffix)
      throws IOException {
    File output = TemporaryFilesystem.getDefaultTmpFS().createTempDir(prefix, suffix);
    Zip.unzip(source, output);
    return output;
  }

  public static void unzip(InputStream source, File outputDir) throws IOException {
    try (ZipInputStream zis = new ZipInputStream(source)) {
      ZipEntry entry;
      while ((entry = zis.getNextEntry()) != null) {
        File file = new File(outputDir, entry.getName());
        if (entry.isDirectory()) {
          FileHandler.createDir(file);
          continue;
        }

        unzipFile(outputDir, zis, entry.getName());
      }
    }
  }

  public static void unzipFile(File output, InputStream zipStream, String name) throws IOException {
    String canonicalDestinationDirPath = output.getCanonicalPath();
    File toWrite = new File(output, name);
    String canonicalDestinationFile = toWrite.getCanonicalPath();
    if (!canonicalDestinationFile.startsWith(canonicalDestinationDirPath + File.separator)) {
      throw new IOException("Entry is outside of the target dir: " + name);
    }

    if (!FileHandler.createDir(toWrite.getParentFile()))
      throw new IOException("Cannot create parent directory for: " + name);

    try (OutputStream out = new BufferedOutputStream(new FileOutputStream(toWrite), BUF_SIZE)) {
      byte[] buffer = new byte[BUF_SIZE];
      int read;
      while ((read = zipStream.read(buffer)) != -1) {
        out.write(buffer, 0, read);
      }
    }
  }
}
