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

package org.openqa.selenium;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

/** Indicates that a driver supports downloading remote files. */
public interface HasDownloads {

  /**
   * Requires downloads to be enabled.
   *
   * <p>TODO: Create an example in the documentation and provide a link to it.
   *
   * @param capabilities the capabilities object
   * @throws WebDriverException if capability to enable downloads is not set
   */
  default void requireDownloadsEnabled(Capabilities capabilities) {
    boolean downloadsEnabled = capabilities.is("se:downloadsEnabled");
    if (!downloadsEnabled) {
      throw new WebDriverException(
          "You must enable downloads in order to work with downloadable files.");
    }
  }

  /**
   * Gets the downloadable files.
   *
   * @return a list of downloadable files for each key
   */
  List<String> getDownloadableFiles();

  /**
   * Downloads a file to a given location.
   *
   * @param fileName the name of the file to be downloaded
   * @param targetLocation the location where the file will be downloaded to
   * @throws IOException if an I/O error occurs while downloading the file
   */
  void downloadFile(String fileName, Path targetLocation) throws IOException;

  /** Deletes the downloadable files. */
  void deleteDownloadableFiles();
}
