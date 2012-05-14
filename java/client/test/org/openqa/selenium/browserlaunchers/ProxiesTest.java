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

package org.openqa.selenium.browserlaunchers;

import org.junit.Test;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;

public class ProxiesTest {
  @Test
  public void constructingWithNullKeysWorksAsExpected() {
    Map<String, String> rawProxy = new HashMap<String, String>();
    rawProxy.put("ftpProxy", null);
    rawProxy.put("httpProxy", "http://www.example.com");
    rawProxy.put("autodetect", null);
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(CapabilityType.PROXY, rawProxy);

    Proxy proxy = Proxies.extractProxy(caps);

    assertNull(proxy.getFtpProxy());
    assertFalse(proxy.isAutodetect());
    assertEquals("http://www.example.com", proxy.getHttpProxy());
  }
}
