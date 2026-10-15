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

package org.openqa.selenium.webextension;

import org.openqa.selenium.Beta;

/**
 * Base type for the options accepted by {@link
 * HasWebExtensions#installWebExtension(java.nio.file.Path, WebExtensionOptions)}.
 *
 * <p>There are no cross-browser install options today, so on its own an instance carries nothing.
 * Use a browser-specific subtype — currently only {@link FirefoxWebExtensionOptions} — to pass
 * vendor options. A driver whose browser does not recognise the options it is handed rejects the
 * call with {@link org.openqa.selenium.InvalidArgumentException}.
 */
@Beta
public class WebExtensionOptions {

  /**
   * @return {@code true} if no vendor-specific option is set — the common cross-browser case.
   */
  public boolean isEmpty() {
    return true;
  }
}
