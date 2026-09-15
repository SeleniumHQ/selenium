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

import java.nio.file.Path;
import org.openqa.selenium.Beta;
import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.WebDriverException;

/**
 * Indicates that a driver can install and uninstall browser extensions mid-session.
 *
 * <p>Implemented by {@code RemoteWebDriver}, so {@code FirefoxDriver}, {@code ChromeDriver} and
 * {@code EdgeDriver} all expose it, as does a {@code RemoteWebDriver} talking to a Grid. A bare
 * {@link org.openqa.selenium.WebDriver} reference reaches it with a cast: {@code
 * ((HasWebExtensions) driver)}.
 *
 * <p>The methods are always present, even where a particular session cannot honour them (for
 * example Chromium without BiDi enabled). In that case the call raises rather than silently doing
 * less.
 */
@Beta
public interface HasWebExtensions {

  /**
   * Installs an extension from a packed archive ({@code .xpi} / {@code .zip} / {@code .crx}) or an
   * unpacked extension directory. The kind is detected from the path.
   *
   * @param path local path to the extension archive or directory
   * @return a handle to the installed extension
   * @throws InvalidArgumentException if {@code path} does not exist or is not a readable
   *     archive/directory
   * @throws WebDriverException if the session cannot install extensions (for example Chromium
   *     without BiDi enabled)
   */
  WebExtension installWebExtension(Path path);

  /**
   * Installs an extension from a path, passing vendor-specific options.
   *
   * @param path local path to the extension archive or directory
   * @param options vendor-specific options; today only {@link FirefoxWebExtensionOptions}
   * @return a handle to the installed extension
   * @throws InvalidArgumentException if {@code path} is invalid, or {@code options} sets a value
   *     the target browser or transport cannot honour
   * @throws WebDriverException if the session cannot install extensions
   */
  WebExtension installWebExtension(Path path, WebExtensionOptions options);

  /**
   * Installs an extension from the Base64-encoded bytes of a packed extension.
   *
   * @param base64Encoded Base64-encoded bytes of the extension archive
   * @return a handle to the installed extension
   * @throws InvalidArgumentException if {@code base64Encoded} is not valid Base64
   * @throws WebDriverException if the session cannot install extensions (for example Chromium,
   *     which installs only unpacked directories)
   */
  WebExtension installWebExtension(String base64Encoded);

  /**
   * Installs an extension from Base64-encoded bytes, passing vendor-specific options.
   *
   * @param base64Encoded Base64-encoded bytes of the extension archive
   * @param options vendor-specific options; today only {@link FirefoxWebExtensionOptions}
   * @return a handle to the installed extension
   * @throws InvalidArgumentException if {@code base64Encoded} is invalid, or {@code options} sets a
   *     value the target browser or transport cannot honour
   * @throws WebDriverException if the session cannot install extensions
   */
  WebExtension installWebExtension(String base64Encoded, WebExtensionOptions options);

  /**
   * Uninstalls a previously installed extension.
   *
   * @param extension the handle returned by {@code installWebExtension}
   * @throws WebDriverException if no such extension is installed
   */
  void uninstallWebExtension(WebExtension extension);
}
