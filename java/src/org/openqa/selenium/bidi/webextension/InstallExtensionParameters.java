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

package org.openqa.selenium.bidi.webextension;

import java.util.Collections;
import java.util.Map;
import java.util.TreeMap;
import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;

@Beta
public class InstallExtensionParameters {

  private final ExtensionData extensionData;
  private final Map<String, Object> vendorOptions;

  public InstallExtensionParameters(ExtensionData extensionData) {
    this(extensionData, Collections.emptyMap());
  }

  /**
   * @param extensionData where the extension is coming from
   * @param vendorOptions vendor-prefixed extras merged as siblings of {@code extensionData} in the
   *     {@code webExtension.install} params (for example {@code moz:permanent})
   */
  public InstallExtensionParameters(
      ExtensionData extensionData, Map<String, Object> vendorOptions) {
    this.extensionData = Require.nonNull("Extension data", extensionData);
    this.vendorOptions = Map.copyOf(Require.nonNull("Vendor options", vendorOptions));
  }

  public ExtensionData getExtensionData() {
    return extensionData;
  }

  public Map<String, Object> toMap() {
    Map<String, Object> params = new TreeMap<>(extensionData.toMap());
    vendorOptions.forEach(params::putIfAbsent);
    return Collections.unmodifiableMap(params);
  }
}
