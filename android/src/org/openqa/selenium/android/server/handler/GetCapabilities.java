/*
Copyright 2010 WebDriver committers

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

package org.openqa.selenium.android.server.handler;

import com.google.common.collect.Maps;

import android.os.Build;

import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.GetSessionCapabilities;

import java.util.Map;

/**
 * @author berrada@google.com (Dounia Berrada)
 */
public class GetCapabilities extends GetSessionCapabilities {

  public GetCapabilities(Session session) {
    super(session);
  }

  @Override
  protected Map<String, Object> describeSession(Map<String, Object> capabilities) {
    // Creating a new map because the map received is not modifiable.
    Map<String, Object> caps = Maps.newHashMap();
    caps.putAll(capabilities);
    caps.put(CapabilityType.TAKES_SCREENSHOT, true);
    caps.put(CapabilityType.BROWSER_NAME, "android");
    caps.put(CapabilityType.ROTATABLE, true);
    caps.put(CapabilityType.PLATFORM, "android");
    caps.put(CapabilityType.SUPPORTS_ALERTS, true);
    caps.put(CapabilityType.SUPPORTS_JAVASCRIPT, true);
    caps.put(CapabilityType.VERSION, Build.VERSION.SDK);
    caps.put(CapabilityType.ACCEPT_SSL_CERTS, true);
    return caps;
  }
}
