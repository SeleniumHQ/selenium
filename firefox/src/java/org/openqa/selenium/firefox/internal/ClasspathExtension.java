/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.firefox.internal;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.FileHandler;

public class ClasspathExtension implements Extension {
  private final Class<?> loadResourcesUsing;
  private final String loadFrom;

  public ClasspathExtension(Class<?> loadResourcesUsing, String loadFrom) {
    this.loadResourcesUsing = loadResourcesUsing;
    this.loadFrom = loadFrom;
  }

  public void writeTo(File extensionsDir) throws IOException {
    // Try and load it from the classpath
    InputStream resource = loadResourcesUsing.getResourceAsStream(loadFrom);
    if (resource == null && !loadFrom.startsWith("/")) {
      resource = loadResourcesUsing.getResourceAsStream("/" + loadFrom);
    }
    if (resource == null) {
      resource = getClass().getResourceAsStream(loadFrom);
    }
    if (resource == null && !loadFrom.startsWith("/")) {
      resource = getClass().getResourceAsStream("/" + loadFrom);
    }
    if (resource == null) {
      throw new FileNotFoundException("Cannot locate resource with name: " + loadFrom);
    }

    File root;
    if (FileHandler.isZipped(loadFrom)) {
      root = FileHandler.unzip(resource);
    } else {
      throw new WebDriverException("Will only install zipped extensions for now");
    }

    new FileExtension(root).writeTo(extensionsDir);
  }
}
