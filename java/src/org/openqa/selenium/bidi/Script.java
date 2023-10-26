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

package org.openqa.selenium.bidi;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.Require;

public class Script {
  private final Set<String> browsingContextIds;

  private final BiDi bidi;

  public Script(WebDriver driver) {
    this(new HashSet<>(), driver);
  }

  public Script(String browsingContextId, WebDriver driver) {
    this(Collections.singleton(Require.nonNull("Browsing context id", browsingContextId)), driver);
  }

  public Script(Set<String> browsingContextIds, WebDriver driver) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("Browsing context id list", browsingContextIds);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
    this.browsingContextIds = browsingContextIds;
  }
}
