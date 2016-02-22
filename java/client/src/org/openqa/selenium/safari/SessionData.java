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

package org.openqa.selenium.safari;

import com.google.common.collect.ImmutableList;

import org.openqa.selenium.Platform;
import org.openqa.selenium.io.FileHandler;

import java.io.File;
import java.io.IOException;

/**
 * Provides access to Safari's session data files.
 */
class SessionData {

  private final Iterable<File> sessionDataFiles;

  private SessionData(Iterable<File> sessionDataFiles) {
    this.sessionDataFiles = sessionDataFiles;
  }

  /**
   * @return The SessionData container for the current platform.
   */
  public static SessionData forCurrentPlatform() {
    Platform current = Platform.getCurrent();

    Iterable<File> files = ImmutableList.of();
    if (current.is(Platform.MAC)) {
      File libraryDir = new File("/Users", System.getenv("USER") + "/Library");
      files = ImmutableList.of(
          new File(libraryDir, "Caches/com.apple.Safari/Cache.db"),
          new File(libraryDir, "Cookies/Cookies.binarycookies"),
          new File(libraryDir, "Cookies/Cookies.plist"),
          new File(libraryDir, "Safari/History.plist"),
          new File(libraryDir, "Safari/LastSession.plist"),
          new File(libraryDir, "Safari/LocalStorage"),
          new File(libraryDir, "Safari/Databases"));
    }

    if (current.is(Platform.WINDOWS)) {
      File appDataDir = new File(System.getenv("APPDATA"), "Apple Computer/Safari");
      File localDataDir = new File(System.getenv("LOCALAPPDATA"), "Apple Computer/Safari");

      files = ImmutableList.of(
          new File(appDataDir, "History.plist"),
          new File(appDataDir, "LastSession.plist"),
          new File(appDataDir, "Cookies/Cookies.plist"),
          new File(appDataDir, "Cookies/Cookies.binarycookies"),
          new File(localDataDir, "Cache.db"),
          new File(localDataDir, "Databases"),
          new File(localDataDir, "LocalStorage"));
    }

    return new SessionData(files);
  }

  /**
   * Deletes all of the existing session data.
   *
   * @throws IOException If an I/O error occurs.
   */
  public void clear() throws IOException {
    for (File file : sessionDataFiles) {
      FileHandler.delete(file);
    }
  }
}
