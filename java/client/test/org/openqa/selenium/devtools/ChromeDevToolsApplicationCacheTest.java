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

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.devtools.applicationcache.ApplicationCache;
import org.openqa.selenium.devtools.applicationcache.model.FrameWithManifest;

import java.util.List;

public class ChromeDevToolsApplicationCacheTest extends DevToolsTestBase {

  @Test
  public void getAllCacheData() {
    devTools.addListener(ApplicationCache.applicationCacheStatusUpdated(), Assert::assertNotNull);
    devTools.addListener(ApplicationCache.networkStateUpdated(), Assert::assertNotNull);
    devTools.send(ApplicationCache.enable());
    driver.get(appServer.whereIs("simpleTest.html"));
    driver.navigate().to(appServer.whereIs("simpleTest.html"));
    List<FrameWithManifest> framesWithManifests =
        devTools.send(ApplicationCache.getFramesWithManifests());
  }
}
