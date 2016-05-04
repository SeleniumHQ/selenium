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

import com.google.common.collect.Lists;
import com.google.common.io.Closeables;

import org.openqa.selenium.Platform;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.nio.channels.FileChannel;
import java.nio.file.Files;
import java.util.List;

/**
 * Utility methods for common filesystem activities
 */
public class FileHandler {

  public static File unzip(InputStream resource) throws IOException {
    File output = TemporaryFilesystem.getDefaultTmpFS().createTempDir("unzip", "stream");

    new Zip().unzip(resource, output);

    return output;
  }

  public static void copyResource(File outputDir, Class<?> forClassLoader, String... names)
      throws IOException {
    Zip zip = new Zip();

    for (String name : names) {
      InputStream is = locateResource(forClassLoader, name);
      try {
        zip.unzipFile(outputDir, is, name);
      } finally {
        is.close();
      }
    }
  }

  private static InputStream locateResource(Class<?> forClassLoader, String name)
      throws IOException {
    String arch = System.getProperty("os.arch").toLowerCase() + "/";
    List<String> alternatives =
        Lists.newArrayList(name, "/" + name, arch + name, "/" + arch + name);
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


  public static boolean createDir(File dir) throws IOException {
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

  public static boolean makeWritable(File file) throws IOException {
    if (file.canWrite()) {
      return true;
    }

    return file.setWritable(true);
  }

  public static boolean makeExecutable(File file) throws IOException {
    if (canExecute(file)) {
      return true;
    }

    return file.setExecutable(true);
  }

  public static Boolean canExecute(File file) {
    return file.canExecute();
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
    copy(from, to, new NoFilter());
  }

  public static void copy(File source, File dest, String suffix) throws IOException {
    copy(source, dest, suffix == null ? new NoFilter() : new FileSuffixFilter(suffix));
  }

  private static void copy(File source, File dest, Filter onlyCopy) throws IOException {
    if (!source.exists()) {
      return;
    }

    if (source.isDirectory()) {
      copyDir(source, dest, onlyCopy);
    } else {
      copyFile(source, dest, onlyCopy);
    }
  }

  private static void copyDir(File from, File to, Filter onlyCopy) throws IOException {
    if (!onlyCopy.isRequired(from)) {
      return;
    }

    // Create the target directory.
    createDir(to);

    // List children.
    String[] children = from.list();
    if (children == null) {
      throw new IOException("Could not copy directory " + from.getPath());
    }
    for (String child : children) {
      if (!".parentlock".equals(child) && !"parent.lock".equals(child)) {
        copy(new File(from, child), new File(to, child), onlyCopy);
      }
    }
  }

  private static void copyFile(File from, File to, Filter onlyCopy) throws IOException {
    if (!onlyCopy.isRequired(from)) {
      return;
    }

    try (OutputStream out = new FileOutputStream(to)) {
      final long copied = Files.copy(from.toPath(), out);
      final long length = from.length();
      if (copied != length) {
        throw new IOException("Could not transfer all bytes from " + from + " to " + to);
      }
    }
  }

  /**
   * Used by file operations to determine whether or not to make use of a file.
   */
  public interface Filter {
    /**
     * @param file File to be considered.
     * @return Whether or not to make use of the file in this oprtation.
     */
    boolean isRequired(File file);
  }

  private static class FileSuffixFilter implements Filter {
    private final String suffix;

    public FileSuffixFilter(String suffix) {
      this.suffix = suffix;
    }

    public boolean isRequired(File file) {
      return file.isDirectory() || file.getAbsolutePath().endsWith(suffix);
    }
  }

  private static class NoFilter implements Filter {
    public boolean isRequired(File file) {
      return true;
    }
  }

  public static String readAsString(File toRead) throws IOException {
    Reader reader = null;
    try {
      reader = new BufferedReader(new FileReader(toRead));
      StringBuilder builder = new StringBuilder();

      char[] buffer = new char[4096];
      int read;
      while ((read = reader.read(buffer)) != -1) {
        char[] target = new char[read];
        System.arraycopy(buffer, 0, target, 0, read);
        builder.append(target);
      }

      return builder.toString();
    } finally {
      Closeables.close(reader, false);
    }
  }
}
