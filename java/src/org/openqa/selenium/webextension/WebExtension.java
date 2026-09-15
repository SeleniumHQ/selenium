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

import java.util.Objects;
import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;

/**
 * A handle to a browser extension that was installed mid-session.
 *
 * <p>Returned by {@link HasWebExtensions#installWebExtension} and accepted by {@link
 * HasWebExtensions#uninstallWebExtension}. The wrapped {@linkplain #getId() id} is assigned by the
 * browser and, for a signed Firefox add-on, typically matches the {@code browser_specific_settings}
 * id from the extension manifest.
 */
@Beta
public final class WebExtension {

  private final String id;

  public WebExtension(String id) {
    this.id = Require.nonNull("Extension id", id);
  }

  /**
   * @return the browser-assigned identifier of the installed extension.
   */
  public String getId() {
    return id;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof WebExtension)) {
      return false;
    }
    WebExtension that = (WebExtension) o;
    return id.equals(that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  @Override
  public String toString() {
    return "WebExtension{id=" + id + "}";
  }
}
