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

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Predicate;
import java.util.logging.Logger;

import org.openqa.selenium.Beta;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.bidi.network.AddInterceptParameters;
import org.openqa.selenium.bidi.network.InterceptPhase;

@Beta
class RemoteNetwork implements Network {

  private static final Logger LOG = Logger.getLogger(RemoteNetwork.class.getName());

  private final BiDi biDi;
  private final org.openqa.selenium.bidi.module.Network network;

  private final Map<Long, AuthDetails> authHandlers = new ConcurrentHashMap<>();

  private final AtomicLong callBackId = new AtomicLong(1);

  public RemoteNetwork(WebDriver driver) {
    this.biDi = ((HasBiDi) driver).getBiDi();
    this.network = new org.openqa.selenium.bidi.module.Network(driver);

    interceptAuthTraffic();
  }

  private void interceptAuthTraffic() {
    this.network.addIntercept(new AddInterceptParameters(InterceptPhase.AUTH_REQUIRED));

    network.onAuthRequired(
        responseDetails -> {
          String requestId = responseDetails.getRequest().getRequestId();

          try {
            URL url = new URL(responseDetails.getRequest().getUrl());
            Optional<UsernameAndPassword> authCredentials = getAuthCredentials(url);
            if (authCredentials.isPresent()) {
              network.continueWithAuth(requestId, authCredentials.get());
              return;
            }
          } catch (MalformedURLException e) {
            LOG.warning("Received Malformed URL: " + e.getMessage());
          }

          network.continueWithAuthNoCredentials(requestId);
        });
  }

  private Optional<UsernameAndPassword> getAuthCredentials(URL url) {
    return authHandlers.values().stream()
        .filter(authDetails -> authDetails.getFilter().test(url))
        .map(AuthDetails::getUsernameAndPassword)
        .findFirst();
  }

  @Override
  public long addAuthenticationHandler(UsernameAndPassword usernameAndPassword) {
    return addAuthenticationHandler(url -> true, usernameAndPassword);
  }

  @Override
  public long addAuthenticationHandler(
      Predicate<URL> filter, UsernameAndPassword usernameAndPassword) {
    long id = this.callBackId.incrementAndGet();

    authHandlers.put(id, new AuthDetails(filter, usernameAndPassword));
    return id;
  }

  @Override
  public void removeAuthenticationHandler(long id) {
    authHandlers.remove(id);
  }

  @Override
  public void clearAuthenticationHandlers() {
    authHandlers.clear();
  }

  private class AuthDetails {
    private final Predicate<URL> filter;
    private final UsernameAndPassword usernameAndPassword;

    public AuthDetails(Predicate<URL> filter, UsernameAndPassword usernameAndPassword) {
      this.filter = filter;
      this.usernameAndPassword = usernameAndPassword;
    }

    public Predicate<URL> getFilter() {
      return filter;
    }

    public UsernameAndPassword getUsernameAndPassword() {
      return usernameAndPassword;
    }
  }
}
