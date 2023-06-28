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

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/** A wrapper around temporary filesystem behaviour. */
public class TemporaryFilesystem {

  private final Set<File> temporaryFiles = new CopyOnWriteArraySet<>();

  private final File baseDir;
  // Thread safety reviewed
  private final Thread shutdownHook = new Thread(this::deleteTemporaryFiles);

  private static final File sysTemp = new File(System.getProperty("java.io.tmpdir"));
  private static final ReadWriteLock lock = new ReentrantReadWriteLock();
  private static TemporaryFilesystem instance = new TemporaryFilesystem(sysTemp);

  public static TemporaryFilesystem getDefaultTmpFS() {
    Lock readLock = lock.readLock();
    readLock.lock();
    try {
      return instance;
    } finally {
      readLock.unlock();
    }
  }

  public static void setTemporaryDirectory(File directory) {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      instance = new TemporaryFilesystem(directory);
    } finally {
      writeLock.unlock();
    }
  }

  public static TemporaryFilesystem getTmpFsBasedOn(File directory) {
    return new TemporaryFilesystem(directory);
  }

  private TemporaryFilesystem(File baseDir) {
    this.baseDir = baseDir;

    Runtime.getRuntime().addShutdownHook(shutdownHook);

    if (!baseDir.exists()) {
      throw new UncheckedIOException(
          new IOException("Unable to find tmp dir: " + baseDir.getAbsolutePath()));
    }
    if (!baseDir.canWrite()) {
      throw new UncheckedIOException(
          new IOException("Unable to write to tmp dir: " + baseDir.getAbsolutePath()));
    }
  }

  /**
   * Create a temporary directory, and track it for deletion.
   *
   * @param prefix the prefix to use when creating the temporary directory
   * @param suffix the suffix to use when creating the temporary directory
   * @return the temporary directory to create
   */
  public File createTempDir(String prefix, String suffix) {
    try {
      // Create a tempfile, and delete it.
      File file = File.createTempFile(prefix, suffix, baseDir);

      if (!file.delete()) {
        throw new IOException("Unable to create temp file");
      }

      // Create it as a directory.
      File dir = new File(file.getAbsolutePath());
      if (!dir.mkdirs()) {
        throw new UncheckedIOException(
            new IOException("Cannot create profile directory at " + dir.getAbsolutePath()));
      }

      // Create the directory and mark it writable.
      FileHandler.createDir(dir);

      temporaryFiles.add(dir);
      return dir;
    } catch (IOException e) {
      throw new UncheckedIOException(
          new IOException("Unable to create temporary file at " + baseDir.getAbsolutePath()));
    }
  }

  /**
   * Delete a temporary directory that we were responsible for creating.
   *
   * @param file the file to delete
   */
  public void deleteTempDir(File file) {
    if (!shouldReap()) {
      return;
    }

    // If the tempfile can be removed, delete it. If not, it wasn't created by us.
    if (temporaryFiles.remove(file)) {
      FileHandler.delete(file);
    }
  }

  /** Perform the operation that a shutdown hook would have. */
  public void deleteTemporaryFiles() {
    if (!shouldReap()) {
      return;
    }

    for (File file : temporaryFiles) {
      try {
        FileHandler.delete(file);
      } catch (UncheckedIOException ignore) {
        // ignore; an interrupt will already have been logged.
      }
    }
  }

  /**
   * Returns true if we should be reaping profiles. Used to control tempfile deletion.
   *
   * @return true if reaping is enabled.
   */
  boolean shouldReap() {
    String reap = System.getProperty("webdriver.reap_profile", "true");
    return Boolean.parseBoolean(reap);
  }

  public boolean deleteBaseDir() {
    boolean wasDeleted = baseDir.delete();
    if (!baseDir.exists()) {
      Runtime.getRuntime().removeShutdownHook(shutdownHook);
    }
    return wasDeleted;
  }

  public File getBaseDir() {
    return baseDir;
  }
}
