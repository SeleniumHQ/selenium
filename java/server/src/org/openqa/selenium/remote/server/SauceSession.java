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

package org.openqa.selenium.remote.server;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.jmx.JMXHelper;
import org.openqa.selenium.remote.server.jmx.ManagedService;

import java.net.URL;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;

@ManagedService
public class SauceSession extends RemoteSession {

  private SauceSession(
      Dialect downstream,
      Dialect upstream,
      SessionCodec codec,
      SessionId id,
      Map<String, Object> capabilities) {
    super(downstream, upstream, codec, id, capabilities);

    new JMXHelper().register(this);
  }

  @Override
  protected void doStop() {
    getWrappedDriver().quit();
  }

  public static class Factory extends RemoteSession.Factory<Void> {

    private final URL sauceUrl;

    public Factory(URL url) {
      this.sauceUrl = Objects.requireNonNull(url, "SauceLabs URL must be set");
    }

    @Override
    public boolean isSupporting(Capabilities capabilities) {
      return true;
    }

    @Override
    public Optional<ActiveSession> apply(
        Set<Dialect> downstreamDialects,
        Capabilities capabilities) {
      return performHandshake(null, sauceUrl, downstreamDialects, capabilities);
    }

    @Override
    protected SauceSession newActiveSession(
        Void ignored,
        Dialect downstream,
        Dialect upstream,
        SessionCodec codec,
        SessionId id,
        Map<String, Object> capabilities) {
      return new SauceSession(downstream, upstream, codec, id, capabilities);
    }

    @Override
    public String toString() {
      return getClass() + " (provider: Sauce Labs)";
    }
  }

  public ObjectName getObjectName() throws MalformedObjectNameException {
    return new ObjectName(String.format("org.seleniumhq.server:type=Session,browser=\"%s\",id=%s",
                                        getCapabilities().get("browserName"), getId()));
  }
}
