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

package org.openqa.selenium.grid.node;

import java.util.function.Function;
import java.util.function.Predicate;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.PersistentCapabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.internal.Either;

public interface SessionFactory
    extends Function<CreateSessionRequest, Either<WebDriverException, ActiveSession>>,
        Predicate<Capabilities> {

  /**
   * Removes capabilities scoped to a single hop before a factory forwards a new session request
   * upstream. {@code se:remoteUrl} tells this Node how the client reached the Grid; a downstream
   * driver or Selenium server would mistake that address for its own caller's, or reject the
   * capability outright.
   */
  static Capabilities stripPerHopCapabilities(Capabilities capabilities) {
    if (capabilities.getCapability("se:remoteUrl") == null) {
      return capabilities;
    }
    MutableCapabilities stripped = new MutableCapabilities(capabilities);
    stripped.setCapability("se:remoteUrl", (String) null);
    return new PersistentCapabilities(stripped);
  }

  Capabilities getStereotype();
}
