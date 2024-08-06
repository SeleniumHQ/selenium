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

package org.openqa.selenium.remote;

import java.util.HashMap;
import java.util.Map;
import org.openqa.selenium.Beta;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.bidi.network.AddInterceptParameters;
import org.openqa.selenium.bidi.network.InterceptPhase;

@Beta
class RemoteNetwork implements Network {

  private final BiDi biDi;
  private final org.openqa.selenium.bidi.module.Network network;

  private final Map<Long, String> authCallbackIdMap = new HashMap<>();

  public RemoteNetwork(WebDriver driver) {
    this.biDi = ((HasBiDi) driver).getBiDi();
    this.network = new org.openqa.selenium.bidi.module.Network(driver);
  }

  @Override
  public long addAuthenticationHandler(UsernameAndPassword usernameAndPassword) {
    String intercept =
        network.addIntercept(new AddInterceptParameters(InterceptPhase.AUTH_REQUIRED));

    long id =
        network.onAuthRequired(
            responseDetails ->
                network.continueWithAuth(
                    responseDetails.getRequest().getRequestId(), usernameAndPassword));

    authCallbackIdMap.put(id, intercept);
    return id;
  }

  @Override
  public void removeAuthenticationHandler(long id) {
    String intercept = authCallbackIdMap.get(id);

    if (intercept != null) {
      network.removeIntercept(intercept);
      this.biDi.removeListener(id);
      authCallbackIdMap.remove(id);
    }
  }

  @Override
  public void clearAuthenticationHandlers() {
    authCallbackIdMap.forEach(
        (callback, intercept) -> {
          network.removeIntercept(intercept);
          this.biDi.removeListener(callback);
        });

    authCallbackIdMap.clear();
  }
}
