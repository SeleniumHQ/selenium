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

package org.openqa.selenium.devtools;

import com.google.auto.service.AutoService;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.ExecuteMethod;

import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;

@AutoService(AugmenterProvider.class)
public class DevToolsProvider implements AugmenterProvider<HasDevTools> {

  @Override
  public Predicate<Capabilities> isApplicable() {
    return caps -> getCdpUrl(caps) != null;
  }

  @Override
  public Class<HasDevTools> getDescribedInterface() {
    return HasDevTools.class;
  }

  @Override
  public HasDevTools getImplementation(Capabilities caps, ExecuteMethod executeMethod) {
    Optional<DevTools> devTools = SeleniumCdpConnection.create(caps).map(DevTools::new);

    return () -> devTools.orElseThrow(() -> new IllegalStateException("Unable to create connection to " + caps));
  }

  private String getCdpUrl(Capabilities caps) {
    Object options = caps.getCapability("se:options");
    if (!(options instanceof Map)) {
      return null;
    }

    Object cdp = ((Map<?, ?>) options).get("cdp");
    return cdp == null ? null : String.valueOf(cdp);
  }
}
