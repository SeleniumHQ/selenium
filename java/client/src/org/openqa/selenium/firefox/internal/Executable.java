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


package org.openqa.selenium.firefox.internal;

import com.google.common.base.Preconditions;

import java.io.File;

/**
 * Wrapper around our runtime environment requirements. Performs discovery of firefox instances.
 */
public class Executable {

  private final File binary;

  public Executable(File userSpecifiedBinaryPath) {
    Preconditions.checkState(userSpecifiedBinaryPath != null,
                             "Path to the firefox binary should not be null");
    Preconditions.checkState(userSpecifiedBinaryPath.exists() && userSpecifiedBinaryPath.isFile(),
                             "Specified firefox binary location does not exist or is not a real file: " +
                             userSpecifiedBinaryPath);
    binary = userSpecifiedBinaryPath;
  }

  public File getFile() {
    return binary;
  }

  public String getPath() {
    return binary.getAbsolutePath();
  }
}
