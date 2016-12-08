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

package org.openqa.grid.internal.utils.configuration.converters;

import com.beust.jcommander.IStringConverter;

import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

public class BrowserDesiredCapabilityConverter implements IStringConverter<DesiredCapabilities> {
  @Override
  public DesiredCapabilities convert(String value) {
    DesiredCapabilities capabilities = new DesiredCapabilities();
    for (String cap : value.split(",")) {
      String[] pieces = cap.split("=");
      String capabilityName = pieces[0].trim();
      String capabilityValue = pieces[1].trim();
      if (capabilityName.equals(CapabilityType.VERSION)) {
        // store version as a string, DesiredCapabilities assumes version is a string
        capabilities.setCapability(capabilityName, capabilityValue);
        continue;
      }
      try {
        final Long x = Long.parseLong(capabilityValue);
        capabilities.setCapability(capabilityName, x);
      } catch (NumberFormatException e) {
        // ignore the exception. process as boolean or string.
        if (capabilityValue.equals("true") || capabilityValue.equals("false")) {
          capabilities.setCapability(capabilityName, Boolean.parseBoolean(capabilityValue));
        } else {
          capabilities.setCapability(capabilityName, capabilityValue);
        }
      }
    }
    return capabilities;
  }
}
