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

package org.openqa.grid.common;

import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.openqa.selenium.remote.DesiredCapabilities;

public class SeleniumProtocolTest {

  @Test
  public void getPathTest() {
    //Ensuring that when path is specified via capabilities, that is what we get back in return.
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(RegistrationRequest.SELENIUM_PROTOCOL, SeleniumProtocol.WebDriver.toString());
    caps.setCapability(RegistrationRequest.PATH, "foo/bar");
    SeleniumProtocol protocol = SeleniumProtocol.fromCapabilitiesMap(caps.asMap());
    assertEquals(SeleniumProtocol.WebDriver, protocol);
    assertEquals("foo/bar", protocol.getPathConsideringCapabilitiesMap(caps.asMap()));

    //Ensuring that by default we parse the protocol as WebDriver and we get back its default path.
    caps = new DesiredCapabilities();
    protocol = SeleniumProtocol.fromCapabilitiesMap(caps.asMap());
    assertEquals(SeleniumProtocol.WebDriver, protocol);
    assertEquals("/wd/hub", protocol.getPathConsideringCapabilitiesMap(caps.asMap()));
  }
}
