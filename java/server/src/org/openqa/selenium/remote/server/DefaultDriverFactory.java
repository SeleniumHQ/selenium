/*
Copyright 2007-2009 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.remote.server;

import static com.google.common.base.Preconditions.checkState;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class DefaultDriverFactory implements DriverFactory {

  private Map<Capabilities, DriverProvider> capabilitiesToDriverProvider =
      new ConcurrentHashMap<Capabilities, DriverProvider>();

  public void registerDriver(Capabilities capabilities, Class<? extends WebDriver> implementation) {
    registerDriverProvider(capabilities, new DefaultDriverProvider(capabilities, implementation));
  }

  public void registerDriverProvider(Capabilities capabilities, DriverProvider implementation) {
    capabilitiesToDriverProvider.put(capabilities, implementation);
  }

  protected Class<? extends WebDriver> getBestMatchFor(Capabilities desired) {
    return getProviderMatching(desired).getDriverClass();
  }

  protected DriverProvider getProviderMatching(Capabilities desired) {
    // We won't be able to make a match if no drivers have been registered.
    checkState(!capabilitiesToDriverProvider.isEmpty(),
               "No drivers have been registered, will be unable to match %s", desired);
    Capabilities bestMatchingCapabilities =
        CapabilitiesComparator.getBestMatch(desired, capabilitiesToDriverProvider.keySet());
    return capabilitiesToDriverProvider.get(bestMatchingCapabilities);
  }

  public WebDriver newInstance(Capabilities capabilities) {
    return getProviderMatching(capabilities).newInstance(capabilities);
  }

  public boolean hasMappingFor(Capabilities capabilities) {
    return capabilitiesToDriverProvider.containsKey(capabilities);
  }
}
