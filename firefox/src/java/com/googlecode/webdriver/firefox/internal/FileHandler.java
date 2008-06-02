// Copyright 2008 Google Inc.  All Rights Reserved.

package com.googlecode.webdriver.firefox.internal;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Utility methods for handling zipped content
 */
public class FileHandler {

  public static File unzip(InputStream resource) throws IOException {
    String tempName = String.valueOf(System.currentTimeMillis());
    File output = new File(System.getProperty("java.io.tmpdir"), tempName);
    output.mkdirs();
    FileHandler.makeWritable(output);

    ZipInputStream zipStream = new ZipInputStream(resource);
    ZipEntry entry = zipStream.getNextEntry();
    while (entry != null) {
      if (entry.isDirectory()) {
        createDir(new File(output, entry.getName()));
      } else {
        createFile(output, zipStream, entry.getName());
      }
      entry = zipStream.getNextEntry();
    }

    return output;
  }

  private static void createFile(File output, InputStream zipStream, String name)
      throws IOException {
    File toWrite = new File(output, name);

    if (!createDir(toWrite.getParentFile()))
      throw new IOException("Cannot create parent director for: " + name);

    FileOutputStream out = null;
    try {
      out = new FileOutputStream(toWrite);

      while (true) {
        byte[] buffer = new byte[4096];
        int read = zipStream.read(buffer);
        if (read == -1) {
          break;
        }
        out.write(buffer, 0, read);
      }
    } finally {
      if (out != null) {
        out.close();
      }
    }
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

    try {
      // File.setWritable appears in Java 6. If we find the method,
      // we can use it
      Method setWritable = File.class.getMethod("setWritable", Boolean.class);
      return (Boolean) setWritable.invoke(file, true);
    } catch (NoSuchMethodException e) {
      // Search the path for chmod
      String allPaths = System.getenv("PATH");
      String[] paths = allPaths.split(File.separator);
      for (String path : paths) {
        File chmod = new File(path, "chmod");
        if (!chmod.exists()) {
          continue;
        }

        Process process =
            Runtime.getRuntime()
                .exec(new String[]{chmod.getAbsolutePath(), "+x", file.getAbsolutePath()});
        try {
          process.waitFor();
        } catch (InterruptedException e1) {
          throw new RuntimeException(e1);
        }

        return file.canWrite();
      }
    } catch (IllegalAccessException e) {
      // Do nothing. We return false in the end
    } catch (InvocationTargetException e) {
      // Do nothing. We return false in the end
    }
    return false;
  }

  public static boolean isZipped(String fileName) {
    return fileName.endsWith(".zip") || fileName.endsWith(".xpi");
  }

  public static boolean delete(File toDelete) {
    boolean deleted = true;

    if (toDelete.isDirectory()) {
      for (File child : toDelete.listFiles()) {
        deleted &= delete(child);
      }
    }

    return deleted && toDelete.delete();
  }

  public static void copyDir(File from, File to) {
    String[] contents = from.list();
    for (String child : contents) {
      File toCopy = new File(from, child);
      File target = new File(to, child);

      if (toCopy.isDirectory()) {
        target.mkdir();
        copyDir(toCopy, target);
      } else if (!".parentlock".equals(child) && !"parent.lock".equals(child)) {
        copyFile(toCopy, target);
      }
    }
  }

  private static void copyFile(File from, File to) {
    BufferedOutputStream out = null;
    BufferedInputStream in = null;
    try {
      out = new BufferedOutputStream(new FileOutputStream(to));
      in = new BufferedInputStream(new FileInputStream(from));

      int read = in.read();
      while (read != -1) {
        out.write(read);
        read = in.read();
      }
    } catch (IOException e) {
      throw new RuntimeException(e);
    } finally {
      Cleanly.close(out);
      Cleanly.close(in);
    }
  }

}
