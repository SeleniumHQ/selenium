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

import static org.junit.Assert.assertNotNull;

import org.junit.Test;

import java.util.Set;

public class ChromeDevToolsTargetTest extends ChromeDevToolsTestBase {

  @Test
  public void getTargetsActivateThemAndSeeAllData() {
    chromeDriver.get(appServer.whereIs("devToolsConsoleTest.html"));
    Set<Target.TargetInfo> allTargets = devTools.send(Target.getTargets());
    allTargets.forEach(target -> {
      validateTarget(target);
      Target.SessionId sessionId = devTools.send(Target.attachToTarget(target.getTargetId()));
      validateSession(sessionId);
    });
  }

  private void validateTarget(Target.TargetInfo targetInfo) {
    assertNotNull(targetInfo);
    assertNotNull(targetInfo.getTargetId());
    assertNotNull(targetInfo.getTitle());
    assertNotNull(targetInfo.getType());
    assertNotNull(targetInfo.getUrl());

  }

  private void validateSession(Target.SessionId sessionId) {
    assertNotNull(sessionId);
  }

}
