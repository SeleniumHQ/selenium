/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.grid.selenium.proxy;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.Registry;

/**
 * WebdriverRemoteProxy and SeleniumRemoteProxy have been merged into DefaultRemoteProxy. Use that
 * instead. The distinction between the RC/Selenium protocol and WebDriver protocol is now done at
 * the TestSlot level, so if you want your custom proxy to do something specific for only one of
 * those protocol, you'll have to check the protocol of each slot :
 * getTestSlots().get(index).getProtocol()
 */
@Deprecated
public class SeleniumRemoteProxy extends DefaultRemoteProxy {

  public SeleniumRemoteProxy(RegistrationRequest request, Registry registry) {
    super(request, registry);
  }

}
