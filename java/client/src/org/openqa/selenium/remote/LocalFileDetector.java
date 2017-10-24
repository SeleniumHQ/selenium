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

package org.openqa.selenium.remote;

import java.io.File;
import java.util.logging.Logger;

/**
 * Detects files on the local disk.
 */
public class LocalFileDetector implements FileDetector {

  private static final Logger log = Logger.getLogger(LocalFileDetector.class.getName());

  public File getLocalFile(CharSequence... keys) {
    StringBuilder builder = new StringBuilder();
    for (CharSequence chars : keys) {
      builder.append(chars);
    }

    String filepath = builder.toString();

    // If empty string, no file is meant to be sent
    if (filepath.isEmpty()) {
        return null;
    }

    File file = new File(filepath);

    // It turns out that files in the CWD may not have a parent file.
    File parentDir = file.getParentFile();
    if (parentDir == null) {
      parentDir = new File(".");
    }
    File toUpload = new File(parentDir, file.getName());

    log.fine("Detected local file: " + toUpload.exists());

    return toUpload.exists() && toUpload.isFile() ? toUpload : null;
  }
}
