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

package org.openqa.grid.internal;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.SeleniumProtocol;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

public class MyCustomProxy extends BaseRemoteProxy {

  public static String MY_STRING = "my string";
  public static URL MY_URL;
  public static boolean MY_BOOLEAN = true;

  public MyCustomProxy(RegistrationRequest request, Registry registry) {

    super(request, registry);
    try {
      MY_URL = new URL("http://www.google.com");
    } catch (MalformedURLException e) {
    }
  }

  public Boolean getBoolean() {
    return MY_BOOLEAN;
  }

  public URL getURL() {
    return MY_URL;
  }

  public String getString() {
    return MY_STRING;
  }

  @Override
  public TestSlot createTestSlot(SeleniumProtocol protocol, Map<String, Object> capabilities) {
    return new MyTestSlot(this,protocol, capabilities);
  }

  @Override
  public TestSession getNewSession(Map<String, Object> requestedCapability) {
    TestSession session =  super.getNewSession(requestedCapability);
    TestSlot slot = session.getSlot();
    if (requestedCapability.containsKey("slotName") && slot instanceof MyTestSlot) {
      ((MyTestSlot)slot).setSlotName(requestedCapability.get("slotName").toString());
    }
    return session;
  }
}
