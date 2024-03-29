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

package org.openqa.selenium.firefox;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.FileHandler;

public class ClasspathExtension implements Extension {
  private final Class<?> loadResourcesUsing;
  private final String loadFrom;

  public ClasspathExtension(Class<?> loadResourcesUsing, String loadFrom) {
    this.loadResourcesUsing = loadResourcesUsing;
    this.loadFrom = loadFrom;
  }

  @Override
  public void writeTo(File extensionsDir) throws IOException {
    if (!FileHandler.isZipped(loadFrom)) {
      throw new WebDriverException("Will only install zipped extensions for now");
    }

    File holdingPen = new File(extensionsDir, "webdriver-staging");
    FileHandler.createDir(holdingPen);

    File extractedXpi = new File(holdingPen, loadFrom);
    File parentDir = extractedXpi.getParentFile();
    if (!parentDir.exists()) {
      if (!parentDir.mkdirs()) {
        throw new IOException("Unable to create directory for extracted extension");
      }
    }

    try (InputStream resource = loadResourcesUsing.getResourceAsStream(loadFrom)) {
      if (resource == null) {
        throw new IllegalArgumentException(
            "missing resource '" + loadFrom + "' in " + loadResourcesUsing.getName());
      }
      try (OutputStream stream = new FileOutputStream(extractedXpi)) {
        resource.transferTo(stream);
      }
    }
    new FileExtension(extractedXpi).writeTo(extensionsDir);
  }
}
