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

package org.openqa.selenium.remote.server;

import static com.google.common.base.Preconditions.checkState;

import com.google.common.annotations.VisibleForTesting;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

public class DefaultDriverFactory implements DriverFactory {

  private static final Logger LOG = Logger.getLogger(DefaultDriverFactory.class.getName());

  private Map<Capabilities, DriverProvider> capabilitiesToDriverProvider =
      new ConcurrentHashMap<>();

  public void registerDriverProvider(DriverProvider driverProvider) {
    if (driverProvider.canCreateDriverInstances()) {
      capabilitiesToDriverProvider.put(driverProvider.getProvidedCapabilities(), driverProvider);
    } else {
      LOG.info(String.format("Driver provider %s is not registered", driverProvider));
    }
  }

  @VisibleForTesting
  DriverProvider getProviderMatching(Capabilities desired) {
    // We won't be able to make a match if no drivers have been registered.
    checkState(!capabilitiesToDriverProvider.isEmpty(),
               "No drivers have been registered, will be unable to match %s", desired);
    Capabilities bestMatchingCapabilities =
        CapabilitiesComparator.getBestMatch(desired, capabilitiesToDriverProvider.keySet());
    return capabilitiesToDriverProvider.get(bestMatchingCapabilities);
  }

  public WebDriver newInstance(Capabilities capabilities) {
    DriverProvider provider = getProviderMatching(capabilities);
    if (provider.canCreateDriverInstanceFor(capabilities)) {
      return getProviderMatching(capabilities).newInstance(capabilities);
    }
    throw new WebDriverException(String.format(
      "The best matching driver provider %s can't create a new driver instance for %s",
      provider, capabilities));
  }

  public boolean hasMappingFor(Capabilities capabilities) {
    return capabilitiesToDriverProvider.containsKey(capabilities);
  }
}
