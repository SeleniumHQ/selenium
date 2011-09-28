/*
Copyright 2011 WebDriver committers
Copyright 2011 Software Freedom Conservancy

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
    File file = new File(builder.toString());

    log.fine("Detected local file: " + file.exists());

    return file.exists() ? file : null;
  }
}
