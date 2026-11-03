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

import java.util.Optional;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Beta;

/**
 * Firefox-only options for {@link HasWebExtensions#installWebExtension(java.nio.file.Path,
 * WebExtensionOptions)}.
 *
 * <p>Passing an instance that sets an option to a non-Firefox session raises {@link
 * org.openqa.selenium.InvalidArgumentException}. Both options are honoured whether the Firefox
 * session uses BiDi or falls back to the classic {@code /moz/addon/install} endpoint.
 *
 * <p>Instances are immutable; build one fluently:
 *
 * <pre>{@code
 * driver.installWebExtension(
 *     path, new FirefoxWebExtensionOptions().permanent(true).allowPrivateBrowsing(true));
 * }</pre>
 */
@Beta
public final class FirefoxWebExtensionOptions extends WebExtensionOptions {

  private final @Nullable Boolean permanent;
  private final @Nullable Boolean allowPrivateBrowsing;

  public FirefoxWebExtensionOptions() {
    this(null, null);
  }

  private FirefoxWebExtensionOptions(
      @Nullable Boolean permanent, @Nullable Boolean allowPrivateBrowsing) {
    this.permanent = permanent;
    this.allowPrivateBrowsing = allowPrivateBrowsing;
  }

  /**
   * Installs the extension permanently rather than for the lifetime of the session.
   *
   * @param permanent whether the extension should survive the session
   * @return a new options object with the value set
   */
  public FirefoxWebExtensionOptions permanent(boolean permanent) {
    return new FirefoxWebExtensionOptions(permanent, this.allowPrivateBrowsing);
  }

  /**
   * Allows the extension to run in private browsing windows.
   *
   * @param allowPrivateBrowsing whether the extension may run in private windows
   * @return a new options object with the value set
   */
  public FirefoxWebExtensionOptions allowPrivateBrowsing(boolean allowPrivateBrowsing) {
    return new FirefoxWebExtensionOptions(this.permanent, allowPrivateBrowsing);
  }

  public Optional<Boolean> isPermanent() {
    return Optional.ofNullable(permanent);
  }

  public Optional<Boolean> allowsPrivateBrowsing() {
    return Optional.ofNullable(allowPrivateBrowsing);
  }

  @Override
  public boolean isEmpty() {
    return permanent == null && allowPrivateBrowsing == null;
  }
}
