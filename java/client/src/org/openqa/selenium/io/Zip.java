package org.openqa.selenium.io;

import org.openqa.selenium.internal.Base64Encoder;

import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

public class Zip {
  private static final int BUF_SIZE = 16384; // "big"

  public void zip(File inputDir, File output) throws IOException {
    if (output.exists()) {
      throw new IOException("File already exists: " + output);
    }

    FileOutputStream fos = null;
    try {
      fos = new FileOutputStream(output);
      zip(inputDir, fos);
    } finally {
      Cleanly.close(fos);
    }
  }

  public String zip(File inputDir) throws IOException {
    ByteArrayOutputStream bos = new ByteArrayOutputStream();

    try {
      zip(inputDir, bos);
      return new Base64Encoder().encode(bos.toByteArray());
    } finally {
      Cleanly.close(bos);
    }
  }

  private void zip(File inputDir, OutputStream writeTo) throws IOException {
    ZipOutputStream zos = null;
    try {
      zos = new ZipOutputStream(writeTo);
      addToZip(inputDir.getAbsolutePath(), zos, inputDir);
    } finally {
      Cleanly.close(zos);
    }
  }

  private void addToZip(String basePath, ZipOutputStream zos, File toAdd) throws IOException {
    if (toAdd.isDirectory()) {
      for (File file : toAdd.listFiles()) {
        addToZip(basePath, zos, file);
      }
    } else {
      FileInputStream fis = new FileInputStream(toAdd);
      String name = toAdd.getAbsolutePath().substring(basePath.length() + 1);

      ZipEntry entry = new ZipEntry(name);
      zos.putNextEntry(entry);

      int len;
      byte[] buffer = new byte[4096];
      while ((len = fis.read(buffer)) != -1) {
        zos.write(buffer, 0, len);
      }

      fis.close();
      zos.closeEntry();
    }
  }

  public void unzip(String source, File outputDir) throws IOException {
    byte[] bytes = new Base64Encoder().decode(source);

    ByteArrayInputStream bis = null;
    try {
      bis = new ByteArrayInputStream(bytes);
      unzip(bis, outputDir);
    } finally {
      Cleanly.close(bis);
    }
  }

  public void unzip(File source, File outputDir) throws IOException {
    FileInputStream fis = null;

    try {
      fis = new FileInputStream(source);
      unzip(fis, outputDir);
    } finally {
      Cleanly.close(fis);
    }
  }

  public void unzip(InputStream source, File outputDir) throws IOException {
    ZipInputStream zis = new ZipInputStream(source);

    try {
      ZipEntry entry;
      while ((entry = zis.getNextEntry()) != null) {
        File file = new File(outputDir, entry.getName());
        if (entry.isDirectory()) {
          FileHandler.createDir(file);
          continue;
        }

        unzipFile(outputDir, zis, entry.getName());
      }
    } finally {
      Cleanly.close(zis);
    }
  }

  public void unzipFile(File output, InputStream zipStream, String name)
      throws IOException {
    File toWrite = new File(output, name);

    if (!FileHandler.createDir(toWrite.getParentFile()))
       throw new IOException("Cannot create parent director for: " + name);

    OutputStream out = new BufferedOutputStream(new FileOutputStream(toWrite), BUF_SIZE);
    try {
      byte[] buffer = new byte[BUF_SIZE];
      int read;
      while ((read = zipStream.read(buffer)) != -1) {
        out.write(buffer, 0, read);
      }
    } finally {
      out.close();
    }
  }
}
