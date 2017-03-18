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


package org.openqa.selenium.testing.drivers;

import com.google.common.collect.Sets;

import org.openqa.selenium.Platform;
import org.openqa.selenium.testing.Driver;
import org.openqa.selenium.testing.Ignore;

import java.util.Set;

public class IgnoreComparator {
  private Set<Driver> ignored = Sets.newHashSet();
  private Platform currentPlatform = Platform.getCurrent();

  // TODO(simon): reduce visibility
  public void addDriver(Driver driverToIgnore) {
    ignored.add(driverToIgnore);
  }

  public void setCurrentPlatform(Platform platform) {
    currentPlatform = platform;
  }

  public boolean shouldIgnore(Ignore ignoreAnnotation) {
    if (ignoreAnnotation == null) {
      return false;
    }

    if (ignoreAnnotation.value().length == 0) {
      return true;
    }

    for (Driver value : ignoreAnnotation.value()) {
      if (ignored.contains(value) || value == Driver.ALL) {
        for (Platform platform : ignoreAnnotation.platforms()) {
          if (currentPlatform.is(platform)) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
