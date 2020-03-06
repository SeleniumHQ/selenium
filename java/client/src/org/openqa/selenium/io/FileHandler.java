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

import org.openqa.selenium.Platform;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

/**
 * Utility methods for common filesystem activities
 */
public class FileHandler {

  public static void copyResource(File outputDir, Class<?> forClassLoader, String... names)
      throws IOException {
    for (String name : names) {
      try (InputStream is = locateResource(forClassLoader, name)) {
        Zip.unzipFile(outputDir, is, name);
      }
    }
  }

  private static InputStream locateResource(Class<?> forClassLoader, String name)
      throws IOException {
    String arch = Objects.requireNonNull(System.getProperty("os.arch")).toLowerCase() + "/";
    List<String> alternatives =
        Arrays.asList(name, "/" + name, arch + name, "/" + arch + name);
    if (Platform.getCurrent().is(Platform.MAC)) {
      alternatives.add("mac/" + name);
      alternatives.add("/mac/" + name);
    }

    // First look using our own classloader
    for (String possibility : alternatives) {
      InputStream stream = FileHandler.class.getResourceAsStream(possibility);
      if (stream != null) {
        return stream;
      }
      stream = forClassLoader.getResourceAsStream(possibility);
      if (stream != null) {
        return stream;
      }
    }

    throw new IOException("Unable to locate: " + name);
  }


  public static boolean createDir(File dir) {
    if ((dir.exists() || dir.mkdirs()) && dir.canWrite())
      return true;

    if (dir.exists()) {
      FileHandler.makeWritable(dir);
      return dir.canWrite();
    }

    // Iterate through the parent directories until we find that exists,
    // then sink down.
    return createDir(dir.getParentFile());
  }

  public static boolean makeWritable(File file) {
    return file.canWrite() || file.setWritable(true);
  }

  public static boolean isZipped(String fileName) {
    return fileName.endsWith(".zip") || fileName.endsWith(".xpi");
  }

  public static boolean delete(File toDelete) {
    boolean deleted = true;

    if (toDelete.isDirectory()) {
      File[] children = toDelete.listFiles();
      if (children != null) {
        for (File child : children) {
          deleted &= child.canWrite() && delete(child);
        }
      }
    }

    return deleted && toDelete.canWrite() && toDelete.delete();
  }

  public static void copy(File from, File to) throws IOException {
    if (!from.exists()) {
      return;
    }

    if (from.isDirectory()) {
      copyDir(from, to);
    } else {
      copyFile(from, to);
    }
  }

  private static void copyDir(File from, File to) throws IOException {
    // Create the target directory.
    createDir(to);

    // List children.
    String[] children = from.list();
    if (children == null) {
      throw new IOException("Could not copy directory " + from.getPath());
    }
    for (String child : children) {
      if (!".parentlock".equals(child) && !"parent.lock".equals(child)) {
        copy(new File(from, child), new File(to, child));
      }
    }
  }

  private static void copyFile(File from, File to) throws IOException {
    try (OutputStream out = new FileOutputStream(to)) {
      final long copied = Files.copy(from.toPath(), out);
      final long length = from.length();
      if (copied != length) {
        throw new IOException("Could not transfer all bytes from " + from + " to " + to);
      }
    }
  }
}
